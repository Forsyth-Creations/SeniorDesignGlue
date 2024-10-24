"use client";

import * as React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const router = useRouter();

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    if (auth.token) {
      setTimeout(() => {
        if (auth.loggedIn) {
          router.push("/");
        }
      }, 2000);
    }
  }, [auth.token, auth.loggedIn]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      username: data.get("username"),
      password: data.get("password"),
    });
    auth.signin(data.get("username"), data.get("password"));
  };

  const validateInputs = () => {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    let isValid = true;

    if (!username.value || username.value.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage(
        "Please enter a valid username (min 3 characters).",
      );
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100vw",
        height: "100vh",
        maxWidth: 400,
        margin: "auto",
        pt: "20vh",
      }}
    >
      <Typography component="h1" variant="h5" align="center">
        Sign in
      </Typography>
      <TextField
        error={usernameError}
        helperText={usernameErrorMessage}
        id="username"
        name="username"
        label="Username"
        type="text"
        required
        fullWidth
        variant="outlined"
      />
      <TextField
        error={passwordError}
        helperText={passwordErrorMessage}
        id="password"
        name="password"
        label="Password"
        type="password"
        required
        fullWidth
        variant="outlined"
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        onClick={validateInputs}
      >
        Sign in
      </Button>
    </Box>
  );
}
