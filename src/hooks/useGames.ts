import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import GameQuery from "../models/queries/gameQuery";
import useData from "./useData";

const useGames = (gameQuery: GameQuery) => {
  return useData<Game>(
    Endpoints.FETCH_ALL_GAMES,
    {
      genres: gameQuery.genre?.id,
      platforms: gameQuery.platform?.id,
      ordering: gameQuery.sortOrder,
    },
    [gameQuery]
  );
};

export default useGames;
