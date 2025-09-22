import React from "react";
import "./Controls.css";
import { fetchSignalDataStart, fetchSignalDataSuccess } from "../Reducers/signal.actions";
import { useDispatch } from "react-redux";

const Controls = () => {
  const [status, setStatus] = React.useState("disconnected");
  const [socket, setSocket] = React.useState(null);
  const dispatch = useDispatch();
  const onConnect = () => {
    // Implement WebSocket connection logic here
    console.log("Connect to WS clicked");
    // Add your WebSocket connection code here
    const ws = new WebSocket("ws://localhost:3003/ws");
    setSocket(ws);
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      dispatch(fetchSignalDataStart());
      console.log("Message from server ", event.data);
      // Handle incoming messages here

      const message = JSON.parse(event.data);
      dispatch(fetchSignalDataSuccess(message));
    };
  };

  const onDisconnect = () => {
    // Implement WebSocket disconnection logic here
    console.log("Disconnect WS clicked");
    if (socket) {
      socket.close();
      setStatus("disconnected");
      setSocket(null);
    }
    return;
  };

  return (
    <div className="controls-container">
      <div className="button-group">
        <button
          className={`control-button connect-btn ${
            status === "connected" ? "disabled" : ""
          }`}
          onClick={onConnect}
          disabled={status === "connected"}
        >
          Connect to WS
        </button>
        <button
          className={`control-button disconnect-btn ${
            status === "disconnected" ? "disabled" : ""
          }`}
          onClick={onDisconnect}
          disabled={status === "disconnected"}
        >
          Disconnect WS
        </button>
      </div>
      <div className={`status-indicator ${status}`}>
        <span className="status-dot"></span>
        Status: {status}
      </div>
    </div>
  );
};

export default Controls;
