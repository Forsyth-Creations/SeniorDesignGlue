// React a react hook that fetches all locations from the backend

import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINT } from "../constants";
import { AuthContext } from "@/contexts/AuthContext";
import { useMDEMutation } from "@/hooks/Generics";

// ----------- Attempting to use the useQuery hook instead ------------------
export const useSqlQuery = (query, options, queryParams) => {
  const { getHeaders } = useContext(AuthContext);
  return useQuery({
    queryKey: ["sql", query],
    queryFn: () => runQuery(query, options, getHeaders()),
    retry: 0,
    ...queryParams,
  });
};

export const runQuery = async (query, options = {}, headers) => {
  if (query === "" || query === undefined || query == null) {
    return;
  }

  const response = await axios
    .post(`${API_ENDPOINT}/sql`, { query, ...options }, headers)
    .catch((error) => {
      toast.error("Error fetching data");
      console.error(error);
    });
  return response;
};

// ----------- Delete query from common_queries ------------------

export const deleteQuery = async (query) => {
  if (query === "" || query === undefined) {
    return;
  }

  const response = await axios
    .delete(`${API_ENDPOINT}/sql/${query}`)
    .catch((error) => {
      toast.error("Error deleting data");
      console.error(error);
    });
  return response;
};

// ------------- Use the Public SQL Query --------------------------

export const usePublicSqlQuery = (query, options, queryParams) => {
  const { getHeaders } = useContext(AuthContext);
  return useQuery({
    queryKey: ["sql", query],
    queryFn: () => runPublicQuery(query, options, getHeaders()),
    retry: 0,
    ...queryParams,
  });
};

export const runPublicQuery = async (query, options = {}, headers) => {
  if (query === "" || query === undefined || query == null) {
    return;
  }

  const response = await axios
    .post(`${API_ENDPOINT}/sql/public`, { query, ...options }, headers)
    .catch((error) => {
      toast.error("Error fetching data");
      console.error(error);
    });
  return response?.data;
};
