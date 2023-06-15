import { Box, Text, VStack } from "@chakra-ui/react";
import useGeneres from "../../hooks/useGenres";
import GenreItem from "./GenreItem";
import GenreItemContainer from "./GenreItemContainer";
import GenreItemSkeleton from "./GenreItemSkeleton";

const GenreList = () => {
  const { data, error, isLoading } = useGeneres();

  const skeletons = [...Array(10).keys()];

  if (error && isLoading) return <Text>{error}</Text>;

  return (
    <Box>
      <VStack spacing={6} alignItems='start'>
        {isLoading
          ? skeletons.map((skeleton) => (
              <GenreItemContainer key={skeleton}>
                <GenreItemSkeleton />
              </GenreItemContainer>
            ))
          : data?.map((genre) => (
              <GenreItemContainer key={genre.id}>
                <GenreItem genre={genre} />
              </GenreItemContainer>
            ))}
      </VStack>
    </Box>
  );
};

export default GenreList;
