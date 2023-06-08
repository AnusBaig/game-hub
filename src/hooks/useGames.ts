import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import GameQuery from "../models/queries/gameQuery";
import HookResponse from "../models/responses/hookResponse";
import useData from "./useData";

const useGames = (gameQuery: GameQuery): HookResponse<Game[]> => {
  return useData<Game>(Endpoints.FETCH_ALL_GAMES, CacheKeys.GAMES_KEY, {
    genres: gameQuery.genre?.id,
    platforms: gameQuery.platform?.id,
    ordering: gameQuery.sortOrder,
    search: gameQuery.search,
  });
};

export default useGames;
