import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import platforms from "../data/platforms";
import Platform from "../models/platform";
import HookResponse from "../models/responses/hookResponse";
import useData from "./useData";

const usePlatforms = (): HookResponse<Platform[]> => {
  return useData<Platform>(
    Endpoints.FETCH_PARENT_PLATFORMS,
    CacheKeys.PLATFORMS_KEY,
    undefined,
    {
      staleTime: ms("24h"),
      initialData: { count: platforms.length, results: platforms },
    }
  );
};

export default usePlatforms;
