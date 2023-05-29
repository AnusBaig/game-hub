import { Heading, SimpleGrid, Text } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";
import GameCard from "./GameCard";
import GameCardSkeleton from "./GameCardSkeleton";

const GameGrid = () => {
  const { games, error, isLoading } = useGames();
  const skeletons = [1, 2, 3, 4, 5, 6];

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
            {isLoading &&
              skeletons.map((skeleton) => <GameCardSkeleton key={skeleton} />)}
            {games?.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </SimpleGrid>
        </>
      )}
    </>
  );
};

export default GameGrid;
