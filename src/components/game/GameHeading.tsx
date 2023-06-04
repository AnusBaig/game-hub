import { Heading } from "@chakra-ui/react";
import React from "react";
import GameQuery from "../../models/queries/gameQuery";

interface Props {
  gameQuery: GameQuery;
}

const GameHeading = ({ gameQuery }: Props) => {
  const heading = `${gameQuery.platform?.name || ""} ${
    gameQuery.genre?.name || ""
  } Games`;
  return (
    <Heading as='h1' fontSize='5xl' mb={5}>
      {heading}
    </Heading>
  );
};

export default GameHeading;
