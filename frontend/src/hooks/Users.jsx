import { API_ENDPOINT } from "../constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { useParams, useRouter } from "next/navigation";

export const SignMeIn = async (user, pass) => {
  // convert this to form data and send it to the server
  let postBody = {
    username: user,
    password: pass,
  };

  console.log("Logging in with 1 day");
  return (await axios.post(`${API_ENDPOINT}/login`, postBody)).data;
};

// Sign me in with a token

export const useSignMeInWithToken = (token) => {
  const router = useRouter();
  return useQuery(["token", token], () => SignMeInWithToken(token, router), {
    initialData: null,
    retry: false,
    // refetchOnWindowFocus: false,
  });
};
