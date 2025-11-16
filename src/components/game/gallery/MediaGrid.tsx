import { 
  SimpleGrid, 
  Box, 
  Image, 
  AspectRatio, 
  IconButton, 
  useColorModeValue,
  Text,
  HStack,
  VStack,
  useToast
} from "@chakra-ui/react";
import { FaPlay, FaDownload, FaEdit, FaExternalLinkAlt } from "react-icons/fa";
import { MediaItem } from "../../../models/mediaItem";
import ContentScoreTag from "./ContentScoreTag";
import mediaStorageService from "../../../services/mediaStorageService";
import { useState } from "react";

interface Props {
  media: MediaItem[];
  onMediaSelect: (media: MediaItem) => void;
  onEditMedia?: (media: MediaItem) => void;
}

const MediaGrid = ({ media, onMediaSelect, onEditMedia }: Props) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.800");
  const toast = useToast();

  const handleDownload = async (item: MediaItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setDownloadingId(item.id);
    
    try {
      await mediaStorageService.downloadMedia(item);
      toast({
        title: "Download started",
        description: `${item.title || 'Media'} is downloading`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download media file",
        status: "error",
        duration: 3000,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenYouTube = (item: MediaItem, event: React.MouseEvent) => {
    event.stopPropagation();
    mediaStorageService.openYouTubeVideo(item.url);
    toast({
      title: "Opening in YouTube",
      description: "Video will open in a new tab",
      status: "info",
      duration: 2000,
    });
  };

  if (!media.length) {
    return (
      <Box 
        p={8} 
        textAlign="center" 
        borderWidth="2px" 
        borderStyle="dashed" 
        borderColor={borderColor}
        borderRadius="lg"
      >
        <Text color="gray.500">No media available</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid
      columns={{
        base: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        "2xl": 3
      }}
      spacing={6}
      mt={4}
    >
      {media.map((item) => (
        <Box
          key={item.id}
          position="relative"
          borderRadius="lg"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: "teal.500",
            bg: hoverBg,
            transform: "translateY(-2px)",
            shadow: "lg"
          }}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onMediaSelect(item)}
        >
          <AspectRatio ratio={16/9}>
            <Image
              src={item.thumbnail || item.url}
              alt={item.title || 'Media item'}
              objectFit="cover"
              loading="lazy"
              fallback={
                <Box 
                  bg="gray.200" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Text color="gray.500">Loading...</Text>
                </Box>
              }
            />
          </AspectRatio>

          {/* Content Score Tag */}
          {item.contentScore && (
            <ContentScoreTag 
              score={item.contentScore} 
              position="top-right"
            />
          )}

          {/* Video Play Button */}
          {item.type === 'video' && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              pointerEvents="none"
            >
              <IconButton
                aria-label="Play video"
                icon={<FaPlay />}
                size="lg"
                colorScheme="teal"
                rounded="full"
                bg="rgba(0,0,0,0.7)"
                color="white"
                _hover={{ bg: "rgba(0,0,0,0.9)" }}
              />
            </Box>
          )}

          {/* Hover Controls */}
          {hoveredId === item.id && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
              p={3}
            >
              <VStack spacing={2} align="stretch">
                {item.title && (
                  <Text 
                    color="white" 
                    fontSize="sm" 
                    fontWeight="medium"
                    noOfLines={1}
                  >
                    {item.title}
                  </Text>
                )}
                
                <HStack justify="space-between">
                  <Text color="gray.300" fontSize="xs">
                    {item.source.toUpperCase()}
                  </Text>
                  
                  <HStack spacing={1}>
                    {mediaStorageService.isYouTubeVideo(item.url) ? (
                      <IconButton
                        aria-label="Open in YouTube"
                        icon={<FaExternalLinkAlt />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        color="white"
                        onClick={(e) => handleOpenYouTube(item, e)}
                        title="Open in YouTube"
                      />
                    ) : (
                      <IconButton
                        aria-label="Download"
                        icon={<FaDownload />}
                        size="xs"
                        colorScheme="teal"
                        variant="ghost"
                        color="white"
                        isLoading={downloadingId === item.id}
                        onClick={(e) => handleDownload(item, e)}
                      />
                    )}
                    
                    {item.type === 'image' && onEditMedia && (
                      <IconButton
                        aria-label="Edit"
                        icon={<FaEdit />}
                        size="xs"
                        colorScheme="teal"
                        variant="ghost"
                        color="white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMedia(item);
                        }}
                      />
                    )}
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          )}
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default MediaGrid;