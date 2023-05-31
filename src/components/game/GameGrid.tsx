import { SimpleGrid, Text } from "@chakra-ui/react";
import GameCard from "./GameCard";
import GameCardSkeleton from "./GameCardSkeleton";
import GameCardContainer from "./GameCardContainer";
import useData from "../../hooks/useData";
import Game from "../../models/game";
import { Endpoints } from "../../constants/endpoints";

const GameGrid = () => {
  const { data, error, isLoading } = useData<Game>(Endpoints.FETCH_ALL_GAMES);

  const skeletons = [1, 2, 3, 4, 5, 6];

  return (
    <>
      {error && error.length > 0 ? (
        <Text>{error}</Text>
      ) : (
        <>
          <SimpleGrid
            columns={{ sm: 1, md: 2, lg: 2, xl: 3, "2xl": 4 }}
            spacing={5}
            padding={4}
          >
            {isLoading &&
              skeletons.map((skeleton) => (
                <GameCardContainer key={skeleton}>
                  <GameCardSkeleton />
                </GameCardContainer>
              ))}
            {data?.map((game) => (
              <GameCardContainer key={game.id}>
                <GameCard game={game} />
              </GameCardContainer>
            ))}
          </SimpleGrid>
        </>
      )}
    </>
  );
};

export default GameGrid;
