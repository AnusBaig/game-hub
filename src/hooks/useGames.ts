import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import HookResponse from "../models/responses/hookResponse";
import useGameQueryStore from "../store";
import useInfiniteData from "./base/useInfiniteData";

const useGames = (): HookResponse<Game[]> => {
  const gameQuery = useGameQueryStore((s) => s.gameQuery);

  // Build query parameters dynamically
  const params: any = {
    page: gameQuery.page,
    page_size: gameQuery.pageSize,
  };

  // Basic filters - using correct RAWG API parameter names
  if (gameQuery.genreId) params.genres = gameQuery.genreId;
  if (gameQuery.platformId) params.platforms = gameQuery.platformId;
  if (gameQuery.sortOrder) params.ordering = gameQuery.sortOrder;
  if (gameQuery.search) params.search = gameQuery.search;

  // Advanced filters - using correct RAWG API parameter names
  if (gameQuery.metacriticMin !== undefined || gameQuery.metacriticMax !== undefined) {
    const min = gameQuery.metacriticMin ?? 0;
    const max = gameQuery.metacriticMax ?? 100;
    // Apply filter if range is different from default 0-100
    if (min > 0 || max < 100) {
      params.metacritic = `${min},${max}`;
    }
  }
  
  if (gameQuery.releasedAfter || gameQuery.releasedBefore) {
    const after = gameQuery.releasedAfter || "1900-01-01";
    const before = gameQuery.releasedBefore || new Date().toISOString().split('T')[0];
    params.dates = `${after},${before}`;
  }
  
  if (gameQuery.tags && gameQuery.tags.length > 0) params.tags = gameQuery.tags.join(",");
  if (gameQuery.publishers && gameQuery.publishers.length > 0) params.publishers = gameQuery.publishers.join(",");
  if (gameQuery.developers && gameQuery.developers.length > 0) params.developers = gameQuery.developers.join(",");
  if (gameQuery.esrbRating) params.esrb_rating = gameQuery.esrbRating;

  // Uncomment for debugging
  // console.log("Game Query:", gameQuery);
  // console.log("API Params:", params);

  return useInfiniteData<Game>(
    Endpoints.FETCH_ALL_GAMES,
    CacheKeys.GAMES_KEY,
    params,
    { staleTime: ms("6h") },
    [gameQuery]
  );
};

export default useGames;
