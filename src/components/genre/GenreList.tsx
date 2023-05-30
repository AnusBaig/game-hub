import { Box, HStack, Heading, VStack } from "@chakra-ui/react";
import useGenres from "../../hooks/useGeneres";

const GenreList = () => {
  const { genres, error, isLoading } = useGenres();

  return (
    <Box padding={4}>
      <Heading mb={6} size='lg'>
        Generes
      </Heading>
      {genres &&
        genres.map((genre) => (
          <VStack spacing={3} key={genre.id}>
            <Box>{genre.name}</Box>
          </VStack>
        ))}
    </Box>
  );
};

export default GenreList;
