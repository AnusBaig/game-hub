import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import GameQuery from "./models/queries/gameQuery";

interface GameQueryStore {
  gameQuery: GameQuery;
  setGenreId: (genreId: number) => void;
  setPlatformId: (platformId: number) => void;
  setSortOrder: (sortOrder: string) => void;
  setSearch: (search: string) => void;
  setMetacriticRange: (min?: number, max?: number) => void;
  setReleaseDateRange: (after?: string, before?: string) => void;
  setTags: (tags: string[]) => void;
  setPublishers: (publishers: string[]) => void;
  setDevelopers: (developers: string[]) => void;
  setEsrbRating: (rating?: string) => void;
  setPlatforms: (platforms: number[]) => void;
  clearFilters: () => void;
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
        page: 1,
      },
    })),
  setPlatformId: (platformId) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        platformId,
        page: 1,
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
  setMetacriticRange: (min, max) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        metacriticMin: min,
        metacriticMax: max,
        page: 1,
      },
    })),
  setReleaseDateRange: (after, before) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        releasedAfter: after,
        releasedBefore: before,
        page: 1,
      },
    })),
  setTags: (tags) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        tags,
        page: 1,
      },
    })),
  setPublishers: (publishers) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        publishers,
        page: 1,
      },
    })),
  setDevelopers: (developers) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        developers,
        page: 1,
      },
    })),
  setEsrbRating: (esrbRating) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        esrbRating,
        page: 1,
      },
    })),
  setPlatforms: (platforms) =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        platforms,
      },
    })),
  clearFilters: () =>
    set(() => ({
      gameQuery: {
        sortOrder: "",
        page: 1,
        pageSize: 12,
      },
    })),
}));

if (process.env.NODE_ENV === "development")
  mountStoreDevtool("Game Query Store", useGameQueryStore);

export default useGameQueryStore;
