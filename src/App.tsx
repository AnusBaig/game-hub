import { Grid, GridItem, Hide, Show } from "@chakra-ui/react";
import Navbar from "./components/navbar/Navbar";
import GameGrid from "./components/game/GameGrid";
import GenreList from "./components/genre/GenreList";
import PlatformSelector from "./components/game/PlatformSelector";
import Platform from "./models/platform";
import { useState } from "react";
import Genre from "./models/genre";

function App() {
  const [selectedGenre, setSelectedGenre] = useState<Genre>();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>();

  const handleGenreSelection = (genre: Genre) => setSelectedGenre(genre);
  const handlePlatformSelection = (platform: Platform) =>
    setSelectedPlatform(platform);

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
            selectedGenre={selectedGenre}
            onSelectGenre={handleGenreSelection}
          />
        </GridItem>
      </Show>
      <GridItem area='main'>
        <PlatformSelector
          selectedPlatform={selectedPlatform}
          onSelectPlatform={handlePlatformSelection}
        />
        <GameGrid genre={selectedGenre} platform={selectedPlatform} />
      </GridItem>
    </Grid>
  );
}

export default App;
