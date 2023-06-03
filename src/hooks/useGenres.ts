import { Endpoints } from "../constants/endpoints";
import Genre from "../models/genre";
import useData from "./useData";

const useGeneres = () => useData<Genre>(Endpoints.FETCH_ALL_GENERES);

export default useGeneres;
