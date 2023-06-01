import { Grid, GridItem, HStack, Hide, Show } from "@chakra-ui/react";
import Navbar from "./components/navbar/Navbar";
import GameGrid from "./components/game/GameGrid";
import GenreList from "./components/genre/GenreList";
import PlatformSelector from "./components/game/PlatformSelector";
import Platform from "./models/platform";
import { useState } from "react";
import Genre from "./models/genre";
import GameQuery from "./models/queries/gameQuery";
import SortSelector from "./components/game/SortSelector";

function App() {
  const [gameQuery, setGameQuery] = useState({
    sortOrder: "metacritic",
  } as GameQuery);

  const handleGenreSelection = (selectedGenre: Genre) =>
    setGameQuery({ ...gameQuery, genre: selectedGenre });
  const handlePlatformSelection = (selectedPlatform: Platform) =>
    setGameQuery({ ...gameQuery, platform: selectedPlatform });
  const handleOrderSelection = (selectedOrder: string) =>
    setGameQuery({ ...gameQuery, sortOrder: selectedOrder });

  return (
    <Grid
      templateAreas={{
        base: `"nav" "main"`,
        sm: `"nav" "main"`,
        md: `"nav nav" "slider main"`,
        lg: `"nav nav" "aside main"`,
      }}
      templateColumns={{
        base: "1fr",
        md: "250px 1fr",
      }}
    >
      <GridItem area='nav'>
        <Navbar />
      </GridItem>
      <Show breakpoint='(min-width: 768px) and (max-width: 992px)'>
        <GridItem area='slider' bg='pink'>
          Slider
        </GridItem>
      </Show>
      <Show above='lg'>
        <GridItem area='aside'>
          <GenreList
            selectedGenre={gameQuery.genre}
            onSelectGenre={handleGenreSelection}
          />
        </GridItem>
      </Show>
      <GridItem area='main'>
        <HStack spacing={10} px={4} mb={4}>
          <PlatformSelector
            selectedPlatform={gameQuery.platform}
            onSelectPlatform={handlePlatformSelection}
          />
          <SortSelector
            selectedSortOrder={gameQuery.sortOrder}
            onSelectSortOrder={handleOrderSelection}
          />
        </HStack>
        <GameGrid gameQuery={gameQuery} />
      </GridItem>
    </Grid>
  );
}

export default App;
