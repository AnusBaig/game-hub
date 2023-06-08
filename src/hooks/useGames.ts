import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import GameQuery from "../models/queries/gameQuery";
import HookResponse from "../models/responses/hookResponse";
import useInfiniteData from "./useInfiniteData";

const useGames = (gameQuery: GameQuery): HookResponse<Game[]> => {
  return useInfiniteData<Game>(
    Endpoints.FETCH_ALL_GAMES,
    CacheKeys.GAMES_KEY,
    {
      genres: gameQuery.genreId,
      platforms: gameQuery.platformId,
      ordering: gameQuery.sortOrder,
      search: gameQuery.search,
      page: gameQuery.page,
      page_size: gameQuery.pageSize,
    },
    { staleTime: ms("6h") },
    [gameQuery]
  );
};

export default useGames;
