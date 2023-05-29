import {
  Card,
  CardBody,
  CardFooter,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";

const GameCardSkeleton = () => {
  return (
    <Card borderRadius={10} width={350} height={400} overflow='hidden'>
      <Skeleton>
        <CardBody>
          <SkeletonText noOfLines={4} spacing={4} />
        </CardBody>
        <CardFooter>
          <SkeletonText noOfLines={4} spacing={4} />
        </CardFooter>
      </Skeleton>
    </Card>
  );
};

export default GameCardSkeleton;
