import { Box, Flex, Grid, GridItem, Hide, Show } from "@chakra-ui/react";
import { useState } from "react";
import "./App.css";
import GameGrid from "./components/game/GameGrid";
import GameHeading from "./components/game/GameHeading";
import PlatformSelector from "./components/game/PlatformSelector";
import SortSelector from "./components/game/SortSelector";
import GenreHeading from "./components/genre/GenreHeading";
import GenreList from "./components/genre/GenreList";
import Navbar from "./components/navbar/Navbar";
import Genre from "./models/genre";
import Platform from "./models/platform";
import GameQuery from "./models/queries/gameQuery";

function App() {
  const [gameQuery, setGameQuery] = useState({
    sortOrder: "", // sort by relevance
    page: 1,
    pageSize: 12,
  } as GameQuery);

  const handleGenreSelection = (selectedGenre: Genre) =>
    setGameQuery({ ...gameQuery, genreId: selectedGenre.id });
  const handlePlatformSelection = (selectedPlatform: Platform) =>
    setGameQuery({ ...gameQuery, platformId: selectedPlatform.id });
  const handleOrderSelection = (selectedOrder: string) =>
    setGameQuery({ ...gameQuery, sortOrder: selectedOrder });
  const handleSearch = (searchText: string) =>
    setGameQuery({ ...gameQuery, search: searchText });

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
        <Navbar onSearch={handleSearch} />
      </GridItem>
      <Show breakpoint='(min-width: 768px) and (max-width: 992px)'>
        <GridItem area='slider' bg='pink'>
          Slider
        </GridItem>
      </Show>
      <Show above='lg'>
        <GridItem area='aside' padding={4}>
          <GenreHeading />
          <GenreList
            selectedGenreId={gameQuery.genreId}
            onSelectGenre={handleGenreSelection}
          />
        </GridItem>
      </Show>
      <GridItem area='main' px={4}>
        <GameHeading gameQuery={gameQuery} />
        <Hide below='sm'>
          <Flex mb={4}>
            <Box mr={5}>
              <PlatformSelector
                selectedPlatformId={gameQuery.platformId}
                onSelectPlatform={handlePlatformSelection}
              />
            </Box>
            <SortSelector
              selectedSortOrder={gameQuery.sortOrder}
              onSelectSortOrder={handleOrderSelection}
            />
          </Flex>
        </Hide>
        <GameGrid gameQuery={gameQuery} />
      </GridItem>
    </Grid>
  );
}

export default App;
