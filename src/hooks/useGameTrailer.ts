import useGameTrailerStore from "../components/game/trailer/gameTrailerStore";
import GameTrailer from "../models/gameTrailer";
import HookResponse from "../models/responses/hookResponse";
import useGameTrailers from "./useGameTrailers";

const useGameTrailer = (gameId: number): HookResponse<GameTrailer> => {
  const { trailerId } = useGameTrailerStore();
  const { data, error, isLoading } = useGameTrailers(gameId);
  const trailer =
    data?.results.find((trailer) => trailer.id === trailerId) ||
    data?.results.at(0);

  return { data: trailer, error, isLoading };
};

export default useGameTrailer;
