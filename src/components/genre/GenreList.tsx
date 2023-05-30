import { VStack, Box, Text, Image, HStack } from "@chakra-ui/react";
import Genre from "../../models/genre";
import useData from "../../hooks/useData";
import { Endpoints } from "../../constants/endpoints";
import getCroppedImageUrl from "../../services/image-url";

const GenreList = () => {
  const { data, error, isLoading } = useData<Genre>(
    Endpoints.FETCH_ALL_GENERES
  );

  return (
    <VStack spacing={6} padding={4} alignItems='start'>
      {data &&
        data.map((genre) => (
          <HStack spacing={4} justifyContent='flex-start'>
            <Image
              src={getCroppedImageUrl(genre.image_background)}
              alt={"Image of " + genre.name}
              boxSize={10}
              borderRadius={8}
            />
            <Text fontSize='lg'>{genre.name}</Text>
          </HStack>
        ))}
    </VStack>
  );
};

export default GenreList;
