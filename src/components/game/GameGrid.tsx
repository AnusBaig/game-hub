import { Heading, SimpleGrid, Text } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";
import GameCard from "./GameCard";

const GameGrid = () => {
  const { games, error } = useGames();

  return (
    <>
      <Heading mb={6} size='2xl'>
        Games
      </Heading>
      {error && error.length > 0 ? (
        <Text>{error}</Text>
      ) : (
        <>
          <SimpleGrid
            columns={{ sm: 1, md: 2, lg: 2, xl: 3 }}
            spacing={8}
            padding='1rem'
          >
            {games?.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </SimpleGrid>
        </>
      )}
    </>
  );
};

export default GameGrid;
