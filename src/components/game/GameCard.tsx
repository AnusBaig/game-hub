import {
  Card,
  CardBody,
  CardFooter,
  HStack,
  Heading,
  Image,
} from "@chakra-ui/react";
import Game from "../../models/game";
import PlatformIconList from "./PlatformIconList";
import CriticScore from "./CriticScore";
import ReleaseDate from "./ReleaseDate";
import getCroppedImageUrl from "../../services/imagUrl";
import GameImageContainer from "./GameImageContainer";
import Rating from "./Rating";

interface Props {
  game: Game;
}

const GameCard = ({ game }: Props) => {
  return (
    <Card borderRadius={10} textAlign='center' overflow='hidden'>
      <GameImageContainer>
        <Image
          src={getCroppedImageUrl(game.background_image)}
          alt={"Image for " + game.name}
          minHeight='inherit'
          maxHeight='inherit'
          width='100%'
          objectFit='inherit'
        />
      </GameImageContainer>
      <CardBody>
        <Heading fontSize='2xl'>{game.name}</Heading>
        <HStack justifyContent='space-between'>
          <ReleaseDate date={game.released} />
          <CriticScore score={game.metacritic} />
        </HStack>
      </CardBody>
      <CardFooter>
        <Rating rating={game.rating_top} />
        <PlatformIconList platforms={game.parent_platforms} />
      </CardFooter>
    </Card>
  );
};

export default GameCard;
