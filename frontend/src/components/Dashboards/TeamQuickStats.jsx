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
} from "@mui/material";
import { useSqlQuery } from "../../hooks/sqlHooks";
import { Description } from "@mui/icons-material";

const TeamQuickStats = () => {
  // SQL query to fetch the unique semester-year combos
  let query1 = `SELECT DISTINCT CONCAT(semester, year) AS semester_year_combo FROM teams ORDER BY semester_year_combo;`;

  // State variables
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [query2, setQuery2] = useState("");

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
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
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
      <FormControl fullWidth mt={2} disabled={!selectedSemester}>
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
          ) : projectData && projectData.data.results.length > 0 ? (
            projectData.data.results.map((project) => (
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

      {/* Display Emails */}
      <LockerAssignment
        semester={selectedSemester[0]}
        sequence={selectedProject}
        year={selectedSemester.substring(1)}
      />

      <ProjectDescription semester={selectedSemester[0]} sequence={selectedProject} year={selectedSemester.substring(1)} />

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
        <Typography variant="h6">Mentors:</Typography>
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
  );
};

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
      <TableCell>{student.student_email}</TableCell>
      <TableCell>{data.data.results[0].first_major_code}</TableCell>
      <TableCell>{data.data.results[0].citizenship}</TableCell>
    </TableRow>
  );
}

// Project SMEs
function Mentors({ semester, sequence, year }) {
  // Given the SME email, pull the name and other info from the database
  let query = `SELECT * FROM project_mentors WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  const { data, error, isLoading } = useSqlQuery(query);

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
    <TableRow key={data.data.results[0]?.email}>
      <TableCell>{data.data.results[0]?.email}</TableCell>
    </TableRow>
  );
}

function LockerAssignment({ semester, sequence, year }) {
  // Given the SME email, pull the name and other info from the database
  if (semester === "" || sequence === "" || year === "") {
    return null;
  }
  let query = `SELECT * FROM lockers WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  const { data, error, isLoading } = useSqlQuery(query);

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
        Locker Assignment: {data.data.results[0]?.locker_number}, shelf: {data.data.results[0]?.shelf}
      </Alert>
    );
  }
  return null;
}

function CompanyAndCustomers({semester, sequence, year}) {

  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  // Given the SME email, pull the name and other info from the database
  let query = `SELECT * FROM project_sponsors WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;
  let query2 = `SELECT * FROM project_customers WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  const { data, error, isLoading } = useSqlQuery(query);
  const { data: data2, error: error2, isLoading: isLoading2 } = useSqlQuery(query2);

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
          <Typography key={index} variant="body1">{customer.email}</Typography>
        ))
      ) : (
        <Typography variant="body1">No customers assigned</Typography>
      )}
    </Box>
  );
}


function ProjectDescription({semester, sequence, year}) {

  if (semester === "" || sequence === "" || year === "") {
    return null;
  }

  // Given the SME email, pull the name and other info from the database
  let query = `SELECT * FROM projects WHERE semester = '${semester}' AND sequence = ${sequence} AND year = ${year};`;

  const { data, error, isLoading } = useSqlQuery(query);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  return (
    <Box>
      <Typography variant="h6">Description:</Typography>
      <Typography variant="body1">{data.data.results[0]?.description}</Typography>
    </Box>
  );
}



export default TeamQuickStats;
