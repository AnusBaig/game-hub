import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  HStack,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Select,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Tag,
  TagCloseButton,
  TagLabel,
  useDisclosure,
  Badge,
  Divider,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { BsFilter, BsX } from "react-icons/bs";
import useGameQueryStore from "../../store";

interface FilterState {
  metacriticRange: [number, number];
  releaseDateRange: [string, string];
  selectedTags: string[];
  selectedPublishers: string[];
  selectedDevelopers: string[];
  esrbRating: string;
}

const AdvancedFilters = () => {
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

  const [newTag, setNewTag] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newDeveloper, setNewDeveloper] = useState("");

  // Common tags for games with correct RAWG API slugs
  const commonTags = [
    { name: "Singleplayer", slug: "31" },
    { name: "Multiplayer", slug: "7" },
    { name: "Co-op", slug: "18" },
    { name: "RPG", slug: "24" },
    { name: "Atmospheric", slug: "13" },
    { name: "Great Soundtrack", slug: "42" },
    { name: "Action", slug: "14" },
    { name: "Adventure", slug: "30" },
    { name: "Strategy", slug: "10" },
    { name: "Shooter", slug: "36" },
    { name: "Platformer", slug: "83" },
    { name: "Puzzle", slug: "30" },
    { name: "Racing", slug: "8" },
    { name: "Sports", slug: "15" },
    { name: "Simulation", slug: "14" },
    { name: "Horror", slug: "4" },
    { name: "Survival", slug: "2" },
    { name: "Open World", slug: "37" },
    { name: "Indie", slug: "3" }
  ];

  const esrbRatings = [
    { value: "", label: "Any Rating" },
    { value: "everyone", label: "Everyone" },
    { value: "everyone-10-plus", label: "Everyone 10+" },
    { value: "teen", label: "Teen" },
    { value: "mature", label: "Mature 17+" },
    { value: "adults-only", label: "Adults Only 18+" },
  ];

  // Common publishers with correct slugs
  const commonPublishers = [
    { name: "Valve", slug: "valve" },
    { name: "Electronic Arts", slug: "electronic-arts" },
    { name: "Square Enix", slug: "square-enix" },
    { name: "Ubisoft", slug: "ubisoft-entertainment" },
    { name: "Microsoft Studios", slug: "microsoft-studios" },
    { name: "SEGA", slug: "sega-2" },
    { name: "Activision", slug: "activision" },
    { name: "Sony Interactive Entertainment", slug: "sony-interactive-entertainment" },
    { name: "Nintendo", slug: "nintendo" }
  ];

  // Common developers with correct slugs
  const commonDevelopers = [
    { name: "Valve Software", slug: "valve-software" },
    { name: "Ubisoft Montreal", slug: "ubisoft-montreal" },
    { name: "Square Enix", slug: "square-enix" },
    { name: "Capcom", slug: "capcom" },
    { name: "Bethesda Game Studios", slug: "bethesda-game-studios" },
    { name: "CD Projekt RED", slug: "cd-projekt-red" },
    { name: "Rockstar North", slug: "rockstar-north" },
    { name: "Naughty Dog", slug: "naughty-dog" }
  ];

  // Helper function to get tag name from slug/ID
  const getTagName = (tagId: string) => {
    const tag = commonTags.find(t => t.slug === tagId);
    return tag ? tag.name : tagId;
  };

  // Helper function to get publisher name from slug
  const getPublisherName = (publisherSlug: string) => {
    const publisher = commonPublishers.find(p => p.slug === publisherSlug);
    return publisher ? publisher.name : publisherSlug;
  };

  // Helper function to get developer name from slug
  const getDeveloperName = (developerSlug: string) => {
    const developer = commonDevelopers.find(d => d.slug === developerSlug);
    return developer ? developer.name : developerSlug;
  };

  useEffect(() => {
    // Initialize from store
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

  const addTag = (tag: string) => {
    if (tag && !filterState.selectedTags.includes(tag)) {
      setFilterState(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, tag]
      }));
    }
    setNewTag("");
  };

  const addCommonTag = (tagSlug: string) => {
    if (tagSlug && !filterState.selectedTags.includes(tagSlug)) {
      setFilterState(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, tagSlug]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag)
    }));
  };

  const addPublisher = (publisher: string) => {
    if (publisher && !filterState.selectedPublishers.includes(publisher)) {
      setFilterState(prev => ({
        ...prev,
        selectedPublishers: [...prev.selectedPublishers, publisher]
      }));
    }
    setNewPublisher("");
  };

  const addCommonPublisher = (publisherSlug: string) => {
    if (publisherSlug && !filterState.selectedPublishers.includes(publisherSlug)) {
      setFilterState(prev => ({
        ...prev,
        selectedPublishers: [...prev.selectedPublishers, publisherSlug]
      }));
    }
  };

  const removePublisher = (publisher: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedPublishers: prev.selectedPublishers.filter(p => p !== publisher)
    }));
  };

  const addDeveloper = (developer: string) => {
    if (developer && !filterState.selectedDevelopers.includes(developer)) {
      setFilterState(prev => ({
        ...prev,
        selectedDevelopers: [...prev.selectedDevelopers, developer]
      }));
    }
    setNewDeveloper("");
  };

  const addCommonDeveloper = (developerSlug: string) => {
    if (developerSlug && !filterState.selectedDevelopers.includes(developerSlug)) {
      setFilterState(prev => ({
        ...prev,
        selectedDevelopers: [...prev.selectedDevelopers, developerSlug]
      }));
    }
  };

  const removeDeveloper = (developer: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedDevelopers: prev.selectedDevelopers.filter(d => d !== developer)
    }));
  };

  const applyFilters = () => {
    const [minScore, maxScore] = filterState.metacriticRange;
    const [afterDate, beforeDate] = filterState.releaseDateRange;

    // Uncomment for debugging
    // console.log("Applying filters:", filterState);
    // console.log("Metacritic range:", minScore, maxScore);
    // console.log("ESRB rating:", filterState.esrbRating);

    // Apply metacritic range (only if different from default 0-100)
    if (minScore > 0 || maxScore < 100) {
      setMetacriticRange(minScore, maxScore);
    } else {
      setMetacriticRange(undefined, undefined);
    }
    
    // Apply date range
    setReleaseDateRange(
      afterDate || undefined,
      beforeDate || undefined
    );
    
    // Apply other filters
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
              {/* Metacritic Score Range */}
              <FormControl>
                <FormLabel>Metacritic Score Range</FormLabel>
                <RangeSlider
                  value={filterState.metacriticRange}
                  onChange={handleMetacriticChange}
                  min={0}
                  max={100}
                  step={5}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm">
                    Min: {filterState.metacriticRange[0]}
                  </Text>
                  <Text fontSize="sm">
                    Max: {filterState.metacriticRange[1]}
                  </Text>
                </HStack>
              </FormControl>

              <Divider />

              {/* Release Date Range */}
              <FormControl>
                <FormLabel>Release Date Range</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={filterState.releaseDateRange[0]}
                    onChange={(e) => handleReleaseDateChange("after", e.target.value)}
                    placeholder="From"
                  />
                  <Text>to</Text>
                  <Input
                    type="date"
                    value={filterState.releaseDateRange[1]}
                    onChange={(e) => handleReleaseDateChange("before", e.target.value)}
                    placeholder="To"
                  />
                </HStack>
              </FormControl>

              <Divider />

              {/* ESRB Rating */}
              <FormControl>
                <FormLabel>ESRB Rating</FormLabel>
                <Select
                  value={filterState.esrbRating}
                  onChange={(e) => setFilterState(prev => ({
                    ...prev,
                    esrbRating: e.target.value
                  }))}
                >
                  {esrbRatings.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              {/* Tags */}
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Wrap mb={2}>
                  {commonTags.map(tag => (
                    <WrapItem key={tag.slug}>
                      <Button
                        size="sm"
                        variant={filterState.selectedTags.includes(tag.slug) ? "solid" : "outline"}
                        onClick={() => filterState.selectedTags.includes(tag.slug) 
                          ? removeTag(tag.slug) 
                          : addCommonTag(tag.slug)
                        }
                      >
                        {tag.name}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
                <HStack>
                  <Input
                    placeholder="Add custom tag ID (e.g. 31 for singleplayer)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag(newTag)}
                  />
                  <Button onClick={() => addTag(newTag)} size="sm">
                    Add
                  </Button>
                </HStack>
                {filterState.selectedTags.length > 0 && (
                  <Wrap mt={2}>
                    {filterState.selectedTags.map(tag => (
                      <WrapItem key={tag}>
                        <Tag colorScheme="blue">
                          <TagLabel>{getTagName(tag)}</TagLabel>
                          <TagCloseButton onClick={() => removeTag(tag)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>

              <Divider />

              {/* Publishers */}
              <FormControl>
                <FormLabel>Publishers</FormLabel>
                <Wrap mb={2}>
                  {commonPublishers.map(publisher => (
                    <WrapItem key={publisher.slug}>
                      <Button
                        size="sm"
                        variant={filterState.selectedPublishers.includes(publisher.slug) ? "solid" : "outline"}
                        onClick={() => filterState.selectedPublishers.includes(publisher.slug) 
                          ? removePublisher(publisher.slug) 
                          : addCommonPublisher(publisher.slug)
                        }
                      >
                        {publisher.name}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
                <HStack>
                  <Input
                    placeholder="Add custom publisher slug (e.g. valve-software)"
                    value={newPublisher}
                    onChange={(e) => setNewPublisher(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPublisher(newPublisher)}
                  />
                  <Button onClick={() => addPublisher(newPublisher)} size="sm">
                    Add
                  </Button>
                </HStack>
                {filterState.selectedPublishers.length > 0 && (
                  <Wrap mt={2}>
                    {filterState.selectedPublishers.map(publisher => (
                      <WrapItem key={publisher}>
                        <Tag colorScheme="green">
                          <TagLabel>{getPublisherName(publisher)}</TagLabel>
                          <TagCloseButton onClick={() => removePublisher(publisher)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>

              <Divider />

              {/* Developers */}
              <FormControl>
                <FormLabel>Developers</FormLabel>
                <Wrap mb={2}>
                  {commonDevelopers.map(developer => (
                    <WrapItem key={developer.slug}>
                      <Button
                        size="sm"
                        variant={filterState.selectedDevelopers.includes(developer.slug) ? "solid" : "outline"}
                        onClick={() => filterState.selectedDevelopers.includes(developer.slug) 
                          ? removeDeveloper(developer.slug) 
                          : addCommonDeveloper(developer.slug)
                        }
                      >
                        {developer.name}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
                <HStack>
                  <Input
                    placeholder="Add custom developer slug (e.g. cd-projekt-red)"
                    value={newDeveloper}
                    onChange={(e) => setNewDeveloper(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addDeveloper(newDeveloper)}
                  />
                  <Button onClick={() => addDeveloper(newDeveloper)} size="sm">
                    Add
                  </Button>
                </HStack>
                {filterState.selectedDevelopers.length > 0 && (
                  <Wrap mt={2}>
                    {filterState.selectedDevelopers.map(developer => (
                      <WrapItem key={developer}>
                        <Tag colorScheme="purple">
                          <TagLabel>{getDeveloperName(developer)}</TagLabel>
                          <TagCloseButton onClick={() => removeDeveloper(developer)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>
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

export default AdvancedFilters;