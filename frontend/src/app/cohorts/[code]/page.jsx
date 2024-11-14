"use client";
// write me a basic student page

import React, { use } from "react";
import StudentDashboard from "@/components/Dashboards/StudentDashboard";
import NormalPageWrapper from "@/wrappers/NormalPageWrapper";
import { NotProtectedByAuth } from "@/contexts/AuthContext";
import { usePublicSqlQuery } from "@/hooks/sqlHooks";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Grid2,
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";

const ProjectsPage = ({ params }) => {
  const { code } = params;

  const letter = code[0];
  const number = code.slice(1);

  const { data, isLoading, isError } = usePublicSqlQuery(
    `SELECT * FROM "projects" WHERE "semester" = '${letter}' AND "year" = '20${number}' ORDER BY "sequence" ASC`,
  );

  if (isLoading) return <LinearProgress />;
  if (isError) return <Typography>Error loading data</Typography>;

  return (
    <NormalPageWrapper>
      <Container>
        <Typography variant="h3" gutterBottom>
          Cohort: {code}
        </Typography>
        <Stack spacing={2}>
          {data?.results?.map((project, index) => (
            <ProjectCard key = {index} project={project} letter={letter} number={number} />
          ))}
        </Stack>
      </Container>
    </NormalPageWrapper>
  );
};

const ProjectCard = ({ project, letter, number }) => {
  let sequence = project.sequence;

  // Fetch the list of students for the given project sequence
  const {
    data: students,
    isLoading,
    isError,
  } = usePublicSqlQuery(
    `SELECT * FROM "teams" WHERE "semester" = '${letter}' AND "year" = '20${number}' AND sequence=${sequence} ORDER BY "sequence" ASC`,
  );

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        {/* Project number displayed as a chip */}
        <Chip
          label={`Project #${project.sequence}`}
          color="primary"
          style={{ marginBottom: "8px" }}
        />
        <Typography variant="h5" component="div" gutterBottom>
          {project.short_title}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          <strong>Status:</strong> {project.prj_status}
        </Typography>
        <Typography variant="body1">{project.description}</Typography>

        {/* List students enrolled in the project */}
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "16px" }}
        >
          <strong>Students:</strong>
        </Typography>
        <List>
          {students?.results?.map((student, index) => (
            <ListItem key={index}>
              <ListItemText primary={student.student_email} />
            </ListItem>
          ))}
        </List>
        {isError && <Alert severity="error">Error loading data</Alert>}
      </CardContent>
    </Card>
  );
};

export default NotProtectedByAuth(ProjectsPage);
