import React, { useEffect } from "react";
import "./Controls.css";
import {
  fetchSignalDataStart,
  fetchSignalDataSuccess,
} from "../../Reducers/signal.actions";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConnectionDataStart,
  fetchConnectionDataFailure,
  onSocketConnect,
  onSocketDisconnect,
} from "../../Reducers/Connection/connection.reducer";
import { Button, TextField, Stack, ButtonGroup, Chip } from "@mui/material";

const Controls = () => {
  // derive status from Redux instead of local state
  const dispatch = useDispatch();
  const socketConnection = useSelector(
    (state) => state.connection.socketConnection
  );
  const loading = useSelector((state) => state.connection.loading);
  const error = useSelector((state) => state.connection.error);

  const [socketAddress, setSocketAddress] = React.useState("");
  const DEFAULT_SOCKET_URL = "ws://localhost:3003/ws";
  const status = socketConnection
    ? "connected"
    : loading
    ? "connecting"
    : "disconnected";
  const isConnected = status === "connected";
  const isDisconnected = status === "disconnected";
  const canConnect = !!socketAddress && !isConnected;

  const onConnect = () => {
    console.log("Connect to WS clicked");
    dispatch(fetchConnectionDataStart());

    let ws;
    try {
      ws = new WebSocket(socketAddress);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        dispatch(onSocketConnect(ws));
      };

      ws.onerror = (evt) => {
        console.error("WebSocket error", evt);
        dispatch(fetchConnectionDataFailure("WebSocket error"));
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        dispatch(onSocketDisconnect());
      };
    } catch (e) {
      console.error("WebSocket connection failed:", e);
      dispatch(fetchConnectionDataFailure(e?.message || "Connection failed"));
    }
  };

  const onDisconnect = () => {
    console.log("Disconnect WS clicked");
    if (socketConnection) {
      try {
        socketConnection.close();
        // onclose handler will dispatch onSocketDisconnect
      } catch (e) {
        console.error("Error closing WebSocket", e);
        dispatch(onSocketDisconnect());
      }
    }
  };

  React.useEffect(() => {
    console.log("socketConnection in store:", socketConnection);
  }, [socketConnection]);

  return (
    <div className="controls-container">
      <Stack className="input-group" spacing={1}>
        <TextField
          id="outlined-basic"
          label="Enter the socket address"
          variant="outlined"
          value={socketAddress}
          onChange={(e) => setSocketAddress(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="e.g. ws://localhost:8080"
          //   error={!socketAddress && !isConnected}
          helperText={
            !socketAddress && !isConnected
              ? "Socket address is required to connect."
              : " "
          }
        />
        <Button
          variant="text"
          onClick={() => setSocketAddress(DEFAULT_SOCKET_URL)}
          disabled={isConnected}
        >
          Use default socket address
        </Button>
      </Stack>

      <div className="button-group">
        <ButtonGroup>
          <Button
            variant="contained"
            color="success"
            onClick={onConnect}
            disabled={!canConnect}
          >
            Connect to WS
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onDisconnect}
            disabled={isDisconnected}
          >
            Disconnect WS
          </Button>
        </ButtonGroup>
      </div>

      <div className={`status-indicator ${status}`}>
        <Chip
          label={`Status: ${status}`}
          color={
            status === "connected"
              ? "success"
              : status === "error"
              ? "error"
              : "default"
          }
          variant="outlined"
          size="small"
        />
      </div>

      {/* show error if any */}
      {error ? (
        <div style={{ color: "red", marginTop: 8 }}>{String(error)}</div>
      ) : null}
    </div>
  );
};

export default Controls;
// ws.onerror = (err) => {
//       console.error("WebSocket error", err);
//       setStatus("error");
//     };
//     ws.onclose = () => {
//       console.log("WebSocket closed");
//       setStatus("disconnected");
//     };
//     ws.onmessage = (event) => {
//       dispatch(fetchSignalDataStart());
//       console.log("Message from server ", event.data);
//       // Handle incoming messages here
//       const message = JSON.parse(event.data);
//       dispatch(fetchSignalDataSuccess(message));
//     };
