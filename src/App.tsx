import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Grid, GridItem, Hide, Show } from "@chakra-ui/react";
import Navbar from "./components/navbar/Navbar";

function App() {
  return (
    <Grid
      templateAreas={{
        base: `"nav" "main"`,
        sm: `"nav" "main"`,
        md: `"nav nav" "slider main"`,
        lg: `"nav nav" "aside main"`,
      }}
    >
      <GridItem area='nav' bg='teal'>
        <Navbar />
      </GridItem>
      <Show breakpoint='(min-width: 768px) and (max-width: 992px)'>
        <GridItem area='slider' bg='pink'>
          Slider
        </GridItem>
      </Show>
      <Show above='lg'>
        <GridItem area='aside' bg='coral'>
          Aside
        </GridItem>
      </Show>
      <GridItem area='main' bg='gold'>
        Main
      </GridItem>
    </Grid>
  );
}

export default App;
