import { Endpoints } from "../constants/endpoints";
import Genre from "../models/genre";
import ApiClient from "./apiClient";

export default new ApiClient<Genre>(Endpoints.FETCH_ALL_GENERES);
