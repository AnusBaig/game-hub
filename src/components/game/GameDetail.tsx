import { GridItem, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import useGameDetail from "../../hooks/useGameDetail";
import ExpandableText from "../utils/ExpandableText";
import Loader from "../utils/Loader";
import GameAttributeGrid from "./GameAttributeGrid";
import GameScreenshots from "./GameScreenshots";
import GameTrailer from "./trailer/GameTrailer";

const GameDetail = () => {
  const { id } = useParams();

  const { data: game, isLoading, error } = useGameDetail(id!);

  if (isLoading) return <Loader />;

  if (error || !game) return <Text>Unable to fetch Game deatils</Text>;

  return (
    <SimpleGrid margin={5} columns={{ base: 1, lg: 2 }} spacing={5}>
      <GridItem>
        <Heading mb={5} fontSize='5xl'>
          {game.name_original}
        </Heading>
        <ExpandableText text={game.description_raw} />
        <GameAttributeGrid
          platforms={game.parent_platforms}
          publishers={game.publishers}
          genres={game.genres}
          metascore={game.metacritic}
        />
      </GridItem>
      <GridItem>
        <GameTrailer gameId={game.id} />
        <GameScreenshots gameId={game.id} />
      </GridItem>
    </SimpleGrid>
  );
};

export default GameDetail;
