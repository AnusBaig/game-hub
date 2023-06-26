import { AspectRatio } from "@chakra-ui/react";
import useGameTrailer from "../../../hooks/useGameTrailer";
import TrailerCarousel from "./TrailerCarousel";
import TrailerHeading from "./TrailerHeading";

interface Props {
  gameId: number;
}

const GameTrailer = ({ gameId }: Props) => {
  const { data: trailer, isLoading } = useGameTrailer(gameId);

  if (isLoading || !trailer) return null;

  return (
    <>
      <TrailerHeading headingText={trailer.name} />
      <AspectRatio maxHeight={700}>
        <video poster={trailer.preview} src={trailer.data[480]} controls />
      </AspectRatio>
      <TrailerCarousel gameId={gameId} />
    </>
  );
};

export default GameTrailer;
