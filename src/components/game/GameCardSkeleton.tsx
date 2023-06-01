import {
  Card,
  CardBody,
  CardFooter,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import GameImageContainer from "./GameImageContainer";

const GameCardSkeleton = () => {
  return (
    <Card>
      <GameImageContainer>
        <Skeleton height='inherit' />
      </GameImageContainer>
      <CardBody>
        <Skeleton mx={14} mb={6} height={8} borderRadius={5} />
        <SkeletonText mt={4} noOfLines={3} spacing={3} />
      </CardBody>
      <CardFooter>
        <SkeletonText noOfLines={1} />
      </CardFooter>
    </Card>
  );
};

export default GameCardSkeleton;
