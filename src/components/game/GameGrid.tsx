import { SimpleGrid, Text } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import useGames from "../../hooks/useGames";
import FinishLoading from "../utils/FinishLoading";
import Loader from "../utils/Loader";
import GameCard from "./GameCard";
import GameCardContainer from "./GameCardContainer";
import GameCardSkeleton from "./GameCardSkeleton";
import { Link } from "react-router-dom";

const GameGrid = () => {
  const { data, error, fetchNextPage, isLoading, hasNextPage } = useGames();

  const skeletons = [...Array(8).keys()];

  if (error && !isLoading)
    return (
      <Text as='h4' textAlign='center'>
        {error}
      </Text>
    );

  return (
    <InfiniteScroll
      dataLength={data?.length ?? 0}
      next={() => fetchNextPage && fetchNextPage()}
      hasMore={!!hasNextPage}
      loader={<Loader />}
      endMessage={<FinishLoading />}
    >
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
          <Link key={game.id} to={`/games/${game.slug}`}>
            <GameCardContainer>
              <GameCard game={game} />
            </GameCardContainer>
          </Link>
        ))}
      </SimpleGrid>
    </InfiniteScroll>
  );
};

export default GameGrid;
