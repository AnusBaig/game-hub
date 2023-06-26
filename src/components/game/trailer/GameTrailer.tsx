import { AspectRatio, Hide } from "@chakra-ui/react";
import useGameTrailer from "../../../hooks/useGameTrailer";
import SectionHeading from "../../utils/SectionHeading";
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
      <Hide above='lg'>
        <SectionHeading headingText='Game Trailer' />
      </Hide>

      <AspectRatio maxHeight={700}>
        <video poster={trailer.preview} src={trailer.data[480]} controls />
      </AspectRatio>
      <Hide below='md'>
        <TrailerHeading headingText={trailer.name} />
      </Hide>
      <Hide below='md'>
        <TrailerCarousel gameId={gameId} />
      </Hide>
    </>
  );
};

export default GameTrailer;
