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
  Button,
} from "@mui/material";
import Signal from "./Signal/Signal";
import Controls from "./Controls";
import { useSelector } from "react-redux";
import LiveStreamData from "./LiveStreamData";

const DashboardLayoutComp = ({ sidebarId }) => {
  

  switch (sidebarId) {
    case "connection":
      return <Controls />;

    case "results":
      return (
        <Box maxWidth="lg">
          <Typography variant="h5" gutterBottom>
            Results Page
          </Typography>
          <LiveStreamData />
          <Signal />
        </Box>
      );
    default:
      return (
        <Container maxWidth="lg">
          <Typography variant="h5" gutterBottom>
            {sidebarId?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Dummy content for "{sidebarId?.label}". Replace this with your
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
      );
  }
};
export default DashboardLayoutComp;

//  <Box maxWidth="lg">
//       <Typography variant="h5" gutterBottom>
//         Results Page
//       </Typography>
//       <Signal />
//     </Box>
