import { useQuery } from "@tanstack/react-query";
import { MediaCollection } from "../models/mediaItem";
import multiMediaService from "../services/multiMediaService";

interface GameDetails {
  name: string;
  name_original: string;
  released?: string;
}

const useGameMedia = (gameId: number, gameDetails?: GameDetails) => {
  return useQuery({
    queryKey: ['gameMedia', gameId, gameDetails?.name],
    queryFn: () => multiMediaService.getGameMedia(gameId, gameDetails),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!gameId,
  });
};

export default useGameMedia;