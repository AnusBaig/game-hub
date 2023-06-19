import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import useGameDetail from "../../hooks/useGameDetail";
import ExpandableText from "../utils/ExpandableText";
import Loader from "../utils/Loader";
import AttributeGrid from "./AttributeGrid";

const GameDetail = () => {
  const { id } = useParams();

  const { data: game, isLoading, error } = useGameDetail(id!);

  if (isLoading) return <Loader />;

  if (error || !game) return <Text>Unable to fetch Game deatils</Text>;

  return (
    <Box margin={5}>
      <Heading mb={5} fontSize='5xl'>
        {game.name_original}
      </Heading>
      <ExpandableText text={game.description_raw} />
      <AttributeGrid
        platforms={game.parent_platforms}
        publishers={game.publishers}
        genres={game.genres}
        metascore={game.metacritic}
      />
    </Box>
  );
};

export default GameDetail;
