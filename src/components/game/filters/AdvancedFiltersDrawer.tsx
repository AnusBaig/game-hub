import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  VStack,
  useDisclosure,
  Badge,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { BsFilter } from "react-icons/bs";
import useGameQueryStore from "../../../store";
import MetacriticFilter from "./MetacriticFilter";
import ReleaseDateFilter from "./ReleaseDateFilter";
import EsrbRatingFilter from "./EsrbRatingFilter";
import TagSelector from "./TagSelector";
import PublisherSelector from "./PublisherSelector";
import DeveloperSelector from "./DeveloperSelector";

interface FilterState {
  metacriticRange: [number, number];
  releaseDateRange: [string, string];
  selectedTags: string[];
  selectedPublishers: string[];
  selectedDevelopers: string[];
  esrbRating: string;
}

const AdvancedFiltersDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const gameQuery = useGameQueryStore((s) => s.gameQuery);
  const setMetacriticRange = useGameQueryStore((s) => s.setMetacriticRange);
  const setReleaseDateRange = useGameQueryStore((s) => s.setReleaseDateRange);
  const setTags = useGameQueryStore((s) => s.setTags);
  const setPublishers = useGameQueryStore((s) => s.setPublishers);
  const setDevelopers = useGameQueryStore((s) => s.setDevelopers);
  const setEsrbRating = useGameQueryStore((s) => s.setEsrbRating);
  const clearFilters = useGameQueryStore((s) => s.clearFilters);

  const [filterState, setFilterState] = useState<FilterState>({
    metacriticRange: [0, 100],
    releaseDateRange: ["", ""],
    selectedTags: [],
    selectedPublishers: [],
    selectedDevelopers: [],
    esrbRating: "",
  });

  useEffect(() => {
    setFilterState({
      metacriticRange: [
        gameQuery.metacriticMin || 0,
        gameQuery.metacriticMax || 100
      ],
      releaseDateRange: [
        gameQuery.releasedAfter || "",
        gameQuery.releasedBefore || ""
      ],
      selectedTags: gameQuery.tags || [],
      selectedPublishers: gameQuery.publishers || [],
      selectedDevelopers: gameQuery.developers || [],
      esrbRating: gameQuery.esrbRating || "",
    });
  }, [gameQuery]);

  const handleMetacriticChange = (value: number[]) => {
    setFilterState(prev => ({
      ...prev,
      metacriticRange: [value[0], value[1]]
    }));
  };

  const handleReleaseDateChange = (field: "after" | "before", value: string) => {
    setFilterState(prev => ({
      ...prev,
      releaseDateRange: field === "after" 
        ? [value, prev.releaseDateRange[1]]
        : [prev.releaseDateRange[0], value]
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFilterState(prev => ({ ...prev, selectedTags: tags }));
  };

  const handlePublishersChange = (publishers: string[]) => {
    setFilterState(prev => ({ ...prev, selectedPublishers: publishers }));
  };

  const handleDevelopersChange = (developers: string[]) => {
    setFilterState(prev => ({ ...prev, selectedDevelopers: developers }));
  };

  const handleEsrbChange = (rating: string) => {
    setFilterState(prev => ({ ...prev, esrbRating: rating }));
  };

  const applyFilters = () => {
    const [minScore, maxScore] = filterState.metacriticRange;
    const [afterDate, beforeDate] = filterState.releaseDateRange;

    if (minScore > 0 || maxScore < 100) {
      setMetacriticRange(minScore, maxScore);
    } else {
      setMetacriticRange(undefined, undefined);
    }
    
    setReleaseDateRange(
      afterDate || undefined,
      beforeDate || undefined
    );
    
    setTags(filterState.selectedTags);
    setPublishers(filterState.selectedPublishers);
    setDevelopers(filterState.selectedDevelopers);
    setEsrbRating(filterState.esrbRating || undefined);
    
    onClose();
  };

  const resetFilters = () => {
    setFilterState({
      metacriticRange: [0, 100],
      releaseDateRange: ["", ""],
      selectedTags: [],
      selectedPublishers: [],
      selectedDevelopers: [],
      esrbRating: "",
    });
    clearFilters();
  };

  const hasActiveFilters = gameQuery.metacriticMin || gameQuery.metacriticMax ||
    gameQuery.releasedAfter || gameQuery.releasedBefore ||
    (gameQuery.tags && gameQuery.tags.length > 0) ||
    (gameQuery.publishers && gameQuery.publishers.length > 0) ||
    (gameQuery.developers && gameQuery.developers.length > 0) ||
    gameQuery.esrbRating;

  return (
    <>
      <Tooltip label="Advanced Filters" hasArrow>
        <IconButton
          aria-label="Advanced filters"
          icon={<BsFilter />}
          onClick={onOpen}
          variant="outline"
          position="relative"
        >
          {hasActiveFilters && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              px={2}
              py={1}
              fontSize="xs"
              position="absolute"
              top="-8px"
              right="-8px"
            >
              !
            </Badge>
          )}
        </IconButton>
      </Tooltip>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Advanced Filters</DrawerHeader>

          <DrawerBody>
            <VStack spacing={6} align="stretch">
              <MetacriticFilter
                value={filterState.metacriticRange}
                onChange={handleMetacriticChange}
              />

              <ReleaseDateFilter
                value={filterState.releaseDateRange}
                onChange={handleReleaseDateChange}
              />

              <EsrbRatingFilter
                value={filterState.esrbRating}
                onChange={handleEsrbChange}
              />

              <TagSelector
                selectedTags={filterState.selectedTags}
                onChange={handleTagsChange}
              />

              <PublisherSelector
                selectedPublishers={filterState.selectedPublishers}
                onChange={handlePublishersChange}
              />

              <DeveloperSelector
                selectedDevelopers={filterState.selectedDevelopers}
                onChange={handleDevelopersChange}
              />
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={resetFilters}>
              Reset
            </Button>
            <Button colorScheme="blue" onClick={applyFilters}>
              Apply Filters
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AdvancedFiltersDrawer;