import { Heading } from "@chakra-ui/react";
import useGenre from "../../hooks/useGenre";
import usePlatform from "../../hooks/usePlatform";
import GameQuery from "../../models/queries/gameQuery";

interface Props {
  gameQuery: GameQuery;
}

const GameHeading = ({ gameQuery }: Props) => {
  const { data: genre } = useGenre(gameQuery.genreId);
  const { data: platform } = usePlatform(gameQuery.platformId);

  const heading = `${platform?.name || ""} ${genre?.name || ""} Games`;
  return (
    <Heading as='h1' fontSize='5xl' mb={5}>
      {heading}
    </Heading>
  );
};

export default GameHeading;
