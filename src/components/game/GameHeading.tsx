import { Heading } from "@chakra-ui/react";
import useGenre from "../../hooks/useGenre";
import usePlatform from "../../hooks/usePlatform";
import useGameQueryStore from "../../store";

const GameHeading = () => {
  const {
    gameQuery: { genreId, platformId },
  } = useGameQueryStore();

  const { data: genre } = useGenre(genreId);
  const { data: platform } = usePlatform(platformId);

  const heading = `${platform?.name || ""} ${genre?.name || ""} Games`;
  return (
    <Heading as='h1' fontSize='5xl' mb={5}>
      {heading}
    </Heading>
  );
};

export default GameHeading;
