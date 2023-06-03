import { Endpoints } from "../constants/endpoints";
import Genre from "../models/genre";
import HookResponse from "../models/responses/hookResponse";
import useData from "./useData";

const useGeneres = (): HookResponse<Genre[]> =>
  useData<Genre>(Endpoints.FETCH_ALL_GENERES);

export default useGeneres;
