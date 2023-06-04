import { Box, Heading, VStack, Text } from "@chakra-ui/react";
import Genre from "../../models/genre";
import GenreItem from "./GenreItem";
import GenreItemSkeleton from "./GenreItemSkeleton";
import GenreItemContainer from "./GenreItemContainer";
import useGeneres from "../../hooks/useGenres";

interface Props {
  selectedGenre?: Genre;
  onSelectGenre: (genre: Genre) => void;
}

const GenreList = ({ selectedGenre, onSelectGenre }: Props) => {
  const { data, error, isLoading } = useGeneres();

  const skeletons = [...Array(10).keys()];

  if (error) return <Text>{error}</Text>;

  return (
    <Box>
      <VStack spacing={6} alignItems='start'>
        {isLoading
          ? skeletons.map((skeleton) => (
              <GenreItemContainer key={skeleton}>
                <GenreItemSkeleton />
              </GenreItemContainer>
            ))
          : data &&
            data.map((genre) => (
              <GenreItemContainer key={genre.id}>
                <GenreItem
                  genre={genre}
                  selectedGenre={selectedGenre}
                  onSelect={onSelectGenre}
                />
              </GenreItemContainer>
            ))}
      </VStack>
    </Box>
  );
};

export default GenreList;
