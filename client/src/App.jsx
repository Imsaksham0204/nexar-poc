import {
  AppBar,
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import DashboardLayoutComp from "./Components/DashboardLayoutComp.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchSignalDataStart, fetchSignalDataSuccess } from "./Reducers/signal.actions.js";

const drawerWidth = 240;

const navItems = [
  { id: "connection", label: "Connection", secondary: "Connection Details" },
  { id: "results", label: "Results Page", secondary: "Results Overview" },
  {
    id: "json analytics",
    label: "JSON Analytics",
    secondary: "Analyze your JSON data",
  },
];
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});

function App() {
  const [selected, setSelected] = useState(navItems[0]);
  const socketConnection = useSelector(
    (state) => state.connection.socketConnection
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (socketConnection) {
      // Implement your logic here
      socketConnection.onmessage = (event) => {
        dispatch(fetchSignalDataStart());
        // console.log("Message from server ", event.data);
        // Handle incoming messages here

        const message = JSON.parse(event.data);
        dispatch(fetchSignalDataSuccess(message));
      };
    }
  }, [socketConnection]);
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <ThemeProvider theme={darkTheme}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          color="primary"
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Nexar POC
            </Typography>
          </Toolbar>
        </AppBar>
      </ThemeProvider>

      <Sidebar
        items={navItems}
        selectedId={selected?.id}
        onSelect={setSelected}
        width={drawerWidth}
        title="Dashboard"
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Offset for AppBar height */}
        <Toolbar />

        <DashboardLayoutComp sidebarId={selected?.id} />
      </Box>
    </Box>
  );
}

export default App;
