// React a react hook that fetches all locations from the backend

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

// ----------- Attempting to use the useQuery hook instead ------------------
export const useSqlQuery = (query, options, queryParams) => {
  return useQuery({
    queryKey: ["sql", query],
    queryFn: () => runQuery(query, options),
    retry: 0,
    ...queryParams,
  });
};

export const runQuery = async (query, options = {}) => {
  let API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

  if (query === "" || query === undefined) {
    return;
  }

  const response = await axios
    .post(`${API_ENDPOINT}/sql`, { query, ...options })
    .catch((error) => {
      toast.error("Error fetching data");
      console.error(error);
    });
  return response;
};

// ----------- Delete query from common_queries ------------------

export const deleteQuery = async (query) => {
  let API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

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
