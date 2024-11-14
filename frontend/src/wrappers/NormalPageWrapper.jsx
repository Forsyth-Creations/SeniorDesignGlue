import Navigation from "@/components/Toolbars/Navbar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

// Create a page

export default function NormalPageWrapper({ children }) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navigation />
        {children}
      </ThemeProvider>
    </>
  );
}
