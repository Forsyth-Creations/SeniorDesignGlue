// React a react hook that fetches all locations from the backend

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// ----------- Attempting to use the useQuery hook instead ------------------
export const useSqlQuery = (query) => {
  return useQuery({ queryKey: ["sql", query], queryFn: () => runQuery(query) });
};

export const runQuery = async (query) => {
  let API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.post(`${API_ENDPOINT}/sql`, { query });
  return response.data.results;
};
