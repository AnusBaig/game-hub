import { AspectRatio, Hide, Flex, Spinner, Text } from "@chakra-ui/react";
import useGameTrailer from "../../../hooks/useGameTrailer";
import useProgressiveGameMedia from "../../../hooks/useProgressiveGameMedia";
import useGameDetail from "../../../hooks/useGameDetail";
import SectionHeading from "../../utils/SectionHeading";
import TrailerCarousel from "./TrailerCarousel";
import TrailerHeading from "./TrailerHeading";
import VideoPlayer from "../gallery/VideoPlayer";

interface Props {
  gameId: number;
}

const GameTrailer = ({ gameId }: Props) => {
  const { data: gameDetail } = useGameDetail(gameId.toString());
  const gameDetails = gameDetail ? {
    name: gameDetail.name,
    name_original: gameDetail.name_original,
    released: gameDetail.released
  } : undefined;

  // Try multi-source media first
  const { data: mediaCollection, isLoading: isMediaLoading, isStillLoading } = useProgressiveGameMedia(gameId, gameDetails);
  // Fallback to RAWG-only trailers
  const { data: rawgTrailer, isLoading: isRawgLoading } = useGameTrailer(gameId);

  const isLoading = isMediaLoading || isRawgLoading;

  // Prefer videos from multi-source, fallback to RAWG trailer
  const videos = mediaCollection?.videos || [];
  const selectedVideo = videos.length > 0 ? videos[0] : null;
  
  // Convert RAWG trailer to MediaItem format if no multi-source videos
  const fallbackVideo = rawgTrailer ? {
    id: `rawg-video-${rawgTrailer.id}`,
    type: 'video' as const,
    url: rawgTrailer.data[480] || rawgTrailer.data[360] || rawgTrailer.data?.max || '',
    thumbnail: rawgTrailer.preview,
    title: rawgTrailer.name,
    source: 'rawg' as const,
    gameId,
    metadata: {
      duration: 0,
      format: 'mp4',
      originalUrl: rawgTrailer.data[480] || rawgTrailer.data[360] || rawgTrailer.data?.max || ''
    }
  } : null;

  const videoToShow = selectedVideo || fallbackVideo;

  // Show loading only if no video is available yet and we're still loading the first source
  if ((isLoading && !videoToShow) || !videoToShow) return null;

  return (
    <>
      <Hide above='lg'>
        <SectionHeading headingText='Game Trailer' />
      </Hide>

      <VideoPlayer 
        media={videoToShow}
        autoplay={false}
        showControls={true}
      />
      
      {isStillLoading && (
        <Flex 
          justify="center" 
          align="center" 
          py={3} 
          gap={2}
          color="gray.500"
        >
          <Spinner size="sm" />
          <Text fontSize="sm">Loading more videos...</Text>
        </Flex>
      )}
      
      <Hide below='md'>
        <TrailerHeading headingText={videoToShow.title} />
      </Hide>
      <Hide below='md'>
        <TrailerCarousel gameId={gameId} />
      </Hide>
    </>
  );
};

export default GameTrailer;
