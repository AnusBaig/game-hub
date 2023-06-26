import { Box, Image, SimpleGrid } from "@chakra-ui/react";
import useGameScreenshots from "../../hooks/useGameScreenhots";
import SectionHeading from "../utils/SectionHeading";

interface Props {
  gameId: number;
}
const GameScreenshots = ({ gameId }: Props) => {
  const { data, isLoading, error } = useGameScreenshots({ gameId });

  if (isLoading || !data?.length) return null;

  return (
    <Box my={5}>
      <SectionHeading headingText='Screenshots' />

      <SimpleGrid
        columns={{
          sm: 1,
          md: 2,
          lg: 1,
          xl: 2,
        }}
        spacing={4}
      >
        {data.map((screenshot) => (
          <Image
            key={screenshot.id}
            src={screenshot.image}
            alt={screenshot.image}
            // maxWidth={screenshot.width}
            // maxHeight={screenshot.height}
            objectFit='cover'
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default GameScreenshots;
