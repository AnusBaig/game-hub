import { VStack } from "@chakra-ui/react";
import Genre from "../../models/genre";
import useData from "../../hooks/useData";
import { Endpoints } from "../../constants/endpoints";
import GenreItem from "./GenreItem";
import GenreItemSkeleton from "./GenreItemSkeleton";
import GenreItemContainer from "./GenreItemContainer";

interface Props {
  selectedGenre?: Genre;
  onSelectGenre: (genre: Genre) => void;
}

const GenreList = ({ selectedGenre, onSelectGenre }: Props) => {
  const { data, error, isLoading } = useData<Genre>(
    Endpoints.FETCH_ALL_GENERES
  );

  const skeletons = [...Array(10).keys()];

  return (
    <VStack spacing={6} padding={4} alignItems='start'>
      {isLoading
        ? skeletons.map((skeleton) => (
            <GenreItemContainer>
              <GenreItemSkeleton key={skeleton} />
            </GenreItemContainer>
          ))
        : data &&
          data.map((genre) => (
            <GenreItemContainer>
              <GenreItem
                key={genre.id}
                genre={genre}
                selectedGenre={selectedGenre}
                onSelect={onSelectGenre}
              />
            </GenreItemContainer>
          ))}
    </VStack>
  );
};

export default GenreList;
