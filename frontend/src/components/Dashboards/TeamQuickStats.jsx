import React, { useEffect, useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  Typography,
  TableRow,
  TableCell,
  Stack,
  Alert,
  Tooltip,
  Button,
  Paper,
} from "@mui/material";
import { useSqlQuery } from "@/hooks/sqlHooks";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const TeamQuickStats = () => {
  // SQL query to fetch the unique semester-year combos
  let query1 = `SELECT DISTINCT CONCAT(semester, year) AS semester_year_combo FROM teams ORDER BY semester_year_combo;`;

  // State variables
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [query2, setQuery2] = useState("");
  const [showTeamMetrics, setShowTeamMetrics] = useState(false);
  const [showProjectsOverview, setShowProjectsOverview] = useState(false);

  // Query for fetching projects based on selected semester/year
  const [projectQuery, setProjectQuery] = useState("");

  useEffect(() => {
    if (selectedSemester !== "") {
      // Split semester-year combo into char and year
      let char = selectedSemester[0]; // Extracts the semester (e.g., 'F' or 'S')
      let year = selectedSemester.substring(1); // Extracts the year (e.g., '2023')

      // Set query to fetch projects for the selected semester and year
      let projectQueryString = `SELECT * FROM projects WHERE semester = '${char}' AND year = '${year}' ORDER BY year, semester, sequence;`;
      setProjectQuery(projectQueryString);
    }
  }, [selectedSemester]);

  // Query to fetch students (only runs when both semester/year and project are selected)
  useEffect(() => {
    if (selectedSemester !== "" && selectedProject !== "") {
      // Split semester-year combo into char and year
      let char = selectedSemester[0];
      let year = selectedSemester.substring(1);

      // Query to fetch students based on selected semester, year, and project
      let query = `SELECT student_email FROM teams WHERE semester = '${char}' AND year = '${year}' AND sequence = ${selectedProject};`;
      setQuery2(query);
      console.log(query);
      setShowTeamMetrics(true);
    }

    if (selectedSemester !== "" && selectedProject == "") {
      setShowProjectsOverview(true);
      setShowTeamMetrics(false);
    } else {
      setShowProjectsOverview(false);
    }
  }, [selectedSemester, selectedProject]);

  // Using the custom hook to fetch data
  const {
    data: projectData,
    error: projectError,
    isLoading: isProjectLoading,
    refetch: refetchProjects,
  } = useSqlQuery(projectQuery);

  const {
    data: data2,
    error: error2,
    isLoading: isLoading2,
  } = useSqlQuery(query2);

  const { data, error, isLoading } = useSqlQuery(query1);

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
    setSelectedProject(""); // Reset project selection when semester changes
    setShowTeamMetrics(false);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const moreInfoClicked = (project) => {
    setSelectedProject(project.sequence);
    setShowTeamMetrics(true);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <Stack spacing={2}>
      {/* Semester Dropdown */}
      <FormControl fullWidth>
        <InputLabel id="semester-dropdown-label">Select Semester</InputLabel>
        <Select
          labelId="semester-dropdown-label"
          value={selectedSemester}
          label="Select Semester"
          onChange={handleSemesterChange}
        >
          {data.data.results.map((row) => (
            <MenuItem
              key={row.semester_year_combo}
              value={row.semester_year_combo}
            >
              {row.semester_year_combo}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Project Dropdown */}
      <Box display="flex" alignItems="center">
        {/* Project Dropdown */}
        <FormControl
          fullWidth
          disabled={!selectedSemester}
          sx={{ flexGrow: 1, mr: 2 }}
        >
          <InputLabel id="project-dropdown-label">Select Project</InputLabel>
          <Select
            labelId="project-dropdown-label"
            value={selectedProject}
            label="Select Project"
            onChange={handleProjectChange}
            disabled={isProjectLoading || projectError}
          >
            {isProjectLoading ? (
              <MenuItem disabled>
                <CircularProgress size={24} />
              </MenuItem>
            ) : projectError ? (
              <MenuItem disabled>Error loading projects</MenuItem>
            ) : projectData && projectData?.data.results.length > 0 ? (
              projectData?.data.results.map((project) => (
                <MenuItem key={project.short_title} value={project.sequence}>
                  {project.semester}
                  {project.year}-{project.sequence}: {project.short_title}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No projects found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Clear Button */}
        <Button
          onClick={() => handleProjectChange({ target: { value: "" } })}
          disabled={isProjectLoading || projectError || !selectedProject}
          sx={{ whiteSpace: "nowrap" }}
        >
          Clear
        </Button>
      </Box>

      {showProjectsOverview ? (
        <Stack spacing={1}>
          <Typography variant="h6">Projects Overview:</Typography>
          {projectData?.data.results.map((project, index) => (
            <ProjectOverviewBar
              key={index}
              project={project}
              onMoreInfoClick={moreInfoClicked}
            />
          ))}
        </Stack>
      ) : null}

      {showTeamMetrics && (
        <Stack spacing={2}>
          {/* Display Emails */}
          <LockerAssignment
            semester={selectedSemester[0]}
            sequence={selectedProject}
            year={selectedSemester.substring(1)}
          />

          {/* If every student has lab safety completed, show that. Otherwise show a warning */}
          <LabSafety
            semester={selectedSemester[0]}
            sequence={selectedProject}
            year={selectedSemester.substring(1)}
          />

          <ProjectDescription
            semester={selectedSemester[0]}
            sequence={selectedProject}
            year={selectedSemester.substring(1)}
          />

          <Box>
            {isLoading2 ? (
              <CircularProgress />
            ) : error2 && false ? (
              <p>Error fetching students: {error2.message}</p>
            ) : data2 && data2.data.results.length > 0 ? (
              <Box>
                <Typography variant="h6">Students:</Typography>
                {data2.data.results.map((student, index) => (
                  <Student key={index} student={student} />
                ))}
              </Box>
            ) : (
              <Typography variant="body1">
                No students found for this project and semester.
              </Typography>
            )}
          </Box>

          {/* Display Mentors */}
          <Box>
            <Mentors
              semester={selectedSemester[0]}
              sequence={selectedProject}
              year={selectedSemester.substring(1)}
            />
          </Box>

          {/* Display Company and Customers */}
          <Box>
            <CompanyAndCustomers
              semester={selectedSemester[0]}
              sequence={selectedProject}
              year={selectedSemester.substring(1)}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

function ProjectOverviewBar({ project, onMoreInfoClick }) {
  // Check if they have a locker assigned, or if they have lab safety completed
  const query = `
    SELECT * FROM lockers 
    WHERE semester = '${project.semester}' 
    AND sequence = ${project.sequence} 
    AND year = ${project.year};
  `;

  const query2 = `
    SELECT * FROM students 
    INNER JOIN teams ON students.email = teams.student_email 
    WHERE teams.semester = '${project.semester}' 
    AND teams.sequence = ${project.sequence} 
    AND teams.year = ${project.year};
  `;

  const enabled = !!(project.semester && project.sequence && project.year);

  const { data: lockerData, error, isLoading } = useSqlQuery(query);
  const {
    data: data2,
    error: error2,
    isLoading: isLoading2,
  } = useSqlQuery(query2, {}, { enabled: enabled });

  function handleMoreInfoClick() {
    if (onMoreInfoClick) {
      onMoreInfoClick(project);
    }
  }

  if (isLoading || isLoading2) {
    return <CircularProgress />;
  }

  if (error || error2) {
    return <p>Error fetching data: {error?.message || error2?.message}</p>;
  }

  let allStudentsHaveLabSafety = true;
  for (let student of data2?.data?.results) {
    if (!student.lab_safety) {
      allStudentsHaveLabSafety = false;
      break;
    }
  }

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">
            {`${project.semester} ${project.year}-${project.sequence}: ${project.short_title}`}
          </Typography>
          <Typography variant="body2">{project.description}</Typography>
          <Button onClick={handleMoreInfoClick}>More Info</Button>
        </Box>

        <Box
          sx={{ minWidth: "20vw", display: "flex", justifyContent: "flex-end" }}
        >
          {lockerData && lockerData.data.results.length > 0 ? (
            <Tooltip
              title={`Locker: ${lockerData.data.results[0].locker_number} Shelf: ${lockerData.data.results[0].shelf}`}
            >
              <Inventory2Icon sx={{ fontSize: 40 }} color="info" />
            </Tooltip>
          ) : null}

          {allStudentsHaveLabSafety ? (
            <Tooltip title="All students have completed lab safety">
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            </Tooltip>
          ) : (
            <Tooltip title="Not all students have completed lab safety">
              <CancelIcon color="error" sx={{ fontSize: 40 }} />
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function Student({ student }) {
  // Given the student email, pull the name and other info from the database

  let query = `SELECT * FROM students WHERE email = '${student.student_email}';`;

  // Check if the student has finished their training

  const { data, error, isLoading } = useSqlQuery(query);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <TableRow key={student.student_email}>
      <TableCell>{data.data.results[0].firstname}</TableCell>
      <TableCell>{data.data.results[0].lastname}</TableCell>
      <TableCell>
        <Button
          variant="contained"
          color="primary"
          href={`mailto:${student.student_email}`}
        >
          {student.student_email}
        </Button>
      </TableCell>
      <TableCell>{data.data.results[0].first_major_code}</TableCell>
      <TableCell>{data.data.results[0].citizenship}</TableCell>
      <TableCell>
        {data.data.results[0].lab_safety ? (
          <Tooltip title="Lab Safety Completed">
            <CheckCircleIcon color="success" />
          </Tooltip>
        ) : (
          <Tooltip title="Lab Safety Not Completed">
            <CancelIcon color="error" />
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}

// Project SMEs
function Mentors({ semester, sequence, year }) {
  // Given the SME email, pull the name and other info from the database
  let query = `SELECT * FROM project_mentors WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;
  const { data, error, isLoading } = useSqlQuery(
    query,
    {},
    { enabled: !!(semester && sequence && year) },
  );

  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  if (data.data.results.length === 0) {
    return <Alert severity="warning">No mentors assigned</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6">Mentors:</Typography>
      <TableRow>
        {data.data.results.map((mentor, index) => (
          <TableCell key={index}>{mentor.email}</TableCell>
        ))}
      </TableRow>
    </Box>
  );
}

function LockerAssignment({ semester, sequence, year }) {
  // Given the SME email, pull the name and other info from the database
  let query = `SELECT * FROM lockers WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  let enabled = !!(semester !== "" && sequence !== "" && year !== "");

  const { data, error, isLoading } = useSqlQuery(
    query,
    {},
    { enabled: enabled },
  ); // The lockers query

  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  // Use alert. If they are not assigned a locker, return null. If they are assigned a locker, return the locker number.

  if (data.data.results.length !== 0) {
    return (
      <Alert severity="info">
        Locker Assignment: {data.data.results[0]?.locker_number}, shelf:{" "}
        {data.data.results[0]?.shelf}
      </Alert>
    );
  }
  return null;
}

function CompanyAndCustomers({ semester, sequence, year }) {
  // Given the SME email, pull the name and other info from the database
  let query = `SELECT * FROM project_sponsors WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;
  let query2 = `SELECT * FROM project_customers WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  let enabled = !!(semester !== "" && sequence !== "" && year !== "");

  const { data, error, isLoading } = useSqlQuery(
    query,
    {},
    { enabled: enabled },
  ); // The company query
  const {
    data: data2,
    error: error2,
    isLoading: isLoading2,
  } = useSqlQuery(query2, {}, { enabled: enabled }); // The customers query
  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  if (isLoading || isLoading2) {
    return <CircularProgress />;
  }

  if (error || error2) {
    return <p>Error fetching data: {error.message}</p>;
  }

  if (data.data.results.length === 0) {
    return <Alert severity="warning">No company assigned</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6">Company:</Typography>
      <Typography variant="body1">{data.data.results[0]?.company}</Typography>
      <Typography variant="h6">Customers:</Typography>
      {data2.data.results.length > 0 ? (
        data2.data.results.map((customer, index) => (
          <Typography key={index} variant="body1">
            {customer.email}
          </Typography>
        ))
      ) : (
        <Typography variant="body1">No customers assigned</Typography>
      )}
    </Box>
  );
}

function ProjectDescription({ semester, sequence, year }) {
  let query = `SELECT * FROM projects WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  let enabled = !!(semester !== "" && sequence !== "" && year !== "");

  const { data, error, isLoading } = useSqlQuery(
    query,
    {},
    { enabled: enabled },
  );
  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  // Given the SME email, pull the name and other info from the database

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <Box>
      <Typography variant="h6">Description:</Typography>
      <Typography variant="body1">
        {data.data.results[0]?.description}
      </Typography>
    </Box>
  );
}

function LabSafety({ semester, sequence, year }) {
  let query = `SELECT * FROM students INNER JOIN teams ON students.email = teams.student_email WHERE teams.semester = '${semester}' AND teams.sequence = ${sequence} AND teams.year = ${year};`;

  let enabled = !!(semester !== "" && sequence !== "" && year !== "");

  const { data, error, isLoading } = useSqlQuery(
    query,
    {},
    { enabled: enabled },
  );
  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  // Given the SME email, pull the name and other info from the database

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  let allStudentsHaveLabSafety = true;
  for (let student of data.data.results) {
    if (!student.lab_safety) {
      allStudentsHaveLabSafety = false;
      break;
    }
  }

  return allStudentsHaveLabSafety ? (
    <Alert severity="success">All students have completed lab safety</Alert>
  ) : (
    <Alert severity="warning">Not all students have completed lab safety</Alert>
  );
}

export default TeamQuickStats;
