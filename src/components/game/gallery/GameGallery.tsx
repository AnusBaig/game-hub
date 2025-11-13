import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, Spinner, Text } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { MediaCollection, MediaItem } from "../../../models/mediaItem";
import useProgressiveGameMedia from "../../../hooks/useProgressiveGameMedia";
import useGameDetail from "../../../hooks/useGameDetail";
import Loader from "../../utils/Loader";
import SectionHeading from "../../utils/SectionHeading";
import MediaGrid from "./MediaGrid";
import MediaViewer from "./MediaViewer";

interface Props {
  gameId: number;
}

const GameGallery = ({ gameId }: Props) => {
  const { data: gameDetail } = useGameDetail(gameId.toString());
  const gameDetails = gameDetail ? {
    name: gameDetail.name,
    name_original: gameDetail.name_original,
    released: gameDetail.released
  } : undefined;
  
  const { data: mediaCollection, isLoading, isStillLoading, error } = useProgressiveGameMedia(gameId, gameDetails);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openInEditMode, setOpenInEditMode] = useState(false);

  // Show loader only if no data available yet
  if (isLoading && mediaCollection.total === 0) return <Loader />;
  if (error || !mediaCollection) return null;

  const { screenshots, videos, artwork, gameplay } = mediaCollection;

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
    setOpenInEditMode(false); // Regular view mode
  };

  const handleEditMedia = (media: MediaItem) => {
    setSelectedMedia(media);
    setOpenInEditMode(true); // Edit mode
  };

  const handleCloseViewer = () => {
    setSelectedMedia(null);
    setOpenInEditMode(false);
  };

  const getMediaForTab = (tabIndex: number): MediaItem[] => {
    switch (tabIndex) {
      case 0: return screenshots;
      case 1: return videos;
      case 2: return artwork;
      case 3: return gameplay;
      default: return screenshots;
    }
  };

  // Get current tab's media - arrays should be stable from the hook
  const currentTabMedia = getMediaForTab(selectedTab);

  return (
    <Box my={5}>
      <SectionHeading headingText="Media Gallery" />
      
      <Tabs 
        index={selectedTab} 
        onChange={setSelectedTab}
        variant="enclosed"
        colorScheme="teal"
      >
        <TabList>
          <Tab>Screenshots ({screenshots.length})</Tab>
          <Tab>Videos ({videos.length})</Tab>
          <Tab>Artwork ({artwork.length})</Tab>
          <Tab>GamePlay ({gameplay.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <MediaGrid 
              media={screenshots}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
            {isStillLoading && (
              <Flex 
                justify="center" 
                align="center" 
                py={4} 
                gap={2}
                color="gray.500"
              >
                <Spinner size="sm" />
                <Text fontSize="sm">Loading more content...</Text>
              </Flex>
            )}
          </TabPanel>
          
          <TabPanel px={0}>
            <MediaGrid 
              media={videos}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
            {isStillLoading && (
              <Flex 
                justify="center" 
                align="center" 
                py={4} 
                gap={2}
                color="gray.500"
              >
                <Spinner size="sm" />
                <Text fontSize="sm">Loading more content...</Text>
              </Flex>
            )}
          </TabPanel>
          
          <TabPanel px={0}>
            <MediaGrid
              media={artwork}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
            {isStillLoading && (
              <Flex
                justify="center"
                align="center"
                py={4}
                gap={2}
                color="gray.500"
              >
                <Spinner size="sm" />
                <Text fontSize="sm">Loading more content...</Text>
              </Flex>
            )}
          </TabPanel>

          <TabPanel px={0}>
            <MediaGrid
              media={gameplay}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
            {isStillLoading && (
              <Flex
                justify="center"
                align="center"
                py={4}
                gap={2}
                color="gray.500"
              >
                <Spinner size="sm" />
                <Text fontSize="sm">Loading more gameplay...</Text>
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          allMedia={currentTabMedia}
          isOpen={!!selectedMedia}
          onClose={handleCloseViewer}
          onMediaChange={setSelectedMedia}
          initialEditMode={openInEditMode}
          isStillLoading={isStillLoading}
        />
      )}
    </Box>
  );
};

export default GameGallery;