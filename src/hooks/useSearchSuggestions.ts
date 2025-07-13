import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ApiClient from "../services/apiClient";
import { CacheKeys } from "../constants/cacheKeys";
import Game from "../models/game";
import FetchResponse from "../models/responses/fetchResponse";

interface SearchSuggestion {
  id: number;
  name: string;
  type: "game";
  released?: string;
  background_image?: string;
}

const gamesClient = new ApiClient<FetchResponse<Game[]>>("/games");

const useSearchSuggestions = (searchTerm: string) => {
  const shouldFetch = searchTerm.length >= 2;

  // Fetch games only
  const { data: gamesData, isLoading } = useQuery<FetchResponse<Game[]>, Error>({
    queryKey: [CacheKeys.GAMES_KEY, "suggestions", searchTerm],
    queryFn: () => gamesClient.getAll({
      search: searchTerm,
      page_size: 8,
      ordering: "-metacritic,-rating"
    }),
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format game suggestions
  const suggestions = useMemo(() => {
    if (!shouldFetch || !gamesData?.results) return [];

    return gamesData.results.map((game: Game) => ({
      id: game.id,
      name: game.name,
      type: "game" as const,
      released: game.released,
      background_image: game.background_image
    }));
  }, [gamesData, shouldFetch, searchTerm]);

  return {
    data: suggestions,
    isLoading: shouldFetch && isLoading,
    error: null // We'll handle errors gracefully
  };
};

export default useSearchSuggestions;