import { Box, Stack, Button, ButtonGroup, Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSignalDataStart, fetchSignalDataSuccess } from "../Reducers/signal.actions";

const START_ACTION = "startLiveStream"; // change to "startLiveMode" if server expects that
const PAUSE_ACTION = "pauseLiveStream";
const RESET_ACTION = "resetLiveStream";
export const API_URL = "/api/v1/getDummyData/";

const LiveStreamData = () => {
  const socketConnection = useSelector((state) => state.connection.socketConnection);

  const [mode, setMode] = useState("idle"); // 'idle' | 'streaming' | 'paused'
  const [isConnected, setIsConnected] = useState(false);

  const dispatch = useDispatch();
  // Track WebSocket connection state
  useEffect(() => {
    if (!socketConnection) {
      setIsConnected(false);
      setMode("idle");
      return;
    }
    const ws = socketConnection;
    const updateConnected = () => setIsConnected(ws.readyState === 1);
    const handleOpen = () => updateConnected();
    const handleClose = () => {
      setIsConnected(false);
      setMode("idle");
    };

    updateConnected();
    ws.addEventListener?.("open", handleOpen);
    ws.addEventListener?.("close", handleClose);

    return () => {
      ws.removeEventListener?.("open", handleOpen);
      ws.removeEventListener?.("close", handleClose);
    };
  }, [socketConnection]);

  const canStart = useMemo(() => isConnected && mode !== "streaming", [isConnected, mode]);
  const canPause = useMemo(() => isConnected && mode === "streaming", [isConnected, mode]);
  const canReset = useMemo(() => isConnected && mode !== "idle", [isConnected, mode]);

  const safeSend = (payload) => {
    if (!socketConnection || socketConnection.readyState !== 1) return;
    socketConnection.send(JSON.stringify(payload));
  };

  const onLiveModeStart = () => {
    safeSend({ action: START_ACTION });
    setMode("streaming");
  };

  const onLiveModePause = () => {
    safeSend({ action: PAUSE_ACTION });
    setMode("paused");
  };

  const onLiveModeReset = () => {
    safeSend({ action: RESET_ACTION });
    setMode("idle");
  };

  const statusLabel =
    !isConnected ? "Disconnected" : mode === "streaming" ? "Streaming" : mode === "paused" ? "Paused" : "Idle";

  const statusColor = useMemo(
    () => (!isConnected ? "default" : mode === "streaming" ? "success" : mode === "paused" ? "warning" : "info"),
    [isConnected, mode]
  );

  const onLoadOfflineData = () => {
    dispatch(fetchSignalDataStart());
    fetch(`${API_URL}${1}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        dispatch(fetchSignalDataSuccess(data.seedData));
      })
      .catch((error) => {
        console.error("Error loading offline data:", error);
      });
  };
  return (
    <Box sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <ButtonGroup variant="contained" size="small" disableElevation>
          <Button onClick={onLiveModeStart} disabled={!canStart}>
            Start
          </Button>
          <Button color="warning" onClick={onLiveModePause} disabled={!canPause}>
            Pause
          </Button>
          <Button color="error" onClick={onLiveModeReset} disabled={!canReset}>
            Reset
          </Button>
          <Button color="error" onClick={onLoadOfflineData} disabled={mode === "streaming"}>
            Load Offline Data
          </Button>
        </ButtonGroup>
        <Chip size="small" label={statusLabel} color={statusColor} />
      </Stack>
    </Box>
  );
};

export default LiveStreamData;
