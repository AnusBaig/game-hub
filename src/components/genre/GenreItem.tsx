import { HStack, Image, Text } from "@chakra-ui/react";
import getCroppedImageUrl from "../../services/image-url";
import Genre from "../../models/genre";
import GenrePicContainer from "./GenrePicContainer";

interface Props {
  genre: Genre;
}

const GenreItem = ({ genre }: Props) => {
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
      <Text fontSize='lg'>{genre.name}</Text>
    </>
  );
};

export default GenreItem;
