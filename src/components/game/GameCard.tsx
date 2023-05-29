import {
  Box,
  Card,
  CardBody,
  CardFooter,
  HStack,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import Game from "../../models/game";
import PlatformIconList from "./PlatformIconList";
import CriticScore from "./CriticScore";
import ReleaseDate from "./ReleaseDate";
import getCroppedImageUrl from "../../services/image-url";

interface Props {
  game: Game;
}

const GameCard = ({ game }: Props) => {
  return (
    <Card borderRadius={10} textAlign='center' overflow='hidden'>
      <Image
        src={getCroppedImageUrl(game.background_image)}
        alt={"Image for " + game.name}
        height='15rem'
        objectFit='cover'
      />
      <CardBody>
        <Heading fontSize='2xl'>{game.name}</Heading>
        <HStack justifyContent='space-between'>
          <ReleaseDate date={game.released} />
          <CriticScore score={game.metacritic} />
        </HStack>
      </CardBody>
      <CardFooter>
        <PlatformIconList platforms={game.parent_platforms} />
      </CardFooter>
    </Card>
  );
};

export default GameCard;
