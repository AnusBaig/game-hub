import { Box, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import GenrePicContainer from "./GenrePicContainer";

const GenreItemSkeleton = () => {
  return (
    <>
      <GenrePicContainer>
        <SkeletonCircle boxSize='inherit' borderRadius='inherit' />
      </GenrePicContainer>
      <SkeletonText noOfLines={1} />
    </>
  );
};

export default GenreItemSkeleton;
