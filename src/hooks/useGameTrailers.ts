import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import GameTrailer from "../models/gameTrailer";
import FetchResponse from "../models/responses/fetchResponse";
import HookResponse from "../models/responses/hookResponse";
import useData from "./base/useData";

const useGameTrailers = (
  id: number
): HookResponse<FetchResponse<GameTrailer[]>> => {
  return useData<FetchResponse<GameTrailer[]>>(
    Endpoints.FETCH_GAME_TRAILERS,
    CacheKeys.GAME_TRAILERS_KEY,
    { id: id.toString() },
    undefined,
    { staleTime: ms("6h") },
    [id]
  );
};

export default useGameTrailers;
