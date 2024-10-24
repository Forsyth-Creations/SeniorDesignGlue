"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { LinearProgress } from "@mui/material";
import { SignMeIn } from "../hooks/Users.jsx";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_ENDPOINT } from "../constants";
import { useParams } from "next/navigation";
// Import nextjs cookies
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { toast } from "react-toastify";
import jwt from "jsonwebtoken";

const AuthContext = createContext();

// Note: the auth provider should simply provide the user and the token
// The ProtectedByAuth should actually handle checking if the user needs to be logged in
// This will need to be re-worked, consider this a TODO

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenMain] = useState(getCookie("token"));
  const [rememberMe, setRememberMe] = useState(false);
  const [collections, setCollections] = useState(null);
  const [loginMessage, setLoginMessage] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);
  const [enableAuthQuery, setEnableAuthQuery] = useState(false);

  const { collection } = useParams();

  const router = useRouter();

  const validateToken = (token) => {
    // Check if the token is valid
    if (token) {
      // Check if the token is valid
      axios
        .post(`${API_ENDPOINT}/login/token`, {
          token: token,
        })
        .then((response) => {
          // console.log("Token is valid");
          setLoggedIn(true);
          setLoading(false);
        })
        .catch((error) => {
          // console.log("Token is invalid");
          setLoggedIn(false);
          setLoading(false);
          clearToken();
        });
    } else {
      setLoading(false);
      setLoggedIn(false);
    }
  };

  const checkToken = () => {
    // Check if the token has changed in the cookie
    const newToken = getCookie("token");
    if (newToken !== token) {
      // console.log("Token has changed");
      setTokenMain(newToken);
      validateToken(newToken);
    }
  };

  useEffect(() => {
    // console.log("Auth Context Loaded");
    validateToken(token);

    const handleFocus = () => {
      checkToken();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // TODO: occassionally check if the token still exists in the cookie
  // do so whenever the page is refocused

  useEffect(() => {
    if (collection && token) {
      console.log("You can now make queries to the collection");
      setEnableAuthQuery(true);
    } else {
      setEnableAuthQuery(false);
    }
  }, [collection]);

  // decode the token and set the user
  useEffect(() => {
    if (token) {
      const decoded = jwt.decode(token);
      setUser(decoded);
      setCollections(decoded.collections);
    } else {
      setUser(null);
    }
  }, [token]);

  function extract_collections(token) {
    // pull the collections out of the token
    const decoded = jwt.decode(token);
    setCollections(decoded.collections);
  }

  const setToken = (token) => {
    setTokenMain(token);
    if (rememberMe) {
      console.log("Setting token with expiry of 5 days");
      // Needs to be a date-link object
      let date = new Date();
      let days = 5;
      date.setDate(date.getDate() + days);
      setCookie("token", token, { expires: date, maxAge: 60 * 60 * 24 * days });
      // Set token in persistent storage
      console.log("Setting token in local storage");
      localStorage.setItem("mde_token", token);
    } else {
      // expires on browser close
      console.log("Setting token with expiry of session");
      setCookie("token", token, { expires: 0 });
      extract_collections(token);
    }
  };

  const forgotPassword = async (email) => {
    try {
      // call the forgot password API
      console.log("Forgot password for ", email);

      const result = await axios.post(
        `${API_ENDPOINT}/forgot`,
        {
          email: email,
        },
        {
          timeout: 3000,
        },
      );

      console.log("Forgot password request successful");
      return result;
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.log("Forgot password request timed out");
      } else {
        console.log("Forgot password request failed");
      }
      toast.error("Failed to send password reset email");
      // throw error;
    }
  };

  const getHeaders = () => {
    if (token == null)
      return {
        headers: {
          collection: collection,
        },
      };
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        collection: collection,
      },
    };
  };

  const logout = () => {
    // Delete the cookie
    deleteCookie("token");
    setTokenMain(null);
    router.push("/");
  };

  const clearToken = () => {
    setTokenMain(null);
    deleteCookie("token");
  };

  const signin = (user, password, remember) => {
    console.log("Attempting to sign in");
    console.log("Remember me: ", remember);
    return new Promise((resolve, reject) => {
      // call the signin api
      // if success, setUser(user)
      // else setUser(null)
      SignMeIn(user, password, remember)
        .then((data) => {
          if (data.access_token) {
            setToken(data.access_token);
            setLoginMessage(null);
            // Refetch the login, this will validate the token
            // refetchLogin();
            // router.push("/collection");
            setLoggedIn(true);
            resolve(true);
          } else {
            setUser(null);
            setLoginMessage(
              "Failed to sign in: Username or Password incorrect",
            );
            resolve(false);
          }
        })
        .catch((error) => {
          setUser(null);
          toast.error("Failed to sign in: Network Error");
          reject(error);
        });
    });
  };

  const resetPassword = async (reset_token, password) => {
    try {
      // call the reset password API
      console.log("Resetting password for ", reset_token);

      const result = await axios.post(
        `${API_ENDPOINT}/reset-password`,
        {
          token: reset_token,
          password: password,
        },
        {
          timeout: 5000, // Set a timeout of 5 seconds (adjust as needed)
        },
      );

      console.log("Password reset successful");
      toast.success("Password reset successful");
      return result;
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.log("Password reset request timed out");
        toast.error("Password reset request timed out");
      } else {
        console.log("Password reset failed");
        toast.error("Password reset failed");
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        token,
        signin,
        logout,
        error,
        isError,
        rememberMe,
        setRememberMe,
        collections,
        getHeaders,
        loggedIn,
        loginMessage,
        clearToken,
        forgotPassword,
        resetPassword,
        enableAuthQuery,
        collection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function ProtectedByAuth(Component) {
  return function AuthHOC(props) {
    // Check if the user is logged in
    // If not, redirect to the login page
    const { loggedIn, loading, isError, token } = useContext(AuthContext);
    const router = useRouter();

    // this critiria may need to be adjusted (TODO)
    // useEffect(() => {
    //   if (!loading && !loggedIn && !token) {
    //     router.push("/login");
    //   }
    // }, [loading, isError, loggedIn, token, router]);

    if (isError) {
      // router.push("/login");
    }

    if (loading) {
      return <LinearProgress />;
    }

    if (!loggedIn) {
      console.log("User is not logged in");
      router.push("/login");
    }

    if (loggedIn) {
      return <Component {...props} />;
    }
  };
}

export { AuthContext, AuthProvider, ProtectedByAuth };
