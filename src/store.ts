import { create } from "zustand";
import GameQuery from "./models/queries/gameQuery";

interface GameQueryStore {
  gameQuery: GameQuery;
  setGenreId: (genreId: number) => void;
  setPlatformId: (platformId: number) => void;
  setSortOrder: (sortOrder: string) => void;
  setSearch: (search: string) => void;
}

const useGameQueryStore = create<GameQueryStore>((set) => ({
  gameQuery: {
    sortOrder: "", // sort by relevance
    page: 1,
    pageSize: 12,
  },
  setGenreId: (genreId) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        genreId,
      },
    })),
  setPlatformId: (platformId) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        platformId,
      },
    })),
  setSortOrder: (sortOrder) =>
    set((store) => ({
      gameQuery: { ...store.gameQuery, sortOrder },
    })),
  setSearch: (search) =>
    set(() => ({
      gameQuery: {
        sortOrder: "", // sort by relevance
        page: 1,
        pageSize: 12,
        search,
      },
    })),
}));

export default useGameQueryStore;
