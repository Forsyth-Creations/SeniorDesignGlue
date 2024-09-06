"use client";

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, CssBaseline, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
  },
});

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {['Generate Advertisement PDF', 'Project Selection Survey', 'Project Team Assignments and Stats', 
          'SME Advertisements and Stats', 'Mentor Assignment', 'Canvas Group Files', 'Generate Expo book']
          .map((text) => (
            <ListItem key={text} onClick={() => setSelectedOption(text)}>
              <ListItemText primary={text} />
            </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    switch (selectedOption) {
      case 'Generate Advertisement PDF':
        return <Typography variant="h6">Generate Advertisement PDF Content</Typography>;
      case 'Project Selection Survey':
        return <Typography variant="h6">Project Selection Survey Content</Typography>;
      case 'Project Team Assignments and Stats':
        return <Typography variant="h6">Project Team Assignments and Stats Content</Typography>;
      case 'SME Advertisements and Stats':
        return <Typography variant="h6">SME Advertisements and Stats Content</Typography>;
      case 'Mentor Assignment':
        return <Typography variant="h6">Mentor Assignment Content</Typography>;
      case 'Canvas Group Files':
        return <Typography variant="h6">Canvas Group Files Content</Typography>;
      case 'Generate Expo book':
        return <Typography variant="h6">Generate Expo book Content</Typography>;
      default:
        return <Typography variant="h6">Please select an option from the sidebar</Typography>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
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
              Senior Design Glue. Open: {JSON.stringify(mobileOpen)}
            </Typography>
          </Toolbar>
        </AppBar>
        {/* Drawer for mobile devices */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          // sx={{
          //   [`& .MuiDrawer-paper`]: { width: drawerWidth },
          // }}
        >
          {drawer}
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
        >
          <Toolbar />
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
