"use client";
// write me a basic student page

import React from "react";
import StudentDashboard from "@/components/Dashboards/StudentDashboard";
import NormalPageWrapper from "@/wrappers/NormalPageWrapper";
import { ProtectedByAuth } from "@/contexts/AuthContext";
import { useSqlQuery, runQuery, deleteQuery } from "@/hooks/sqlHooks";
import {
  Box,
  Button,
  Collapse,
  Container,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

function SqlHistoryItem({ query, onCopy, onDelete, handleSelectRecentQuery }) {
  const { data, isLoading, isError, refetch } = useSqlQuery(query, {
    remember: true,
  }); // Fetch the results for the query
  const [showResults, setShowResults] = React.useState(false); // State to control visibility of results
  const [page, setPage] = React.useState(0); // Current page state
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // Rows per page

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

const Page = () => {
  // pull the old queries from the common_queries table
  const [sqlQuery, setSqlQuery] = React.useState("");
  const [recentQueries, setRecentQueries] = React.useState([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

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

  return (
    <NormalPageWrapper>
      <Container>
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
      </Container>
    </NormalPageWrapper>
  );
};

export default ProtectedByAuth(Page);
