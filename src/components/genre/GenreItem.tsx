import { Button, Image } from "@chakra-ui/react";
import Genre from "../../models/genre";
import getCroppedImageUrl from "../../services/imagUrl";
import useGameQueryStore from "../../store";
import GenrePicContainer from "./GenrePicContainer";

interface Props {
  genre: Genre;
}

const GenreItem = ({ genre }: Props) => {
  const genreId = useGameQueryStore((s) => s.gameQuery.genreId);
  const setGenreId = useGameQueryStore((s) => s.setGenreId);

  const isSelectedGenre = (genre: Genre) => genre.id == genreId;

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
        onClick={() => setGenreId(genre.id)}
      >
        {genre.name}
      </Button>
    </>
  );
};

export default GenreItem;
