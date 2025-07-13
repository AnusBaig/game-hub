import {
  Badge,
  Box,
  HStack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  Button,
} from "@chakra-ui/react";
import useGameQueryStore from "../../store";
import useGenre from "../../hooks/useGenre";
import usePlatform from "../../hooks/usePlatform";

// Tag ID to name mapping
const tagNames: { [key: string]: string } = {
  "31": "Singleplayer",
  "7": "Multiplayer", 
  "18": "Co-op",
  "24": "RPG",
  "13": "Atmospheric",
  "42": "Great Soundtrack",
  "14": "Action",
  "30": "Adventure", 
  "10": "Strategy",
  "36": "Shooter",
  "83": "Platformer",
  "8": "Racing",
  "15": "Sports",
  "4": "Horror",
  "2": "Survival",
  "37": "Open World",
  "3": "Indie"
};

// ESRB rating slug to readable name mapping
const esrbNames: { [key: string]: string } = {
  "everyone": "Everyone",
  "everyone-10-plus": "Everyone 10+",
  "teen": "Teen", 
  "mature": "Mature 17+",
  "adults-only": "Adults Only 18+"
};

// Publisher slug to readable name mapping
const publisherNames: { [key: string]: string } = {
  "valve": "Valve",
  "electronic-arts": "Electronic Arts",
  "square-enix": "Square Enix",
  "ubisoft-entertainment": "Ubisoft",
  "microsoft-studios": "Microsoft Studios",
  "sega-2": "SEGA",
  "activision": "Activision",
  "sony-interactive-entertainment": "Sony Interactive Entertainment",
  "nintendo": "Nintendo"
};

// Developer slug to readable name mapping
const developerNames: { [key: string]: string } = {
  "valve-software": "Valve Software",
  "ubisoft-montreal": "Ubisoft Montreal",
  "square-enix": "Square Enix",
  "capcom": "Capcom",
  "bethesda-game-studios": "Bethesda Game Studios",
  "cd-projekt-red": "CD Projekt RED",
  "rockstar-north": "Rockstar North",
  "naughty-dog": "Naughty Dog"
};

