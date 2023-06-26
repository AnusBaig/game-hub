import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import GameScreenshot from "../models/gameScrrenshot";
import HookResponse from "../models/responses/hookResponse";
import useListData from "./base/useListData";
import GameScreenshotQuery from "../models/queries/gameScreenshotQuery";

const useGameScreenshots = (
  query: GameScreenshotQuery
): HookResponse<GameScreenshot[]> => {
  return useListData<GameScreenshot>(
    Endpoints.FETCH_GAME_SCREENSHOTS,
    CacheKeys.GAME_SCREENSHOTS_KEY,
    {
      id: query.gameId,
    },
    {
      page: query.page,
      page_size: query.pageSize,
    },
    { staleTime: ms("3h") },
    [query]
  );
};

export default useGameScreenshots;
