import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import HookResponse from "../models/responses/hookResponse";
import useGameQueryStore from "../store";
import useInfiniteData from "./base/useInfiniteData";

const useGames = (): HookResponse<Game[]> => {
  const gameQuery = useGameQueryStore((s) => s.gameQuery);

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
