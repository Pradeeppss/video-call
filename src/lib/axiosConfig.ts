import axios from "axios";
import { config } from "../utils/config";

export const axiosClient = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 401 || error.response.status === 403) {
      const path = window.location.pathname;
      if (path !== "/") window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
