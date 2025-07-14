import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useState } from "react";
import { MediaCollection, MediaItem } from "../../../models/mediaItem";
import useGameMedia from "../../../hooks/useGameMedia";
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
  
  const { data: mediaCollection, isLoading, error } = useGameMedia(gameId, gameDetails);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openInEditMode, setOpenInEditMode] = useState(false);

  if (isLoading) return <Loader />;
  if (error || !mediaCollection) return null;

  const { screenshots, videos, artwork } = mediaCollection;

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
      default: return screenshots;
    }
  };

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
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <MediaGrid 
              media={screenshots}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
          </TabPanel>
          
          <TabPanel px={0}>
            <MediaGrid 
              media={videos}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
          </TabPanel>
          
          <TabPanel px={0}>
            <MediaGrid 
              media={artwork}
              onMediaSelect={handleMediaSelect}
              onEditMedia={handleEditMedia}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          allMedia={getMediaForTab(selectedTab)}
          isOpen={!!selectedMedia}
          onClose={handleCloseViewer}
          onMediaChange={setSelectedMedia}
          initialEditMode={openInEditMode}
        />
      )}
    </Box>
  );
};

export default GameGallery;