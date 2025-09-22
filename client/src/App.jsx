import { useState } from "react";
import Sidebar from "./Components/Sidebar.jsx";
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Container,
  Paper,
  Grid,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import Signal from "./Components/Signal/Signal.jsx";
import Controls from "./Components/Controls.jsx";

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

        {selected.id === "results" ? (
          <Box maxWidth="lg">
            <Typography variant="h5" gutterBottom>
              Results Page
            </Typography>
            <Controls />
            <Signal />
          </Box>
        ) : (
          <Container maxWidth="lg">
            <Typography variant="h5" gutterBottom>
              {selected?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Dummy content for "{selected?.label}". Replace this with your
              component rendering.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, height: 240 }}>
                  Main Panel (e.g., charts, table)
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: 240 }}>
                  Side Panel (e.g., stats, filters)
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, height: 200 }}>
                  Full-width panel (e.g., recent activity)
                </Paper>
              </Grid>
            </Grid>
          </Container>
        )}
      </Box>
    </Box>
  );
}

export default App;
