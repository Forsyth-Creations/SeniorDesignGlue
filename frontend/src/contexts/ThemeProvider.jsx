"use client";

// Create an MUI theme provider

import React, { useContext, useEffect } from "react"; // Import useContext from react package
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/material";
import { deepOrange, grey } from "@mui/material/colors";

import { setCookie, getCookie } from "cookies-next";
import { LinearProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";



const commonText = {
  fontFamily: ["Poppins", "sans-serif"].join(","),
  h3: {
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 1.5,
    fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
  },
  h4: {
    fontSize: 36,
    fontWeight: 500,
    lineHeight: 1.5,
    fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
  },
  body: {
    fontSize: 36,
    fontWeight: 500,
    lineHeight: 1.5,
    fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
  },
};

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    // palette values for dark mode
    primary: {
      main: "#FFFFFF",
      light: "#9E3F5B",
      dark: "#6D1A33",
      background: "861F41",
    },
    secondary: {
      main: "#fff",
      light: "#222",
    },
    background: {
      default: "#121212",
      paper: "#861F41",
      modal: grey[900],
    },
    text: {
      primary: "#fff",
      secondary: grey[500],
    },
    forsythBlue: {
      main: "#861F41",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiBox: {
      defaultProps: {
        style: {
          backgroundColor: "transparent",
        },
      },
    },
  },
  typography: commonText,
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    // palette values for dark mode
    primary: {
      main: "#861F41",
      light: "#9E3F5B",
      dark: "#6D1A33",
      background: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
      light: "#eee",
    },
    background: {
      default: "#fff",
      paper: "#fff",
      modal: grey[100],
    },
    text: {
      primary: "#000",
      secondary: grey[500],
    },
    forsythBlue: {
      main: "#861F41",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiBox: {
      defaultProps: {
        style: {
          backgroundColor: "transparent",
        },
      },
    },
  },
  typography: commonText,
});

// Create a context for dark mode or light mode
export const DarkmodeContext = React.createContext(null);

// const localStorage = new LocalStorage("./settings");

export function DarkmodeWrapper(props) {
  const [isDark, setIsDarkFinal] = React.useState(null);

  // when the component mounts, check if the user has a preference for dark mode
  // if they do, set the dark mode to their preference

  useEffect(() => {
    const isDark =
      getCookie("isDark") !== undefined ? getCookie("isDark") === "true" : true;
    setIsDarkFinal(isDark);
  }, []);

  function setIsDark(isDark) {
    setIsDarkFinal(isDark);
    setCookie("isDark", isDark);
  }

  return (
    <DarkmodeContext.Provider value={{ isDark, setIsDark }}>
      {isDark === null ? (
        <Box sx={{ width: "100%", height: "100vh", backgroundColor: "black" }}>
          <LinearProgress />
        </Box>
      ) : (
        props.children
      )}
    </DarkmodeContext.Provider>
  );
}

export default function GlueTheme(props) {
  return (
    <Box>
      <DarkmodeWrapper>
        <ModifiedThemeProvider>{props.children}</ModifiedThemeProvider>
      </DarkmodeWrapper>
    </Box>
  );
}

function ModifiedThemeProvider(props) {
  const { isDark } = useContext(DarkmodeContext);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <ToastContainer
        stacked
        limit={3}
        // Darkmode toast styling
        autoClose={2000}
        pauseOnFocusLoss
        theme={isDark ? "dark" : "light"}
      />
      {props.children}
    </ThemeProvider>
  );
}
