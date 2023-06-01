import { Endpoints } from "../constants/endpoints";
import Game from "../models/game";
import Genre from "../models/genre";
import Platform from "../models/platform";
import useData from "./useData";

const useGames = (genre?: Genre, platform?: Platform) => {
    return useData<Game>(Endpoints.FETCH_ALL_GAMES, {
        params: { genres: genre?.id, platforms: platform?.id }
    });
}

export default useGames;