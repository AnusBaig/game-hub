import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import GameDetail from "../models/gameDetail";
import HookResponse from "../models/responses/hookResponse";
import useData from "./base/useData";

const useGameDetail = (id: string): HookResponse<GameDetail> => {
  return useData<GameDetail>(
    Endpoints.FETCH_GAME_DETAIL,
    CacheKeys.GAME_DETAIL_KEY,
    { id },
    undefined,
    {
      staleTime: ms("4h"),
    }
  );
};

export default useGameDetail;
