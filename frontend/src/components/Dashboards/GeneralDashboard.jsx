import { useSqlQuery } from "../../hooks/sqlHooks";

// Import Alert
import {
  Alert,
  Typography,
  Container,
  Paper,
  Skeleton,
  Box,
  Stack,
} from "@mui/material";

import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

export default function GeneralDashboard() {
  return (
    <Container>
      <Stack spacing={1}>
        <CustomerNumber />
        <StudentNumber />
        <SponsorNumber />
        <SmeNumber />
      </Stack>
      {/* <JsonView src={data.data.results} /> */}
    </Container>
  );
}

function CustomerNumber() {
  let query1 = `SELECT * FROM customers`;

  const { data, error, isLoading } = useSqlQuery(query1);

  if (isLoading)
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
      </Stack>
    );

  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Paper variant="outlined">
      <Typography variant="h3" color="primary" align="center" fontWeight="bold">
        {data.data.results.length} Customers
      </Typography>
    </Paper>
  );
}

// Student Number
function StudentNumber() {
  let query1 = `SELECT * FROM students`;

  const { data, error, isLoading } = useSqlQuery(query1);

  if (isLoading)
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
      </Stack>
    );

  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Paper variant="outlined">
      <Typography variant="h3" color="primary" align="center" fontWeight="bold">
        {data.data.results.length} Students
      </Typography>
    </Paper>
  );
}

// Sponsors
function SponsorNumber() {
  let query1 = `SELECT * FROM sponsors`;

  const { data, error, isLoading } = useSqlQuery(query1);

  if (isLoading)
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
      </Stack>
    );

  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Paper variant="outlined">
      <Typography variant="h3" color="primary" align="center" fontWeight="bold">
        {data.data.results.length} Sponsors
      </Typography>
    </Paper>
  );
}

// SME number
function SmeNumber() {
  let query1 = `SELECT * FROM project_smes`;

  const { data, error, isLoading } = useSqlQuery(query1);

  if (isLoading)
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
        <Skeleton variant="rectangular" width={"100%"} height={25} />
      </Stack>
    );

  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Paper variant="outlined">
      <Typography variant="h3" color="primary" align="center" fontWeight="bold">
        {data.data.results.length} SMEs
      </Typography>
    </Paper>
  );
}
