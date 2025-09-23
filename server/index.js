const express = require('express');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const cors = require('cors');

// Load seed data per-connection (supports different export styles)
let seedData = null;

// Resolve keys and helpers (mutable to re-init per connection)
let STREAM_KEYS = [];
let cursors = {};
let cumulative = {};

function chooseRandomSeedAndInit() {
  const MAX_FILES = 7;
  const choice = 1 + Math.floor(Math.random() * MAX_FILES);
  const modulePath = `./seed/seedData-${choice}`;
  const seedModule = require(modulePath);
  seedData = (seedModule && (seedModule.seedData || seedModule.default || seedModule)) || null;

  STREAM_KEYS = ['2', '3'].filter((k) => seedData && (seedData[k] ?? seedData[Number(k)]));
  cursors = Object.fromEntries(STREAM_KEYS.map((k) => [k, 0]));
  cumulative = Object.fromEntries(STREAM_KEYS.map((k) => [k, []]));

  console.log(`WS connection: using ${modulePath} with keys [${STREAM_KEYS.join(', ')}]`);
}

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
app.use(cors({ origin: 'http://localhost:5173' })); // allow Vite dev origin

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/v1/getDummyData/:id', (req, res) => {
  const reqId = req.params.id;
  const modulePath = `./seed/seedData-${reqId}`;
  const seedModule = require(modulePath);
  const seedData = (seedModule && (seedModule.seedData || seedModule.default || seedModule)) || null;

  console.log(`Received request for dummy data id=${reqId}`);
  res.json({ status: 'ok', seedId: reqId, seedData });
});

// Create a single HTTP server for both Express and WS
const server = http.createServer(app);

// Attach WebSocket server (optional path)
const wss = new WebSocketServer({ server, path: '/ws' });

// Track subscribers who explicitly requested live streaming
const subscribers = new Set();
let streamingInterval = null;
const INTERVAL_MS = 1000;
let isPaused = false; // NEW

// Prime the first 50 only once (from the start of the data)
function ensurePrimed() {
  const isFirstPayload = STREAM_KEYS.every((k) => cumulative[k].length === 0);
  if (isFirstPayload) {
    STREAM_KEYS.forEach((k) => {
      const next = takeNextChunk(k, 50);
      if (next.length) cumulative[k].push(...next);
    });
  }
}

// NEW: helpers to pause and reset
function pauseStreaming() {
  if (streamingInterval) {
    clearInterval(streamingInterval);
    streamingInterval = null;
  }
  isPaused = true;
}

function resetStreaming() {
  // stop interval
  if (streamingInterval) {
    clearInterval(streamingInterval);
    streamingInterval = null;
  }
  isPaused = true;

  // reset state
  STREAM_KEYS.forEach((k) => {
    cursors[k] = 0;
    cumulative[k] = [];
  });

  // send empty payload (metadata preserved, displayDataChunk empty)
  const emptyJson = JSON.stringify(buildPayload(0));
  subscribers.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(emptyJson);
    } else {
      subscribers.delete(client);
    }
  });
}

// Start the streaming loop (append next 50 and send to subscribers)
function startStreamingLoop() {
  if (streamingInterval || isPaused) return; // UPDATED: respect pause
  streamingInterval = setInterval(() => {
    try {
      STREAM_KEYS.forEach((k) => {
        const next = takeNextChunk(k, 50);
        if (next.length) cumulative[k].push(...next);
      });

      const json = JSON.stringify(buildPayload());
      // Send only to clients that requested live streaming
      subscribers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(json);
        } else {
          subscribers.delete(client);
        }
      });
    } catch (err) {
      console.error('Error building/sending payload:', err);
    }
  }, INTERVAL_MS);
}

wss.on('connection', (ws) => {
  console.log('WS client connected');

  // Pick a random seed and initialize state for this connection
  chooseRandomSeedAndInit();

  // Do nothing on connect. Wait for the client message to start streaming.
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return; // ignore non-JSON messages
    }
    console.log(msg);

    if (!msg || typeof msg.action !== 'string') return;

    switch (msg.action) {
      case 'startLiveStream': {
        const firstTime = !subscribers.has(ws);
        if (firstTime) {
          subscribers.add(ws);

          // Ensure the stream is primed from the beginning once someone requests it
          ensurePrimed();

          // Send only the initial 50 to this client immediately
          const snapshot = JSON.stringify(buildPayload(50));
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(snapshot);
          }
        }

        // Resume/start the periodic streaming loop
        isPaused = false; // allow loop to run
        startStreamingLoop();
        break;
      }

      case 'pauseLiveStream': {
        // Pause global streaming, retain current cumulative data and cursors
        pauseStreaming();
        break;
      }

      case 'resetLiveStream': {
        // Stop, clear all state, and broadcast empty payload
        resetStreaming();
        break;
      }

      default:
        // ignore unknown actions
        break;
    }
  });

  ws.on('close', () => {
    subscribers.delete(ws);
    // Stop the loop if nobody is listening
    if (subscribers.size === 0 && streamingInterval) {
      clearInterval(streamingInterval);
      streamingInterval = null;
    }
    console.log('WS client disconnected');
  });
});

server.listen(3003, () => {
  console.log('HTTP server listening on http://localhost:3003');
  console.log('WS server listening on ws://localhost:3003/ws');
});

