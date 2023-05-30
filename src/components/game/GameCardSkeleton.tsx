import {
  Card,
  CardBody,
  CardFooter,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";

const GameCardSkeleton = () => {
  return (
    <Card>
      <Skeleton>
        <CardBody>
          <SkeletonText mt={4} noOfLines={6} spacing={4} />
        </CardBody>
        <CardFooter>
          <SkeletonText noOfLines={4} spacing={4} />
        </CardFooter>
      </Skeleton>
    </Card>
  );
};

export default GameCardSkeleton;
