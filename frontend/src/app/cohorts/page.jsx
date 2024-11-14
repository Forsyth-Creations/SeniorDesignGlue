"use client";
import React from "react";
import StudentDashboard from "@/components/Dashboards/StudentDashboard";
import NormalPageWrapper from "@/wrappers/NormalPageWrapper";
import {
  Typography,
  Container,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { NotProtectedByAuth } from "@/contexts/AuthContext";
import { usePublicSqlQuery } from "@/hooks/sqlHooks";

const StudentPage = ({ params }) => {
  const { code } = params;

  // Fetch distinct semesters and years from the projects table
  const { data, isLoading, isError } = usePublicSqlQuery(
    'SELECT DISTINCT semester, year FROM "projects" ORDER BY year, semester',
  );

  return (
    <NormalPageWrapper>
      <Container>
        <Typography variant="h4" gutterBottom>
          Cohorts
        </Typography>
        {isLoading && <CircularProgress />}
        {isError && <Alert severity="error">Error loading data</Alert>}
        {data?.results && (
          <List>
            {data.results.map((project, index) => {
              // Extract the last two characters of the year
              const shortYear = project.year.toString().slice(-2);
              const cohortLabel = `${project.semester} '${shortYear}`;

              return (
                <ListItem key={index}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      (window.location.href = `/cohorts/${project.semester}${shortYear}`)
                    }
                    sx={{ textTransform: "none", p: "20px", fontSize: "3rem" }}
                  >
                    {cohortLabel}
                  </Button>
                </ListItem>
              );
            })}
          </List>
        )}
      </Container>
    </NormalPageWrapper>
  );
};

export default NotProtectedByAuth(StudentPage);
