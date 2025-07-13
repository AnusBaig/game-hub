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
import {
  getTagName,
  getPublisherName,
  getDeveloperName,
  getEsrbRatingLabel
} from "../../constants/gameFilters";





const ActiveFilters = () => {
  const gameQuery = useGameQueryStore((s) => s.gameQuery);
  const clearGenre = useGameQueryStore((s) => s.clearGenre);
  const clearPlatform = useGameQueryStore((s) => s.clearPlatform);
  const clearSearch = useGameQueryStore((s) => s.clearSearch);
  const clearMetacriticRange = useGameQueryStore((s) => s.clearMetacriticRange);
  const clearReleaseDateRange = useGameQueryStore((s) => s.clearReleaseDateRange);
  const setTags = useGameQueryStore((s) => s.setTags);
  const setPublishers = useGameQueryStore((s) => s.setPublishers);
  const setDevelopers = useGameQueryStore((s) => s.setDevelopers);
  const clearEsrbRating = useGameQueryStore((s) => s.clearEsrbRating);
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
              <TagCloseButton onClick={clearSearch} />
            </Tag>
          </WrapItem>
        )}

        {/* Genre */}
        {selectedGenre && (
          <WrapItem>
            <Tag colorScheme="green">
              <TagLabel>Genre: {selectedGenre.name}</TagLabel>
              <TagCloseButton onClick={clearGenre} />
            </Tag>
          </WrapItem>
        )}

        {/* Platform */}
        {selectedPlatform && (
          <WrapItem>
            <Tag colorScheme="purple">
              <TagLabel>Platform: {selectedPlatform.name}</TagLabel>
              <TagCloseButton onClick={clearPlatform} />
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
              <TagCloseButton onClick={clearMetacriticRange} />
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
              <TagCloseButton onClick={clearReleaseDateRange} />
            </Tag>
          </WrapItem>
        )}

        {/* ESRB Rating */}
        {gameQuery.esrbRating && (
          <WrapItem>
            <Tag colorScheme="pink">
              <TagLabel>ESRB: {getEsrbRatingLabel(gameQuery.esrbRating)}</TagLabel>
              <TagCloseButton onClick={clearEsrbRating} />
            </Tag>
          </WrapItem>
        )}

        {/* Tags */}
        {gameQuery.tags?.map(tag => (
          <WrapItem key={tag}>
            <Tag colorScheme="cyan">
              <TagLabel>Tag: {getTagName(tag)}</TagLabel>
              <TagCloseButton onClick={() => removeTag(tag)} />
            </Tag>
          </WrapItem>
        ))}

        {/* Publishers */}
        {gameQuery.publishers?.map(publisher => (
          <WrapItem key={publisher}>
            <Tag colorScheme="yellow">
              <TagLabel>Publisher: {getPublisherName(publisher)}</TagLabel>
              <TagCloseButton onClick={() => removePublisher(publisher)} />
            </Tag>
          </WrapItem>
        ))}

        {/* Developers */}
        {gameQuery.developers?.map(developer => (
          <WrapItem key={developer}>
            <Tag colorScheme="red">
              <TagLabel>Developer: {getDeveloperName(developer)}</TagLabel>
              <TagCloseButton onClick={() => removeDeveloper(developer)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default ActiveFilters;