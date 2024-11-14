import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { API_ENDPOINT } from "@/constants";
import axios from "axios";
import { queryClient } from "@/components/QueryWrapper/QueryWrapper";
import { AuthContext } from "@/contexts/AuthContext";

export const useMDEMutation = (url, options = {}) => {
  const { getHeaders } = React.useContext(AuthContext);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const headers = getHeaders();
      if (options.function == "DELETE") {
        return axios.delete(`${API_ENDPOINT}/${url}`, headers);
      }
      return axios.post(
        `${API_ENDPOINT}/${url}`,
        { ...data, ...options.options },
        headers,
      );
    },

    onError: (error) => {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(url);
    },

    onSuccess: () => {
      toast.success("Operation successful");
    },

    ...options,
  });

  return mutation;
};
