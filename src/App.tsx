import { Grid, GridItem, Hide, Show } from "@chakra-ui/react";
import Navbar from "./components/navbar/Navbar";
import GameGrid from "./components/game/GameGrid";
import GenreList from "./components/genre/GenreList";

function App() {
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
        md: "200px 1fr",
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
          <GenreList />
        </GridItem>
      </Show>
      <GridItem area='main'>
        <GameGrid></GameGrid>
      </GridItem>
    </Grid>
  );
}

export default App;
