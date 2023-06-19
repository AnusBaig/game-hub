import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import Genre from "../models/genre";
import HookResponse from "../models/responses/hookResponse";
import useListData from "./base/useListData";

const useGeneres = (): HookResponse<Genre[]> =>
  useListData<Genre>(
    Endpoints.FETCH_ALL_GENERES,
    CacheKeys.GENRES_KEY,
    undefined,
    undefined,
    {
      staleTime: ms("24h"),
    }
  );

export default useGeneres;
