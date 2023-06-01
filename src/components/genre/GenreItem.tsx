import { Button, Image } from "@chakra-ui/react";
import getCroppedImageUrl from "../../services/image-url";
import Genre from "../../models/genre";
import GenrePicContainer from "./GenrePicContainer";

interface Props {
  genre: Genre;
  selectedGenre?: Genre;
  onSelect: (genre: Genre) => void;
}

const GenreItem = ({ genre, selectedGenre, onSelect }: Props) => {
  return (
    <>
      <GenrePicContainer>
        <Image
          src={getCroppedImageUrl(genre.image_background)}
          alt={"Image of " + genre.name}
          borderRadius='inherit'
          boxSize='inherit'
        />
      </GenrePicContainer>
      <Button
        bg='none'
        textAlign='left'
        fontWeight={genre.id == selectedGenre?.id ? "bold" : "normal"}
        bgColor={genre.id == selectedGenre?.id ? "gray.500" : ""}
        onClick={() => onSelect(genre)}
      >
        {genre.name}
      </Button>
    </>
  );
};

export default GenreItem;
