# Nexar POC — Demo App Summary

Context: This is a proof of concept (POC) to validate how our chosen tools and technologies align for the actual app. The demo app stitches together a React + Redux front-end, a Node.js mock backend with REST and WebSocket (WS), and reusable visualization components.

## Goals

- Validate tech stack integration (React + Redux + Vite + Material UI) for UI and state management.
- Prototype a mock server exposing REST for offline data and WS for live streaming.
- Demonstrate live stream controls and states: Ready/Idle, Streaming, Paused, and Reset.
- Use multiple seed-data sources to emulate different sessions; pick randomly on live start.
- Prove a modular layout that renders arbitrary “View” components via props.
- Integrate Signal and Packet components from our reusable assets package.

## Tech Stack

- Client: React 18, Redux Toolkit + react-redux, Vite, Material UI (MUI)
- Server: Node.js, Express, ws (WebSocket), CORS
- Reusable components: GRL-SW-Assets (published as `grl-react-assets`)

## Architecture Overview

- Client (Vite dev server): http://localhost:5173
  - Connects to WS server provided by our Node backend.
  - Dispatches actions to manage WS connection and incoming data.
  - Can load offline data via REST and render in charts.
- Server (single HTTP + WS server): http://localhost:3003
  - REST endpoint to fetch seed data.
  - WebSocket endpoint for live streaming, including start/pause/reset controls.
  - Uses multiple seed files as dummy data sources.

## Implemented Features

- React + Redux + Vite + MUI project structure
- Mock backend with both REST and WS:
- - REST for offline data loading.
  - WebSocket for live streaming data with controllable states.
- WebSocket states and actions:
  - Ready/Idle: connection open, not streaming yet.
  - Streaming: server appends and broadcasts data periodically.
  - Paused: streaming loop halted; state retained.
  - Reset: streaming stopped, state cleared, empty payload broadcast.
- Offline data loading via REST.
- Seed data strategy: multiple seed files; each live session randomly selects one.
- Modular Layout component: accepts `View` props (components) and renders a split-pane layout.
- Integration of Signal and Packet components from `grl-react-assets`.

## Key Endpoints and Protocols

- REST
  - GET `http://localhost:3003/api/v1/getDummyData/:id`
    - Returns the seed data for a given `id` (1..7).
    - Client constant: `API_URL = "/api/v1/getDummyData/"` (see `client/src/Components/LiveStreamData.jsx`).
- WebSocket
  - URL: `ws://localhost:3003/ws`
  - Client flows:
    - Connect using the Controls UI (default points to the WS URL above).
    - After connecting, use Live controls to send JSON messages:
      - `{ "action": "startLiveStream" }` — primes with initial 50 points and starts periodic streaming (~1s cadence, appending chunks of 50).
      - `{ "action": "pauseLiveStream" }` — pauses the loop; keeps current cumulative data and cursors.
      - `{ "action": "resetLiveStream" }` — stops streaming, clears state, and sends an empty payload (metadata preserved).

## Data & Seed Strategy

- Seed files: `server/seed/seedData-1.js` … `seedData-7.js` (dummy data).
- On each WS connection, the server picks a random seed file and initializes stream state.
- Streams are currently keyed for axes `"2"` and `"3"` when present in the seed.
- Each WS broadcast payload includes:
  - `displayDataChunk`: cumulative stream data (or the first 50 on initial snapshot).
  - `startDataLongTime`, `endDataLongTime`, `absoluteStartTime`, `absoluteEndTime`.
  - `yaxisMax`, `yaxisMin`.

## Notable Client Components & Files

- `client/src/Components/connectionControls/Controls.jsx`
  - Connects/disconnects WebSocket using a user-provided address (defaults to `ws://localhost:3003/ws`).
  - Reflects connection status via Redux (`connected`, `connecting`, `disconnected`).
- `client/src/Components/LiveStreamData.jsx`
  - Sends live stream control actions: start/pause/reset.
  - Loads offline data from REST.
- `client/src/Components/Signal/Signal.jsx`
  - Renders signal chart(s) using `SignalChart` from `grl-react-assets`.
  - Consumes Redux `signalData` (either offline load or streamed cumulative data).
- `client/src/Components/Layout.results.component.jsx`
  - Split-pane layout that accepts view components via props (e.g., `View1`, `View2`, `View3`).

## Notable Server Files

- `server/index.js`
  - Express app with CORS for Vite origin (`http://localhost:5173`).
  - REST endpoint: `/api/v1/getDummyData/:id`.
  - WebSocket server: path `/ws`.
  - Live stream engine:
    - On first subscriber, primes an initial snapshot (50 points per stream).
    - Periodically (every 1000 ms) appends a chunk (50) and broadcasts cumulative payload.
    - Supports `startLiveStream`, `pauseLiveStream`, `resetLiveStream` actions.
- `server/seed/seedData-*.js`
  - Dummy datasets used to emulate offline and live data.

## How to Run (Local)

- Prerequisites: Node.js LTS installed.
- Install and run the server (port 3003):
  - In `server/`: `npm install`, then `npm start`.
- Install and run the client (Vite dev server at port 5173):
  - In `client/`: `npm install`, then `npm run dev`.
- In the UI:
  - Open http://localhost:5173.
  - Set WS address to `ws://localhost:3003/ws` (or click “Use default socket address”).
  - Connect, then use Start/Pause/Reset to control the live stream.
  - Use “Load Offline Data” to fetch and render seed data via REST.

## Status for WBS (Done ✅)

- [X] Project scaffolding with React + Redux + Vite + MUI.
- [X] Modular layout component that accepts `View` props and renders split panes.
- [X] Mock server with REST and WebSocket endpoints.
- [X] Offline data loading via REST.
- [X] Live data streaming via WS with Ready, Pause, and Reset states.
- [X] Random seed file selection per live session.
- [X] Integration of Signal and Packet components from `grl-react-assets`.

## Assumptions & Notes

- Current pause/reset semantics are global to the server’s streaming loop for connected subscribers; can be refined to per-connection state if required by the final design.
- WS messages use simple JSON `{ action: string }` and expect the client to manage UI state for mode transitions.
- CORS is configured for Vite’s default origin during development.

## Next Steps (Optional Enhancements)

- Add reconnection and backoff strategies for WS.
- Improve error handling and user feedback for WS/REST failures.
- Add unit/integration tests and type safety (TypeScript) for production readiness.
- Externalize configuration (ports, endpoints) via env files.
- Containerize server/client for uniform environments and CI.
