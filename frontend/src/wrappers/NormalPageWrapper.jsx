import Navigation from "@/components/Toolbars/Navbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";

// Create a page

export default function NormalPageWrapper({ children }) {
  return (
    <>
      <Box>
        <Navigation />
        {children}
      </Box>
    </>
  );
}
