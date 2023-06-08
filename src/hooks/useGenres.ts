import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import Genre from "../models/genre";
import HookResponse from "../models/responses/hookResponse";
import useData from "./useData";

const useGeneres = (): HookResponse<Genre[]> =>
  useData<Genre>(Endpoints.FETCH_ALL_GENERES, CacheKeys.GENRES_KEY, undefined, {
    staleTime: 24 * 60 * 60 * 1000, // 24h
  });

export default useGeneres;
