import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";

interface GameTrailerStore {
  trailerId?: number;
  setTrailerId: (trailerId: number) => void;
}

const useGameTrailerStore = create<GameTrailerStore>((set) => ({
  setTrailerId: (trailerId) => set(() => ({ trailerId })),
}));

if (process.env.NODE_ENV === "development")
  mountStoreDevtool("Game Trailer Store", useGameTrailerStore);

export default useGameTrailerStore;
