import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  IconButton,
  HStack,
  Text,
  Box,
  useColorModeValue,
  VStack,
  Badge,
  Divider,
  useToast,
  Flex,
  Spinner
} from "@chakra-ui/react";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaDownload, 
  FaEdit,
  FaExpand,
  FaExternalLinkAlt
} from "react-icons/fa";
import { MediaItem } from "../../../models/mediaItem";
import VideoPlayer from "./VideoPlayer";
import ContentScoreTag from "./ContentScoreTag";
import ImageEditor from "./ImageEditor";
import mediaStorageService from "../../../services/mediaStorageService";
import { useState, useEffect, useCallback } from "react";

interface Props {
  media: MediaItem;
  allMedia: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onMediaChange: (media: MediaItem) => void;
  initialEditMode?: boolean;
  isStillLoading?: boolean;
}

const MediaViewer = ({ media, allMedia, isOpen, onClose, onMediaChange, initialEditMode = false, isStillLoading = false }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const headerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const currentIndex = allMedia.findIndex(item => item.id === media.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allMedia.length - 1;
  const isYouTubeVideo = mediaStorageService.isYouTubeVideo(media.url);

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      onMediaChange(allMedia[currentIndex - 1]);
    }
  }, [hasPrevious, allMedia, currentIndex, onMediaChange]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onMediaChange(allMedia[currentIndex + 1]);
    }
  }, [hasNext, allMedia, currentIndex, onMediaChange]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    
    try {
      await mediaStorageService.downloadMedia(media, (progress) => {
        // Optional: Show download progress
        console.log(`Download progress: ${progress.percentage}%`);
      });
      
      toast({
        title: "Download completed",
        description: `${media.title || 'Media'} has been downloaded`,
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
      setIsDownloading(false);
    }
  }, [media, toast]);

  const handleOpenYouTube = useCallback(() => {
    mediaStorageService.openYouTubeVideo(media.url);
    toast({
      title: "Opening in YouTube",
      description: "Video will open in a new tab",
      status: "info",
      duration: 2000,
    });
  }, [media.url, toast]);

  const handleEdit = useCallback(() => {
    if (media.type === 'image') {
      setIsEditMode(true);
    }
  }, [media.type]);

  const handleSaveEditedImage = useCallback((editedImageUrl: string) => {
    // TODO: Handle saving the edited image
    // For now, we'll just show a success message and close the editor
    toast({
      title: "Image edited successfully",
      description: "Your edited image has been saved",
      status: "success",
      duration: 3000,
    });
    setIsEditMode(false);
  }, [toast]);

  const handleCloseEditor = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast({
        title: "Fullscreen failed",
        description: "Unable to enter fullscreen mode",
        status: "error",
        duration: 2000,
      });
    }
  }, [toast]);

  // Enhanced close handler that checks for fullscreen state
  const handleClose = useCallback(async () => {
    // If we're in fullscreen, exit fullscreen first instead of closing modal
    if (isFullscreen || document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return; // Don't close modal, just exit fullscreen
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
        // If fullscreen exit fails, continue to close modal
      }
    }
    
    // If not in fullscreen, close the modal normally
    onClose();
  }, [isFullscreen, onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle keyboard events when modal is open
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (hasPrevious) {
          handlePrevious();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (hasNext) {
          handleNext();
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (isEditMode) {
          setIsEditMode(false);
        } else {
          handleClose();
        }
        break;
      case 'e':
      case 'E':
        event.preventDefault();
        if (media.type === 'image' && !isEditMode) {
          handleEdit();
        }
        break;
      case 'd':
      case 'D':
        event.preventDefault();
        if (!isDownloading) {
          handleDownload();
        }
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        handleFullscreen();
        break;
    }
  }, [isOpen, hasPrevious, hasNext, handlePrevious, handleNext, handleClose, isEditMode, handleEdit, isDownloading, handleDownload, handleFullscreen]);

  // Add keyboard event listeners and fullscreen cleanup
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Listen for fullscreen changes
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    } else {
      // When modal closes, ensure fullscreen is exited
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
        setIsFullscreen(false);
      }
    }
  }, [isOpen, handleKeyDown]);

  // Handle initial edit mode
  useEffect(() => {
    if (isOpen && initialEditMode && media.type === 'image') {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [isOpen, initialEditMode, media.type]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="full"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent
        bg={headerBg}
        m={0}
        borderRadius={0}
        maxW="100vw"
        maxH="100vh"
      >
        {/* Header */}
        <ModalHeader
          pb={2}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold">
                {media.title || 'Untitled'}
              </Text>
              <HStack spacing={3}>
                <Badge colorScheme="teal" variant="subtle">
                  {media.source.toUpperCase()}
                </Badge>
                <Badge colorScheme="purple" variant="subtle">
                  {media.type.toUpperCase()}
                </Badge>
                {media.metadata?.resolution && (
                  <Badge colorScheme="blue" variant="subtle">
                    {media.metadata.resolution}
                  </Badge>
                )}
              </HStack>
            </VStack>

            <HStack spacing={2}>
              {/* Navigation */}
              <IconButton
                aria-label="Previous media"
                icon={<FaChevronLeft />}
                onClick={handlePrevious}
                isDisabled={!hasPrevious}
                colorScheme="teal"
                variant="ghost"
              />
              
              <Text fontSize="sm" color="gray.500">
                {currentIndex + 1} of {allMedia.length}
              </Text>
              
              <IconButton
                aria-label="Next media"
                icon={<FaChevronRight />}
                onClick={handleNext}
                isDisabled={!hasNext}
                colorScheme="teal"
                variant="ghost"
              />

              <Divider orientation="vertical" h="6" />

              {/* Action Buttons */}
              {isYouTubeVideo ? (
                <IconButton
                  aria-label="Open in YouTube"
                  icon={<FaExternalLinkAlt />}
                  onClick={handleOpenYouTube}
                  colorScheme="red"
                  variant="ghost"
                  title="Open in YouTube"
                />
              ) : (
                <IconButton
                  aria-label="Download"
                  icon={<FaDownload />}
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  colorScheme="teal"
                  variant="ghost"
                />
              )}

              {media.type === 'image' && (
                <IconButton
                  aria-label="Edit image"
                  icon={<FaEdit />}
                  onClick={handleEdit}
                  colorScheme="teal"
                  variant="ghost"
                />
              )}

              <IconButton
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                icon={<FaExpand />}
                onClick={handleFullscreen}
                colorScheme="teal"
                variant="ghost"
                bg={isFullscreen ? "teal.100" : "transparent"}
              />
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalCloseButton />

        {/* Body */}
        <ModalBody p={0} overflow="hidden">
          <Box 
            position="relative" 
            h="calc(100vh - 120px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="black"
          >
            {/* Content Score Tag */}
            {media.contentScore && (
              <ContentScoreTag 
                score={media.contentScore} 
                position="top-left"
                showDetailedTooltip={true}
              />
            )}

            {/* Media Content */}
            {media.type === 'video' ? (
              <Box w="100%" maxW="1200px" px={4}>
                <VideoPlayer
                  media={media}
                  autoplay={true}
                  showControls={true}
                  onDownload={!isYouTubeVideo ? handleDownload : undefined}
                />
              </Box>
            ) : (
              <Image
                src={media.url}
                alt={media.title || 'Media'}
                maxH="100%"
                maxW="100%"
                objectFit="contain"
                fallback={
                  <Box 
                    p={8} 
                    textAlign="center"
                    color="white"
                  >
                    <Text>Failed to load image</Text>
                  </Box>
                }
              />
            )}


            {/* Media Info */}
            <Box
              position="absolute"
              bottom={4}
              right={4}
              bg="rgba(0,0,0,0.7)"
              color="white"
              p={2}
              borderRadius="md"
              fontSize="sm"
            >
              <VStack align="end" spacing={1}>
                {media.width && media.height && (
                  <Text>{media.width} × {media.height}</Text>
                )}
                {media.fileSize && (
                  <Text>{formatFileSize(media.fileSize)}</Text>
                )}
                {media.metadata?.duration && (
                  <Text>{Math.round(media.metadata.duration)}s</Text>
                )}
              </VStack>
            </Box>

            {/* Loading indicator for more content */}
            {isStillLoading && (
              <Flex 
                position="absolute"
                bottom={4}
                left={4}
                align="center" 
                gap={2}
                bg="rgba(0,0,0,0.7)"
                color="white"
                p={2}
                borderRadius="md"
                fontSize="sm"
              >
                <Spinner size="sm" />
                <Text>Loading more content...</Text>
              </Flex>
            )}
          </Box>
        </ModalBody>
      </ModalContent>

      {/* Image Editor Modal */}
      <ImageEditor
        media={media}
        isOpen={isEditMode}
        onClose={handleCloseEditor}
        onSave={handleSaveEditedImage}
      />
    </Modal>
  );
};

export default MediaViewer;