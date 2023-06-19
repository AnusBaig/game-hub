import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import useGameDetail from "../../hooks/useGameDetail";
import Loader from "../utils/Loader";

const GameDetail = () => {
  const { id } = useParams();

  const { data: game, isLoading, error } = useGameDetail(id!);

  if (isLoading) return <Loader />;

  if (error || !game) return <p>Unable to fetch Game deatils</p>;

  return (
    <Box margin={5}>
      <Heading mb={5} fontSize='5xl'>
        {game.name_original}
      </Heading>
      <Text fontSize='lg'>{game.description_raw}</Text>
    </Box>
  );
};

export default GameDetail;
