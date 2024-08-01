import axios from "axios";
import { config } from "../utils/config";

export const axiosClient = axios.create({
  baseURL: config.baseUrl,
});
