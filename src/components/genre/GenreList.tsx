import { Box, HStack, Heading, VStack } from "@chakra-ui/react";
import Genre from "../../models/genre";
import useData from "../../hooks/useData";
import { Endpoints } from "../../constants/endpoints";

const GenreList = () => {
  const { data, error, isLoading } = useData<Genre>(
    Endpoints.FETCH_ALL_GENERES
  );

  return (
    <Box padding={4}>
      <Heading mb={6} size='lg'>
        Generes
      </Heading>
      {data &&
        data.map((genre) => (
          <VStack spacing={3} key={genre.id}>
            <Box>{genre.name}</Box>
          </VStack>
        ))}
    </Box>
  );
};

export default GenreList;