const ActiveFilters = () => {
  const gameQuery = useGameQueryStore((s) => s.gameQuery);
  const setGenreId = useGameQueryStore((s) => s.setGenreId);
  const setPlatformId = useGameQueryStore((s) => s.setPlatformId);
  const setSearch = useGameQueryStore((s) => s.setSearch);
  const setMetacriticRange = useGameQueryStore((s) => s.setMetacriticRange);
  const setReleaseDateRange = useGameQueryStore((s) => s.setReleaseDateRange);
  const setTags = useGameQueryStore((s) => s.setTags);
  const setPublishers = useGameQueryStore((s) => s.setPublishers);
  const setDevelopers = useGameQueryStore((s) => s.setDevelopers);
  const setEsrbRating = useGameQueryStore((s) => s.setEsrbRating);
  const clearFilters = useGameQueryStore((s) => s.clearFilters);

  const { data: selectedGenre } = useGenre(gameQuery.genreId);
  const { data: selectedPlatform } = usePlatform(gameQuery.platformId);

  const hasFilters = gameQuery.search || 
    gameQuery.genreId || 
    gameQuery.platformId ||
    gameQuery.metacriticMin !== undefined || 
    gameQuery.metacriticMax !== undefined ||
    gameQuery.releasedAfter || 
    gameQuery.releasedBefore ||
    (gameQuery.tags && gameQuery.tags.length > 0) ||
    (gameQuery.publishers && gameQuery.publishers.length > 0) ||
    (gameQuery.developers && gameQuery.developers.length > 0) ||
    gameQuery.esrbRating;

  if (!hasFilters) return null;

  const removeTag = (tag: string) => {
    setTags(gameQuery.tags?.filter(t => t !== tag) || []);
  };

  const removePublisher = (publisher: string) => {
    setPublishers(gameQuery.publishers?.filter(p => p !== publisher) || []);
  };

  const removeDeveloper = (developer: string) => {
    setDevelopers(gameQuery.developers?.filter(d => d !== developer) || []);
  };

  return (
    <Box mb={4}>
      <HStack justify="space-between" align="center" mb={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.500">
          Active Filters:
        </Text>
        <Button
          size="xs"
          variant="ghost"
          onClick={clearFilters}
          colorScheme="red"
        >
          Clear All
        </Button>
      </HStack>
      
      <Wrap spacing={2}>
        {/* Search */}
        {gameQuery.search && (
          <WrapItem>
            <Tag colorScheme="blue">
              <TagLabel>Search: {gameQuery.search}</TagLabel>
              <TagCloseButton onClick={() => setSearch("")} />
            </Tag>
          </WrapItem>
        )}

        {/* Genre */}
        {selectedGenre && (
          <WrapItem>
            <Tag colorScheme="green">
              <TagLabel>Genre: {selectedGenre.name}</TagLabel>
              <TagCloseButton onClick={() => setGenreId(0)} />
            </Tag>
          </WrapItem>
        )}

        {/* Platform */}
        {selectedPlatform && (
          <WrapItem>
            <Tag colorScheme="purple">
              <TagLabel>Platform: {selectedPlatform.name}</TagLabel>
              <TagCloseButton onClick={() => setPlatformId(0)} />
            </Tag>
          </WrapItem>
        )}

        {/* Metacritic Range */}
        {(gameQuery.metacriticMin !== undefined || gameQuery.metacriticMax !== undefined) && 
         ((gameQuery.metacriticMin ?? 0) > 0 || (gameQuery.metacriticMax ?? 100) < 100) && (
          <WrapItem>
            <Tag colorScheme="orange">
              <TagLabel>
                Score: {gameQuery.metacriticMin ?? 0}-{gameQuery.metacriticMax ?? 100}
              </TagLabel>
              <TagCloseButton onClick={() => setMetacriticRange(undefined, undefined)} />
            </Tag>
          </WrapItem>
        )}

        {/* Release Date Range */}
        {(gameQuery.releasedAfter || gameQuery.releasedBefore) && (
          <WrapItem>
            <Tag colorScheme="teal">
              <TagLabel>
                Released: {gameQuery.releasedAfter || "Any"} to {gameQuery.releasedBefore || "Any"}
              </TagLabel>
              <TagCloseButton onClick={() => setReleaseDateRange(undefined, undefined)} />
            </Tag>
          </WrapItem>
        )}

        {/* ESRB Rating */}
        {gameQuery.esrbRating && (
          <WrapItem>
            <Tag colorScheme="pink">
              <TagLabel>ESRB: {esrbNames[gameQuery.esrbRating] || gameQuery.esrbRating}</TagLabel>
              <TagCloseButton onClick={() => setEsrbRating(undefined)} />
            </Tag>
          </WrapItem>
        )}

        {/* Tags */}
        {gameQuery.tags?.map(tag => (
          <WrapItem key={tag}>
            <Tag colorScheme="cyan">
              <TagLabel>Tag: {tagNames[tag] || tag}</TagLabel>
              <TagCloseButton onClick={() => removeTag(tag)} />
            </Tag>
          </WrapItem>
        ))}

        {/* Publishers */}
        {gameQuery.publishers?.map(publisher => (
          <WrapItem key={publisher}>
            <Tag colorScheme="yellow">
              <TagLabel>Publisher: {publisherNames[publisher] || publisher}</TagLabel>
              <TagCloseButton onClick={() => removePublisher(publisher)} />
            </Tag>
          </WrapItem>
        ))}

        {/* Developers */}
        {gameQuery.developers?.map(developer => (
          <WrapItem key={developer}>
            <Tag colorScheme="red">
              <TagLabel>Developer: {developerNames[developer] || developer}</TagLabel>
              <TagCloseButton onClick={() => removeDeveloper(developer)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default ActiveFilters;