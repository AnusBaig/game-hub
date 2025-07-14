import { 
  Box, 
  AspectRatio, 
  IconButton, 
  HStack, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Spinner,
  Center
} from "@chakra-ui/react";
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaExpand, 
  FaCog,
  FaDownload,
  FaRedo
} from "react-icons/fa";
import { useRef, useState, useEffect, useCallback } from "react";
import { MediaItem } from "../../../models/mediaItem";

interface Props {
  media: MediaItem;
  autoplay?: boolean;
  showControls?: boolean;
  onDownload?: () => void;
}

const VideoPlayer = ({ media, autoplay = false, showControls = true, onDownload }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [quality, setQuality] = useState('480p');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [iframeTimeoutId, setIframeTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const controlsBg = useColorModeValue("rgba(255,255,255,0.9)", "rgba(0,0,0,0.9)");
  const controlsColor = useColorModeValue("gray.800", "white");

  // Get proxy URL for CORS-safe video loading
  const getProxyUrl = useCallback((originalUrl: string): string => {
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3501' 
      : window.location.origin;
    
    return `${baseUrl}/api/proxy-media?url=${encodeURIComponent(originalUrl)}`;
  }, []);

  // Check if URL is a YouTube video and handle accordingly
  const processVideoUrl = useCallback((url: string): string => {
    console.log('VideoPlayer: Processing video URL:', url);
    
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      console.log('VideoPlayer: YouTube URL detected');
      // For YouTube videos, we'll return the original URL and handle it differently
      // YouTube videos need to be embedded, not played directly
      return url;
    }
    
    // Validate that it looks like a video URL
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    if (!hasVideoExtension && !url.includes('rawg.io')) {
      console.warn('VideoPlayer: URL does not appear to be a video:', url);
    }
    
    // For other video URLs, use proxy to avoid CORS issues
    const proxyUrl = getProxyUrl(url);
    console.log('VideoPlayer: Using proxy URL:', proxyUrl);
    return proxyUrl;
  }, [getProxyUrl]);

  // Check if this is a YouTube video
  const isYouTubeVideo = useCallback((url: string): boolean => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    return youtubeRegex.test(url);
  }, []);

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = useCallback((url: string): string => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1];
      const embedParams = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        controls: '1',
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1',
        origin: window.location.origin,
        iv_load_policy: '3', // Hide video annotations
        fs: '1', // Enable fullscreen
        cc_load_policy: '0', // Hide closed captions by default
        disablekb: '0' // Enable keyboard controls
      });
      
      return `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`;
    }
    
    return url;
  }, [autoplay]);

  // Initialize video URL when component mounts or media changes
  useEffect(() => {
    console.log('VideoPlayer: Initializing for URL:', media.url);
    setHasError(false);
    setErrorMessage('');
    
    try {
      const processedUrl = processVideoUrl(media.url);
      setVideoUrl(processedUrl);
      
      // For YouTube videos, don't set loading state since iframe doesn't need it
      if (isYouTubeVideo(media.url)) {
        console.log('VideoPlayer: YouTube video detected, skipping loading state');
        setIsLoading(false);
        
        // Clear any existing timeout
        if (iframeTimeoutId) {
          clearTimeout(iframeTimeoutId);
        }
        
        // Set a fallback timeout in case iframe doesn't load
        const timeoutId = setTimeout(() => {
          console.log('VideoPlayer: YouTube iframe timeout, assuming loaded');
          setIsLoading(false);
          setHasError(false);
        }, 3000);
        
        setIframeTimeoutId(timeoutId);
      } else {
        console.log('VideoPlayer: Regular video detected, setting loading state');
        setIsLoading(true);
      }
    } catch (error) {
      console.error('VideoPlayer: Failed to process video URL:', error);
      setHasError(true);
      setErrorMessage('Failed to process video URL');
      setIsLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (iframeTimeoutId) {
        clearTimeout(iframeTimeoutId);
      }
    };
  }, [media.url]); // Simplified dependencies to prevent loops

  // Force video to load when videoUrl changes (for non-YouTube videos)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTubeVideo(media.url) || !videoUrl) return;
    
    console.log('VideoPlayer: Setting video src and loading:', videoUrl);
    video.src = videoUrl;
    video.load(); // Force the browser to start loading the video
  }, [videoUrl]); // Only depend on videoUrl to prevent loops

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => {
      console.log('VideoPlayer: Video load started');
      setIsLoading(true);
    };
    const handleCanPlay = () => {
      console.log('VideoPlayer: Video can play');
      setIsLoading(false);
    };
    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      const error = videoElement?.error;
      
      console.error('Video error:', {
        event: e,
        error: error,
        code: error?.code,
        message: error?.message,
        url: videoUrl,
        networkState: videoElement?.networkState,
        readyState: videoElement?.readyState
      });
      
      let errorMsg = 'Failed to load video';
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMsg = 'Video loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMsg = 'Network error while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMsg = 'Video format not supported';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMsg = 'Video source not supported';
            break;
          default:
            errorMsg = 'Unknown video error';
        }
      }
      
      setHasError(true);
      setErrorMessage(errorMsg);
      setIsLoading(false);
    };
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    if (autoplay && !hasError) {
      // Set muted first to allow autoplay
      video.muted = true;
      video.play().catch((error) => {
        console.error('Autoplay failed:', error);
        // Try playing without mute after user interaction
        const playAfterInteraction = () => {
          video.muted = false;
          video.play().catch(console.error);
          document.removeEventListener('click', playAfterInteraction);
        };
        document.addEventListener('click', playAfterInteraction, { once: true });
      });
    }

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [autoplay, hasError, videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error('Play failed:', error);
        setHasError(true);
        setErrorMessage('Failed to play video. Try refreshing or use browser controls.');
      });
    }
  };

  const retryVideo = () => {
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    
    if (isYouTubeVideo(media.url)) {
      // For YouTube videos, force iframe reload by updating URL
      const processedUrl = processVideoUrl(media.url);
      setVideoUrl(processedUrl + '&t=' + Date.now()); // Add timestamp to force reload
    } else {
      // For regular videos, reload the video element
      const video = videoRef.current;
      if (video) {
        video.load();
      }
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    setVolume(value);
    video.volume = value;
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const qualityOptions = [
    { label: '480p', value: '480p' },
    { label: '720p', value: '720p' },
    { label: '1080p', value: '1080p' },
  ];

  // Render YouTube iframe for YouTube videos
  if (isYouTubeVideo(media.url)) {
    console.log('VideoPlayer: Rendering YouTube iframe. States:', { isLoading, hasError, errorMessage });
    const embedUrl = getYouTubeEmbedUrl(media.url);
    console.log('VideoPlayer: YouTube embed URL:', embedUrl);
    
    return (
      <Box position="relative">
        <AspectRatio ratio={16/9}>
          {hasError ? (
            <Box 
              bg="gray.100" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              flexDirection="column"
              p={4}
            >
              <Alert status="error" flexDirection="column" textAlign="center">
                <AlertIcon />
                <AlertTitle>YouTube Video Error</AlertTitle>
                <AlertDescription mb={4}>
                  Unable to load YouTube video. The video may be restricted or unavailable.
                </AlertDescription>
                <Button
                  leftIcon={<FaRedo />}
                  colorScheme="teal"
                  size="sm"
                  onClick={retryVideo}
                >
                  Retry
                </Button>
              </Alert>
            </Box>
          ) : (
            <iframe
              src={embedUrl}
              title={media.title || 'YouTube Video'}
              style={{ 
                width: '100%', 
                height: '100%',
                border: 'none',
                backgroundColor: '#000'
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </AspectRatio>
      </Box>
    );
  }

  return (
    <Box 
      position="relative"
      onMouseEnter={() => setShowControlsOverlay(true)}
      onMouseLeave={() => setShowControlsOverlay(false)}
    >
      <AspectRatio ratio={16/9}>
        {hasError ? (
          <Box 
            bg="gray.100" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            flexDirection="column"
            p={4}
          >
            <Alert status="error" flexDirection="column" textAlign="center">
              <AlertIcon />
              <AlertTitle>Video Error</AlertTitle>
              <AlertDescription mb={4}>
                {errorMessage || 'Unable to load video'}
              </AlertDescription>
              <Button
                leftIcon={<FaRedo />}
                colorScheme="teal"
                size="sm"
                onClick={retryVideo}
              >
                Retry
              </Button>
            </Alert>
          </Box>
        ) : isLoading ? (
          <Center bg="gray.100">
            <VStack spacing={3}>
              <Spinner size="lg" color="teal.500" />
              <Text color="gray.600" fontSize="sm">Loading video...</Text>
            </VStack>
          </Center>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={media.thumbnail}
            style={{ width: '100%', height: '100%' }}
            onClick={togglePlay}
            controls={!showControls} // Show browser controls if custom controls are disabled
            crossOrigin="anonymous"
            preload="metadata"
            playsInline
            muted={autoplay} // Mute autoplay videos to comply with browser policies
            onLoadStart={() => console.log('VideoPlayer: Video element load started for:', videoUrl)}
            onCanPlay={() => console.log('VideoPlayer: Video element can play:', videoUrl)}
            onError={(e) => console.error('VideoPlayer: Video element error for:', videoUrl, e)}
          />
        )}
      </AspectRatio>

      {/* Controls Overlay - only show for regular videos (not YouTube, not error, not loading) */}
      {showControls && showControlsOverlay && !hasError && !isLoading && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg={controlsBg}
          color={controlsColor}
          p={3}
          transition="opacity 0.3s"
        >
          <VStack spacing={2}>
            {/* Progress Bar */}
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              colorScheme="teal"
              size="sm"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>

            {/* Control Buttons */}
            <HStack justify="space-between" w="full">
              <HStack spacing={2}>
                <IconButton
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  icon={isPlaying ? <FaPause /> : <FaPlay />}
                  size="sm"
                  onClick={togglePlay}
                  colorScheme="teal"
                  variant="ghost"
                />

                <IconButton
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  size="sm"
                  onClick={toggleMute}
                  colorScheme="teal"
                  variant="ghost"
                />

                <Box w="20">
                  <Slider
                    value={isMuted ? 0 : volume}
                    max={1}
                    step={0.1}
                    onChange={handleVolumeChange}
                    colorScheme="teal"
                    size="sm"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>

                <Text fontSize="sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </HStack>

              <HStack spacing={2}>
                {/* Quality Menu */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Quality settings"
                    icon={<FaCog />}
                    size="sm"
                    colorScheme="teal"
                    variant="ghost"
                  />
                  <MenuList>
                    {qualityOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => setQuality(option.value)}
                        bg={quality === option.value ? "teal.100" : undefined}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {onDownload && (
                  <IconButton
                    aria-label="Download video"
                    icon={<FaDownload />}
                    size="sm"
                    onClick={onDownload}
                    colorScheme="teal"
                    variant="ghost"
                  />
                )}

                <IconButton
                  aria-label="Fullscreen"
                  icon={<FaExpand />}
                  size="sm"
                  onClick={toggleFullscreen}
                  colorScheme="teal"
                  variant="ghost"
                />
              </HStack>
            </HStack>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;