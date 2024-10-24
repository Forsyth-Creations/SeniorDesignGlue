"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  Button,
  Box,
  CssBaseline,
  Divider,
  TextField,
  Snackbar,
  Paper,
  Stack,
  Tooltip,
  Collapse,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DownloadIcon from "@mui/icons-material/Download"; // Import the Download icon
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete"; // Import the Delete icon
import LogoutIcon from "@mui/icons-material/Logout";
import { ProtectedByAuth } from "../contexts/AuthContext";

// Dashboards
import GeneralDashboard from "../components/Dashboards/GeneralDashboard";
import TeamQuickStats from "../components/Dashboards/TeamQuickStats";
import StudentDashboard from "../components/Dashboards/StudentDashboard";

// useSqlQuery
import { useSqlQuery, runQuery, deleteQuery } from "../hooks/sqlHooks";

// import the auth context
import { AuthContext } from "../contexts/AuthContext";

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

function SqlHistoryItem({ query, onCopy, onDelete, handleSelectRecentQuery }) {
  const { data, isLoading, isError, refetch } = useSqlQuery(query, {
    remember: true,
  }); // Fetch the results for the query
  const [showResults, setShowResults] = useState(false); // State to control visibility of results
  const [page, setPage] = useState(0); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page

  const handleToggleResults = () => {
    setShowResults((prev) => !prev); // Toggle results visibility
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage); // Update the current page
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Update the rows per page
    setPage(0); // Reset to first page when changing rows per page
  };

  return (
    <Paper
      variant="outlined"
      component={Stack}
      direction="column"
      sx={{ width: "100%", p: "10px", mb: 2 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Button
          variant="text"
          onClick={() => {
            refetch();
            handleSelectRecentQuery(query);
          }} // Fetch new results
          sx={{ textTransform: "none" }}
        >
          {query}
        </Button>
        <Stack direction="row">
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              onCopy(query);
            }}
            sx={{ ml: 2 }}
          >
            Copy
          </Button>
          <IconButton
            color="error"
            onClick={() => onDelete(query)}
            sx={{ ml: 2 }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Button to toggle results visibility */}
      <Button variant="outlined" onClick={handleToggleResults} sx={{ mt: 2 }}>
        {showResults ? "Hide Results" : "Show Results"}
      </Button>

      {/* Collapse for showing results in a table format */}
      <Collapse in={showResults}>
        <Stack sx={{ mt: 2 }}>
          {isLoading && <Typography>Loading...</Typography>}
          {isError && (
            <Typography color="error">Error fetching results</Typography>
          )}
          {/* {JSON.stringify(data)} */}
          {data?.data?.results && data?.data?.results.length > 0 && (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {Object.keys(data.data.results[0]).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.data.results
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      ) // Paginate the data
                      .map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <TableCell key={colIndex}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]} // Options for rows per page
                component="div"
                count={data.data.results.length} // Total number of items
                rowsPerPage={rowsPerPage} // Current rows per page
                page={page} // Current page
                onPageChange={handleChangePage} // Function to handle page change
                onRowsPerPageChange={handleChangeRowsPerPage} // Function to handle rows per page change
              />
            </>
          )}
          {data && data.length === 0 && (
            <Typography>No results found</Typography>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [recentQueries, setRecentQueries] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const auth = React.useContext(AuthContext);

  function handleLogout() {
    auth.logout();
  }

  // pull the old queries from the common_queries table
  const {
    data,
    isLoading,
    isError,
    refetch: refetchCommon,
  } = useSqlQuery(
    "SELECT * FROM common_queries",
    {},
    { refetchOnWindowFocus: false },
  );

  React.useEffect(() => {
    if (data) {
      setRecentQueries(data.data.results.map((row) => row.query));
    }
  }, [data]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDeleteQuery = async (queryToDelete) => {
    setRecentQueries((prevQueries) =>
      prevQueries.filter((query) => query !== queryToDelete),
    );

    // also remove the query from the database
    await deleteQuery(queryToDelete);
    refetchCommon();
  };

  const handleExecuteQuery = async () => {
    if (sqlQuery.trim()) {
      await runQuery(sqlQuery, { remember: true });
      setSqlQuery("");
      refetchCommon();
    } else {
      console.warn("SQL query is empty.");
    }
  };

  const handleSelectRecentQuery = (query) => {
    setSqlQuery(query);
  };

  const handleCopyToClipboard = async (query) => {
    try {
      await navigator.clipboard.writeText(query);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDownloadHistory = () => {
    const fileContent = recentQueries.join("\n");
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sql_queries_history.txt";
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
  };

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
          "Student Dashboard",
          "Team Quick Stats",
          // "Canvas Group Files",
          // "Generate Expo book",
          "Custom SQL Query",
        ].map((text) => (
          <ListItem key={text} onClick={() => setSelectedOption(text)}>
            <Button variant="contained" color="primary">
              {text}
            </Button>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    switch (selectedOption) {
      case "Student Dashboard":
        return <StudentDashboard />;
      case "Team Quick Stats":
        return <TeamQuickStats />;
      case "Custom SQL Query":
        return (
          <Box>
            <Typography variant="h6">Enter Your SQL Query:</Typography>
            <TextField
              label="SQL Query"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleExecuteQuery}
            >
              Execute Query
            </Button>
            <Tooltip title="Download Recent History">
              <IconButton
                color="primary"
                onClick={handleDownloadHistory}
                sx={{ ml: 2 }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Recent Queries:
            </Typography>
            <List>
              {recentQueries.map((query, index) => (
                <ListItem key={index}>
                  <SqlHistoryItem
                    query={query}
                    onCopy={handleCopyToClipboard}
                    onDelete={handleDeleteQuery}
                    handleSelectRecentQuery={handleSelectRecentQuery}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );
      default:
        return <GeneralDashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
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
          {renderContent()}
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message="Query copied to clipboard!"
        />
      </Box>
    </ThemeProvider>
  );
}

export default ProtectedByAuth(App);
