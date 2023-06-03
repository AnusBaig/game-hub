import { Button, Image } from "@chakra-ui/react";
import getCroppedImageUrl from "../../services/imagUrl";
import Genre from "../../models/genre";
import GenrePicContainer from "./GenrePicContainer";

interface Props {
  genre: Genre;
  selectedGenre?: Genre;
  onSelect: (genre: Genre) => void;
}

const GenreItem = ({ genre, selectedGenre, onSelect }: Props) => {
  const isSelectedGenre = (genre: Genre) =>
    selectedGenre && genre.id == selectedGenre.id;

  return (
    <>
      <GenrePicContainer>
        <Image
          src={getCroppedImageUrl(genre.image_background)}
          alt={"Image of " + genre.name}
          borderRadius='inherit'
          boxSize='inherit'
          objectFit='cover'
        />
      </GenrePicContainer>
      <Button
        bg='none'
        textAlign='left'
        whiteSpace='normal'
        fontWeight={isSelectedGenre(genre) ? "bold" : "normal"}
        bgColor={isSelectedGenre(genre) ? "gray.500" : ""}
        onClick={() => onSelect(genre)}
      >
        {genre.name}
      </Button>
    </>
  );
};

export default GenreItem;
