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
import { Button, Divider, List, ListItem } from "@mui/material";
import { theme } from "@/wrappers/NormalPageWrapper";
import { AuthContext } from "@/contexts/AuthContext";

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

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {[
          // "Generate Advertisement PDF",
          // "Project Selection Survey",
          // "Project Team Assignments and Stats",
          // "SME Advertisements and Stats",
          // "Mentor Assignment",
          { "Student Dashboard": "/students" },
          { "Team Quick Stats": "/quick_stats" },
          // "Canvas Group Files",
          // "Generate Expo book",
          { "Custom SQL Query": "/sql" },
        ].map((text, index) => (
          <ListItem
            button
            key={Object.keys(text)[0]}
            component={Button}
            href={Object.values(text)[0]}
          >
            {Object.keys(text)[0]}
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Senior Design Glue
          </Typography>
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
        <Box sx={{ ml: "10px" }}>
          <Tooltip title="Logout">
            <IconButton color="primary" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
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
