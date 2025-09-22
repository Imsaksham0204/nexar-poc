const express = require('express');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

// Load seed data (supports different export styles)
const seedModule = require('./seedData');
const seedData = (seedModule && (seedModule.seedData || seedModule.default || seedModule)) || null;

// Resolve keys and helpers
const STREAM_KEYS = ['2', '3'].filter((k) => seedData && (seedData[k] ?? seedData[Number(k)]));
const cursors = Object.fromEntries(STREAM_KEYS.map((k) => [k, 0]));
const cumulative = Object.fromEntries(STREAM_KEYS.map((k) => [k, []]));

function getSourceForKey(key) {
  return seedData ? (seedData[key] ?? seedData[Number(key)]) : null;
}

function takeNextChunk(key, size) {
  const src = getSourceForKey(key);
  if (!src) return [];
  const arr = Array.isArray(src.displayDataChunk) ? src.displayDataChunk : [];
  if (arr.length === 0) return [];

  const start = cursors[key] || 0;
  const remaining = arr.length - start;

  let chunk;
  if (remaining >= size) {
    chunk = arr.slice(start, start + size);
    cursors[key] = (start + size) % arr.length;
  } else {
    // wrap
    const headNeeded = size - remaining;
    chunk = arr.slice(start).concat(arr.slice(0, headNeeded));
    cursors[key] = headNeeded % arr.length;
  }
  return chunk;
}

function buildPayload(limit) {
  const payload = {};
  STREAM_KEYS.forEach((k) => {
    const src = getSourceForKey(k);
    if (!src) return;
    const data = cumulative[k];
    payload[k] = {
      displayDataChunk: typeof limit === 'number' ? data.slice(0, limit) : data,
      startDataLongTime: src.startDataLongTime,
      endDataLongTime: src.endDataLongTime,
      absoluteStartTime: src.absoluteStartTime,
      absoluteEndTime: src.absoluteEndTime,
      yaxisMax: src.yaxisMax,
      yaxisMin: src.yaxisMin,
    };
  });
  return payload;
}

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Create a single HTTP server for both Express and WS
const server = http.createServer(app);

// Attach WebSocket server (optional path)
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WS client connected');
  ws.send(JSON.stringify({ type: 'welcome', timestamp: Date.now() }));

  // Prime first 50 on first connection (start the global stream from the beginning)
  const isFirstPayload = STREAM_KEYS.every((k) => cumulative[k].length === 0);
  if (isFirstPayload) {
    STREAM_KEYS.forEach((k) => {
      const next = takeNextChunk(k, 50);
      if (next.length) cumulative[k].push(...next);
    });
  }

  // Send only the initial 50 to this client immediately (not the whole cumulative)
  const snapshot = JSON.stringify(buildPayload(50));
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(snapshot);
  }

  ws.on('close', () => console.log('WS client disconnected'));
});

// Broadcast cumulative payload to all connected clients every 3 seconds,
// appending 50 new points per stream (with wrap-around).
const INTERVAL_MS = 1000;
setInterval(() => {
  try {
    STREAM_KEYS.forEach((k) => {
      const next = takeNextChunk(k, 50);
      if (next.length) cumulative[k].push(...next);
    });

    const json = JSON.stringify(buildPayload());
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  } catch (err) {
    console.error('Error building/sending payload:', err);
  }
}, INTERVAL_MS);

server.listen(3003, () => {
  console.log('HTTP server listening on http://localhost:3003');
  console.log('WS server listening on ws://localhost:3003/ws');
});

