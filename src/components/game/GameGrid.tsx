import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import useGames from "../../hooks/useGames";

const GameGrid = () => {
  const { games, error } = useGames();

  return (
    <>
      <Heading mb={6} size='2xl'>
        Games
      </Heading>
      {error && error.length > 0 ? (
        <Text>{error}</Text>
      ) : (
        <>
          <VStack spacing='5' padding='0.5 rem'>
            {games?.map((g) => (
              <Box key={g.id}>
                <Heading size='md'>{g.name}</Heading>
                <Text>Release Date: {g.released}</Text>
                <Text>
                  Available on:{" "}
                  {g.platforms.map((p) => p.platform.name).join(", ")}
                </Text>
              </Box>
            ))}
          </VStack>
        </>
      )}
    </>
  );
};

export default GameGrid;
