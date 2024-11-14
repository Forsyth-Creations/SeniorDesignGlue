"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button, Divider, List, ListItem, Stack, Chip } from "@mui/material";
import { theme } from "@/wrappers/NormalPageWrapper";
import { AuthContext } from "@/contexts/AuthContext";

function WhichCohort() {
  // Check if we are in the spring semester or call semester
  // Also get the year

  const today = new Date();
  const month = today.getMonth();
  let year = today.getFullYear();

  // Remove the first two digits of the year
  year = year.toString().slice(2);

  if (month >= 0 && month <= 6) {
    return `S${year}`;
  }
  return `F${year}`;
}

function NextUp() {
  const today = new Date();
  const month = today.getMonth();
  let year = today.getFullYear();

  // Remove the first two digits of the year

  let month_car = "";
  if (month >= 0 && month <= 6) {
    month_car = "S";
  } else {
    month_car = "F";
  }

  let yearString = year.toString().slice(2);

  if (month_car === "S") {
    return `F${yearString}`;
  }
  let yearStringNext = (year + 1).toString().slice(2);
  return `S${yearStringNext}`;
}

function WhichClass() {
  const today = new Date();
  const month = today.getMonth();
  let year = today.getFullYear();

  return (
    <Stack>
      <Typography variant="caption" noWrap>
        {`Current: ${WhichCohort()}`}
      </Typography>
      <Typography variant="caption" noWrap>
        {`Next Up: ${NextUp()}`}
      </Typography>
    </Stack>
  );
}

export default function Navigation() {
  const auth = React.useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  function handleLogout() {
    auth.logout();
  }

  const PagesThatNeedAuth = [
    "Student Dashboard",
    "Team Quick Stats",
    "Custom SQL Query",
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          // "Generate Advertisement PDF",
          // "Project Selection Survey",
          { Cohorts: "/cohorts" },
          // "SME Advertisements and Stats",
          // "Mentor Assignment",
          { "Student Dashboard": "/students" },
          { "Team Quick Stats": "/quick_stats" },
          // "Canvas Group Files",
          // "Generate Expo book",
          { "Custom SQL Query": "/sql" },
        ].map((text, index) => {
          let isAuthed = PagesThatNeedAuth.includes(Object.keys(text)[0]);
          if (isAuthed && !auth.loggedIn) {
            return null;
          }
          return (
            <ListItem
              button
              key={Object.keys(text)[0]}
              component={Button}
              href={Object.values(text)[0]}
            >
              {Object.keys(text)[0]}
              {isAuthed && "*"}
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar
          component={Stack}
          direction="row"
          justifyContent={"space-between"}
          sx={{ width: "100%" }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            MDE Experience
          </Typography>
          <Tooltip title={WhichClass()}>
            <Chip
              component={Button}
              label={`Current: ${WhichCohort()}`}
              color="secondary"
              href={`/cohorts/${WhichCohort()}`}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
        {auth.loggedIn && (
          <Box sx={{ ml: "10px" }}>
            <Tooltip title="Logout">
              <IconButton color="primary" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        {/* Login button */}
        {!auth.loggedIn && (
          <Box sx={{ m: "10px" }}>
            <Tooltip title="Login">
              <Button
                color="primary"
                href="/login"
                variant="contained"
                sx={{ m: "10px" }}
              >
                Login
              </Button>
            </Tooltip>
          </Box>
        )}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Query copied to clipboard!"
      />
    </Box>
  );
}
