import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import { useSqlQuery } from "../../hooks/sqlHooks"; // Assuming you have this custom hook

// Component for searching students
const StudentSearch = ({ onStudentSelect }) => {
  // Query to fetch students for the autocomplete
  const query = `SELECT email, firstname, lastname FROM students ORDER BY lastname, firstname;`;

  const { data, error, isLoading } = useSqlQuery(query);

  // State to hold student options
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (data) {
      const studentOptions = data.data.results.map((student) => ({
        label: `${student.firstname} ${student.lastname}`,
        email: student.email,
      }));
      setStudents(studentOptions);
    }
  }, [data]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">Error fetching students: {error.message}</Alert>;
  }

  return (
    <Autocomplete
      options={students}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField {...params} label="Search Student" variant="outlined" />
      )}
      onChange={(event, newValue) => onStudentSelect(newValue)}
      fullWidth
    />
  );
};

// Component to display the selected student's data and project info
const StudentPage = ({ studentEmail }) => {
  // Query to fetch student details
  const studentQuery = `SELECT * FROM students WHERE email = '${studentEmail}';`;
  const projectQuery = `SELECT * FROM teams WHERE student_email = '${studentEmail}';`;

  const { data: studentData, error: studentError, isLoading: studentLoading } = useSqlQuery(studentQuery);
  const { data: projectData, error: projectError, isLoading: projectLoading } = useSqlQuery(projectQuery);

  if (studentLoading || projectLoading) {
    return <CircularProgress />;
  }

  if (studentError || projectError) {
    return <Alert severity="error">Error fetching data</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5">Student Information</Typography>
      <Typography variant="body1">
        Name: {studentData?.data.results[0]?.firstname} {studentData?.data.results[0]?.lastname}
      </Typography>
      <Typography variant="body1">Email: {studentEmail}</Typography>
      <Typography variant="body1">Major: {studentData?.data.results[0]?.first_major_code}</Typography>

      <Typography variant="h6" mt={2}>Project Information</Typography>
      {projectData?.data.results.length > 0 ? (
        <Stack spacing={2}>
          {projectData?.data.results.map((project, index) => (
            <Box key={index}>
              <Typography variant="body1">
                Project: {project.semester}{project.year} - {project.sequence}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Alert severity="info">No project assigned</Alert>
      )}
    </Box>
  );
};

// Main Dashboard Component
const StudentDashboard = () => {
  // State to hold selected student
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>Student Project Dashboard</Typography>
      {/* Student Search */}
      <StudentSearch onStudentSelect={setSelectedStudent} />

      {/* Student Page */}
      {selectedStudent && <StudentPage studentEmail={selectedStudent.email} />}
    </Box>
  );
};

export default StudentDashboard;
