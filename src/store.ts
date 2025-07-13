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
  // Individual clear methods
  clearGenre: () => void;
  clearPlatform: () => void;
  clearSearch: () => void;
  clearSort: () => void;
  clearMetacriticRange: () => void;
  clearReleaseDateRange: () => void;
  clearTags: () => void;
  clearPublishers: () => void;
  clearDevelopers: () => void;
  clearEsrbRating: () => void;
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
      gameQuery: { ...store.gameQuery, sortOrder, page: 1 },
    })),
  setSearch: (search) =>
    set((store) => ({
      gameQuery: {
        sortOrder: "", // Reset to relevance for search results
        pageSize: store.gameQuery.pageSize, // Preserve page size preference
        search,
        page: 1,
        // Add timestamp to force cache invalidation when search resets filters
        searchTimestamp: Date.now(),
        // All other filters are reset to ensure search results are not restricted
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
        page: 1,
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
  // Individual clear methods
  clearGenre: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        genreId: undefined,
        page: 1,
      },
    })),
  clearPlatform: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        platformId: undefined,
        page: 1,
      },
    })),
  clearSearch: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        search: undefined,
        page: 1,
      },
    })),
  clearSort: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        sortOrder: "",
        page: 1,
      },
    })),
  clearMetacriticRange: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        metacriticMin: undefined,
        metacriticMax: undefined,
        page: 1,
      },
    })),
  clearReleaseDateRange: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        releasedAfter: undefined,
        releasedBefore: undefined,
        page: 1,
      },
    })),
  clearTags: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        tags: undefined,
        page: 1,
      },
    })),
  clearPublishers: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        publishers: undefined,
        page: 1,
      },
    })),
  clearDevelopers: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        developers: undefined,
        page: 1,
      },
    })),
  clearEsrbRating: () =>
    set((store) => ({
      gameQuery: {
        ...store.gameQuery,
        esrbRating: undefined,
        page: 1,
      },
    })),
}));

if (process.env.NODE_ENV === "development")
  mountStoreDevtool("Game Query Store", useGameQueryStore);

export default useGameQueryStore;
