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

interface Props {
  game: Game;
}

const GameCard = ({ game }: Props) => {
  return (
    <Card textAlign='center' borderRadius='10px' overflow='hidden'>
      <Image
        src={game.background_image}
        alt={"Image for " + game.name}
        height='15rem'
        objectFit='cover'
      />
      <CardBody>
        <Heading fontSize='2xl'>{game.name}</Heading>
        <Text>Release Date: {game.released}</Text>
      </CardBody>
      <CardFooter>
        <PlatformIconList platforms={game.parent_platforms} />
      </CardFooter>
    </Card>
  );
};

export default GameCard;
