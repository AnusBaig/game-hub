import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import GameQuery from "../models/queries/gameQuery";
import useData from "./useData";

const useGames = (gameQuery: GameQuery) => {
    return useData<Game>(Endpoints.FETCH_ALL_GAMES, {
        params: { genres: gameQuery.genre?.id, platforms: gameQuery.platform?.id }
    }, [gameQuery]);
}

export default useGames;