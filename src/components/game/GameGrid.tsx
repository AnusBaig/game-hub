import React, { useEffect, useState } from "react";
import Game from "../../models/game";
import apiClient from "../../services/api-client";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import FetchGamesResponse from "../../models/responses/fetchGamesResponse";
import { ResponseStatus } from "../../enums/responseStatus";

const GameGrid = () => {
  const [games, setGames] = useState<Game[]>();
  const [error, setError] = useState("");

  useEffect(() => () => {
    apiClient
      .get<FetchGamesResponse>("games")
      .then((res) =>
        res && res.status === ResponseStatus.SUCCESS
          ? setGames(res.data.results)
          : setError(res.statusText)
      )
      .catch((err) => setError(err));
  });

  return (
    <>
      <Heading mb={6} size='2xl'>
        Games
      </Heading>
      <VStack spacing='5' padding='0.5 rem'>
        {games?.map((g) => (
          <Box key={g.id}>
            <Heading size='md'>{g.name}</Heading>
            <Text>Release Date: {g.released}</Text>
            <Text>
              Available on: {g.platforms.map((p) => p.platform.name).join(", ")}
            </Text>
          </Box>
        ))}
      </VStack>
    </>
  );
};

export default GameGrid;
