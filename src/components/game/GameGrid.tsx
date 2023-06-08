import { Button, SimpleGrid, Text } from "@chakra-ui/react";
import GameCard from "./GameCard";
import GameCardSkeleton from "./GameCardSkeleton";
import GameCardContainer from "./GameCardContainer";
import GameQuery from "../../models/queries/gameQuery";
import useGames from "../../hooks/useGames";
import LoadMore from "./LoadMore";

interface Props {
  gameQuery: GameQuery;
}

const GameGrid = ({ gameQuery }: Props) => {
  const {
    data,
    error,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useGames(gameQuery);

  const skeletons = [...Array(8).keys()];

  if (error && !isLoading)
    return (
      <Text as='h4' textAlign='center'>
        {error}
      </Text>
    );

  return (
    <>
      <SimpleGrid
        columns={{ sm: 1, md: 2, lg: 2, xl: 3, "2xl": 4 }}
        spacing={5}
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
      {hasNextPage && (
        <LoadMore
          isLoading={isFetchingNextPage}
          onClick={() => fetchNextPage && fetchNextPage()}
        />
      )}
    </>
  );
};

export default GameGrid;
