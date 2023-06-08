import { Heading } from "@chakra-ui/react";
import React from "react";
import GameQuery from "../../models/queries/gameQuery";
import useGeneres from "../../hooks/useGenres";
import usePlatforms from "../../hooks/usePlatforms";

interface Props {
  gameQuery: GameQuery;
}

const GameHeading = ({ gameQuery }: Props) => {
  const { data: genres } = useGeneres();
  const genre = genres?.find((genre) => genre.id === gameQuery.genreId);

  const { data: platforms } = usePlatforms();
  const platform = platforms?.find(
    (platform) => platform.id === gameQuery.platformId
  );

  const heading = `${platform?.name || ""} ${genre?.name || ""} Games`;
  return (
    <Heading as='h1' fontSize='5xl' mb={5}>
      {heading}
    </Heading>
  );
};

export default GameHeading;
