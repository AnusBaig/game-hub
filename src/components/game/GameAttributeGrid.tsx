import { SimpleGrid } from "@chakra-ui/react";
import Genre from "../../models/genre";
import PlatformDetail from "../../models/platformDetail";
import Publisher from "../../models/responses/publisher";
import GameAttribute from "./GameAttribute";

interface Props {
  platforms: PlatformDetail[];
  genres: Genre[];
  publishers: Publisher[];
  metascore: number;
}

const GameAttributeGrid = ({
  platforms,
  genres,
  publishers,
  metascore,
}: Props) => {
  return (
    <SimpleGrid columns={2} gap={4} my={10}>
      <GameAttribute
        heading='Platforms'
        dataList={platforms.map(({ platform }) => platform.name)}
      />
      <GameAttribute
        heading='Metascore'
        dataList={[metascore]}
        showBadge={true}
      />
      <GameAttribute
        heading='Genres'
        dataList={genres.map((genre) => genre.name)}
      />
      <GameAttribute
        heading='Publishers'
        dataList={publishers.map((publisher) => publisher.name)}
      />
    </SimpleGrid>
  );
};

export default GameAttributeGrid;
