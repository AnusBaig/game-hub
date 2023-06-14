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
  // const [gameQuery, setGameQuery] = useState({
  //   sortOrder: "", // sort by relevance
  //   page: 1,
  //   pageSize: 12,
  // } as GameQuery);

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
        <GridItem area='aside' padding={4}>
          <GenreHeading />
          <GenreList />
        </GridItem>
      </Show>
      <GridItem area='main' px={4}>
        <GameHeading />
        <Hide below='sm'>
          <Flex mb={4}>
            <Box mr={5}>
              <PlatformSelector />
            </Box>
            <SortSelector />
          </Flex>
        </Hide>
        <GameGrid />
      </GridItem>
    </Grid>
  );
}

export default App;
