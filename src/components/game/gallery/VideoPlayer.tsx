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
  Center,
} from "@chakra-ui/react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCog,
  FaDownload,
  FaRedo,
  FaBullseye,
} from "react-icons/fa";
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MediaItem } from "../../../models/mediaItem";
import Hls from "hls.js";
import multiMediaService from "../../../services/multiMediaService";

interface Props {
  media: MediaItem;
  autoplay?: boolean;
  showControls?: boolean;
  onDownload?: () => void;
}

const VideoPlayer = ({
  media,
  autoplay = false,
  showControls = true,
  onDownload,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [quality, setQuality] = useState("480p");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false); // New: track URL fetching
  const [loadingStage, setLoadingStage] = useState<string>(""); // New: detailed loading stages
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Debug: Track component mounting/unmounting
  useEffect(() => {
    console.log("🔴 VideoPlayer: Component mounted/remounted for media:", media.url);
    return () => {
      console.log("🔴 VideoPlayer: Component unmounting for media:", media.url);
    };
  }, []); // Empty dependency - only fires on mount/unmount

  // Debug: Track videoUrl changes
  useEffect(() => {
    console.log("VideoPlayer: videoUrl state changed from previous to:", videoUrl);
  }, [videoUrl]);
  const [iframeTimeoutId, setIframeTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );

  const controlsBg = useColorModeValue(
    "rgba(255,255,255,0.9)",
    "rgba(0,0,0,0.9)"
  );
  const controlsColor = useColorModeValue("gray.800", "white");
  const menuBg = useColorModeValue("white", "gray.700");
  const menuItemHoverBg = useColorModeValue("gray.100", "gray.600");
  const menuItemSelectedBg = useColorModeValue("teal.500", "teal.600");
  const menuItemSelectedColor = useColorModeValue("white", "white");

  // Get proxy URL for CORS-safe video loading
  const getProxyUrl = useCallback((originalUrl: string): string => {
    const baseUrl = import.meta.env.DEV
      ? "http://localhost:3501"
      : window.location.origin;

    return `${baseUrl}/api/proxy-media?url=${encodeURIComponent(originalUrl)}`;
  }, []);

  // Check if URL is a YouTube video and handle accordingly
  const processVideoUrl = useCallback(
    (url: string): string => {
      console.log("VideoPlayer: Processing video URL:", url);

      // Check if it's a YouTube URL
      const youtubeRegex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = url.match(youtubeRegex);

      if (match) {
        console.log("VideoPlayer: YouTube URL detected");
        // For YouTube videos, we'll return the original URL and handle it differently
        // YouTube videos need to be embedded, not played directly
        return url;
      }

      // Validate that it looks like a video URL
      const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
      const hasVideoExtension = videoExtensions.some((ext) =>
        url.toLowerCase().includes(ext)
      );

      if (!hasVideoExtension && !url.includes("rawg.io")) {
        console.warn("VideoPlayer: URL does not appear to be a video:", url);
      }

      // For other video URLs, use proxy to avoid CORS issues
      const proxyUrl = getProxyUrl(url);
      console.log("VideoPlayer: Using proxy URL:", proxyUrl);
      return proxyUrl;
    },
    [getProxyUrl]
  );

  // Check if this is a YouTube video
  const isYouTubeVideo = useCallback((url: string): boolean => {
    const youtubeRegex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    return youtubeRegex.test(url);
  }, []);

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = useCallback(
    (url: string): string => {
      const youtubeRegex =
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = url.match(youtubeRegex);

      if (match) {
        const videoId = match[1];
        const embedParams = new URLSearchParams({
          autoplay: autoplay ? "1" : "0",
          controls: "1",
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          enablejsapi: "1",
          origin: window.location.origin,
          iv_load_policy: "3", // Hide video annotations
          fs: "1", // Enable fullscreen
          cc_load_policy: "0", // Hide closed captions by default
          disablekb: "0", // Enable keyboard controls
        });

        return `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`;
      }

      return url;
    },
    [autoplay]
  );

  // Stable video URL processing with useMemo - inline logic to avoid function dependencies
  const processedVideoUrl = useMemo(() => {
    console.log(`VideoPlayer: Processing URL:`, media.url);

    if (!media.url) return "";

    try {
      // Check if it's a YouTube URL (inline logic)
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = media.url.match(youtubeRegex);

      if (match) {
        console.log("VideoPlayer: YouTube URL detected");
        return media.url; // Return original URL for YouTube
      }

      // For other video URLs, use proxy to avoid CORS issues (inline logic)
      const baseUrl = import.meta.env.DEV
        ? "http://localhost:3501"
        : window.location.origin;

      const proxyUrl = `${baseUrl}/api/proxy-media?url=${encodeURIComponent(media.url)}`;
      console.log("VideoPlayer: Using proxy URL:", proxyUrl);
      return proxyUrl;
    } catch (error) {
      console.error("VideoPlayer: Failed to process video URL:", error);
      return "";
    }
  }, [media.url]); // Only depend on media.url - no function dependencies!

  // Fetch actual playable URL for adult videos
  useEffect(() => {
    const fetchAdultVideoUrl = async () => {
      const format = media.metadata?.format as string;
      const adultFormats = ['pornhub', 'xvideos', 'redtube', 'xhamster'];

      // Only process adult videos that need URL extraction
      if (!adultFormats.includes(format)) {
        setIsFetchingUrl(false);
        return; // Not an adult video, use processedVideoUrl as-is
      }

      // Check if the URL is already a video file
      const videoExtensions = ['.mp4', '.webm', '.m3u8'];
      const isVideoUrl = videoExtensions.some(ext => media.url?.toLowerCase().includes(ext));

      if (isVideoUrl) {
        console.log(`VideoPlayer: Adult video URL is already a video file: ${media.url}`);
        setIsFetchingUrl(false);
        return; // Already a video file, use processedVideoUrl as-is
      }

      // Need to fetch the actual playable URL
      console.log(`VideoPlayer: Fetching playable URL for ${format} video...`);
      setIsFetchingUrl(true);
      setLoadingStage(`Fetching ${format} video URL...`);
      setIsLoading(true);
      setHasError(false);

      // Add timeout for URL fetching (30 seconds)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('URL fetch timeout')), 30000)
      );

      try {
        const playableUrl = await Promise.race([
          multiMediaService.getPlayableVideoUrl(media),
          timeout
        ]) as string;

        if (playableUrl && playableUrl !== media.url) {
          console.log(`VideoPlayer: Got playable URL for ${format} video`);
          setLoadingStage('Loading video...');

          // Use proxy for the playable URL
          const baseUrl = import.meta.env.DEV
            ? "http://localhost:3501"
            : window.location.origin;

          // Check if it needs proxying (not a direct CDN URL)
          const needsProxy = !playableUrl.includes('.phncdn.com') &&
                           !playableUrl.includes('.xhcdn.com') &&
                           !playableUrl.includes('.xvideos-cdn.com') &&
                           !playableUrl.includes('.m3u8'); // HLS streams don't need proxy

          const finalUrl = needsProxy
            ? `${baseUrl}/api/proxy-media?url=${encodeURIComponent(playableUrl)}`
            : playableUrl;

          console.log(`VideoPlayer: Setting video URL to: ${finalUrl}`);
          setVideoUrl(finalUrl);
          setHasError(false);
          setIsFetchingUrl(false);
          // Keep isLoading true - let video element's onLoadStart/onLoadedMetadata handle it
        } else {
          console.warn(`VideoPlayer: Could not get playable URL for ${format} video`);
          setHasError(true);
          setErrorMessage(`Could not load ${format} video. The video may be unavailable.`);
          setIsLoading(false);
          setIsFetchingUrl(false);
          setLoadingStage('');
        }
      } catch (error) {
        console.error(`VideoPlayer: Error fetching ${format} video URL:`, error);
        const isTimeout = error instanceof Error && error.message === 'URL fetch timeout';
        setHasError(true);
        setErrorMessage(isTimeout
          ? `Timeout loading ${format} video. Please try again.`
          : `Error loading ${format} video`
        );
        setIsLoading(false);
        setIsFetchingUrl(false);
        setLoadingStage('');
      }
    };

    fetchAdultVideoUrl();
  }, [media.url, media.metadata?.format]);

  // Single consolidated effect to handle all URL and state changes (for non-adult videos)
  useEffect(() => {
    const format = media.metadata?.format as string;
    const adultFormats = ['pornhub', 'xvideos', 'redtube', 'xhamster'];

    // Skip if this is an adult video (handled by fetchAdultVideoUrl effect)
    if (adultFormats.includes(format)) {
      return;
    }

    console.log("VideoPlayer: URL processing effect - processedVideoUrl:", processedVideoUrl);

    // Set the videoUrl state only if not fetching adult video URL
    if (!isFetchingUrl) {
      setVideoUrl(processedVideoUrl);
    }

    // Reset states when we have a valid URL
    if (processedVideoUrl && processedVideoUrl.length > 0) {
      console.log("VideoPlayer: Resetting states for new video");
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setHasError(false);
      setLoadingStage('');

      // Handle loading state based on video type
      if (processedVideoUrl.includes('youtube.com') || processedVideoUrl.includes('youtu.be')) {
        console.log("VideoPlayer: YouTube video - no loading state needed");
        setIsLoading(false);
        setIsFetchingUrl(false);
      } else {
        console.log("VideoPlayer: Regular video - video element will handle loading state");
        // Don't set isLoading here - let the video element's onLoadStart handle it
        setIsFetchingUrl(false);
      }
    } else {
      // Clear states if no valid URL
      setHasError(false);
      setErrorMessage("");
      setLoadingStage('');
    }
  }, [processedVideoUrl, media.metadata?.format, isFetchingUrl]); // Only depend on the memoized URL

  // HLS initialization effect
  useEffect(() => {
    const video = videoRef.current;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      console.log("VideoPlayer: Destroying previous HLS instance");
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!video || !videoUrl || isYouTubeVideo(videoUrl)) {
      return;
    }

    // Check if this is an HLS stream (.m3u8)
    const isHls = videoUrl.toLowerCase().includes('.m3u8');

    if (isHls) {
      console.log("VideoPlayer: HLS stream detected, initializing HLS.js");

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("VideoPlayer: HLS manifest parsed successfully");
          setIsLoading(false);
          setHasError(false);

          if (autoplay) {
            video.muted = true;
            video.play().catch((error) => {
              console.error("HLS autoplay failed:", error);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("VideoPlayer: HLS error:", data);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Fatal network error encountered, trying to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Fatal media error encountered, trying to recover");
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal error, cannot recover");
                setHasError(true);
                setErrorMessage(`HLS Error: ${data.type} - ${data.details}`);
                setIsLoading(false);
                hls.destroy();
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log("VideoPlayer: Using native HLS support (Safari)");
        video.src = videoUrl;
        setIsLoading(false);

        if (autoplay) {
          video.muted = true;
          video.play().catch((error) => {
            console.error("Native HLS autoplay failed:", error);
          });
        }
      } else {
        console.error("VideoPlayer: HLS not supported in this browser");
        setHasError(true);
        setErrorMessage("HLS streaming is not supported in this browser");
        setIsLoading(false);
      }
    }

    // Cleanup on unmount or URL change
    return () => {
      if (hlsRef.current) {
        console.log("VideoPlayer: Cleaning up HLS instance");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, autoplay]);

  // Separate autoplay effect for non-HLS videos
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTubeVideo(media.url) || !autoplay || hasError) return;

    // Skip if HLS is handling this
    if (videoUrl.toLowerCase().includes('.m3u8')) return;

    // Set muted first to allow autoplay
    video.muted = true;
    video.play().catch((error) => {
      console.error("Autoplay failed:", error);
      // Try playing without mute after user interaction
      const playAfterInteraction = () => {
        video.muted = false;
        video.play().catch(console.error);
        document.removeEventListener("click", playAfterInteraction);
      };
      document.addEventListener("click", playAfterInteraction, {
        once: true,
      });
    });
  }, [autoplay, hasError, media.url, videoUrl]);

  const [isPlayPromisePending, setIsPlayPromisePending] = useState(false);
  const mountedRef = useRef(true);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Track component mount status with ref
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending play promise
      if (playPromiseRef.current) {
        playPromiseRef.current = null;
      }
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;

    // Debug logging to see what's blocking playback
    console.log("VideoPlayer: togglePlay called", {
      hasVideo: !!video,
      hasError,
      isPlayPromisePending,
      isMounted: mountedRef.current,
      isConnected: video?.isConnected,
      isPlaying,
      videoPaused: video?.paused,
      videoReadyState: video?.readyState,
      isFetchingUrl,
      isLoading,
    });

    // Allow interaction only if video element exists and no critical errors
    if (!video || hasError || isPlayPromisePending) {
      console.log("VideoPlayer: Blocking playback - checks failed", {
        noVideo: !video,
        hasError,
        isPlayPromisePending,
      });
      return;
    }

    // If still fetching URL, ignore button press
    if (isFetchingUrl) {
      console.log("VideoPlayer: Still fetching URL, please wait");
      return;
    }

    // If video is loading but hasn't errored, allow play attempt (it will wait for data)
    console.log("VideoPlayer: Proceeding with play/pause toggle");

    try {
      if (video.paused) {
        setIsPlayPromisePending(true);
        playPromiseRef.current = video.play();
        await playPromiseRef.current;

        // Only update state if component is still mounted
        if (mountedRef.current) {
          console.log("VideoPlayer: Play successful");
          setIsPlaying(true);
        }
      } else {
        video.pause();
        if (mountedRef.current) {
          console.log("VideoPlayer: Pause called");
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error("Play/pause failed:", error);
      if (mountedRef.current && error instanceof Error) {
        if (error.name === "AbortError") {
          // AbortError is expected when component unmounts during play
          console.log(
            "VideoPlayer: Play aborted (likely due to component unmount)"
          );
        } else if (error.name === "NotSupportedError") {
          setHasError(true);
          setErrorMessage(
            "Video format not supported by your browser."
          );
        } else if (error.name === "NotAllowedError") {
          console.log("VideoPlayer: Autoplay blocked, user interaction required");
          // Don't set error for autoplay blocks
        } else {
          setHasError(true);
          setErrorMessage(
            "Failed to play video. Try refreshing or use browser controls."
          );
        }
        // Update state based on actual video state if still mounted
        if (video.isConnected) {
          setIsPlaying(!video.paused);
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsPlayPromisePending(false);
      }
      playPromiseRef.current = null;
    }
  }, [hasError, isPlaying, isPlayPromisePending, isFetchingUrl, isLoading]);

  const retryVideo = () => {
    console.log("VideoPlayer: Retrying video...");
    setHasError(false);
    setErrorMessage("");
    setIsLoading(true);
    setLoadingStage('Retrying...');
    setIsFetchingUrl(false);

    if (isYouTubeVideo(media.url)) {
      // For YouTube videos, force iframe reload by updating URL
      const processedUrl = processVideoUrl(media.url);
      setVideoUrl(processedUrl + "&t=" + Date.now()); // Add timestamp to force reload
      setIsLoading(false);
      setLoadingStage('');
    } else {
      // For adult videos, trigger re-fetch by clearing videoUrl
      const format = media.metadata?.format as string;
      const adultFormats = ['pornhub', 'xvideos', 'redtube', 'xhamster'];

      if (adultFormats.includes(format)) {
        setVideoUrl('');
        // The fetchAdultVideoUrl effect will re-run automatically
      } else {
        // For regular videos, reload the video element
        const video = videoRef.current;
        if (video) {
          video.load();
        } else {
          setVideoUrl('');
          setTimeout(() => setVideoUrl(processedVideoUrl), 100);
        }
      }
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video || isNaN(value) || value < 0) return;

    try {
      video.currentTime = value;
      setCurrentTime(value);
      console.log("VideoPlayer: Seeked to:", value);
    } catch (error) {
      console.error("VideoPlayer: Seek failed:", error);
    }
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
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const qualityOptions = [
    { label: "480p", value: "480p" },
    { label: "720p", value: "720p" },
    { label: "1080p", value: "1080p" },
  ];

  // Render YouTube iframe for YouTube videos
  if (isYouTubeVideo(media.url)) {
    console.log("VideoPlayer: Rendering YouTube iframe. States:", {
      isLoading,
      hasError,
      errorMessage,
    });
    const embedUrl = getYouTubeEmbedUrl(media.url);
    console.log("VideoPlayer: YouTube embed URL:", embedUrl);

    return (
      <Box position="relative">
        <AspectRatio ratio={16 / 9}>
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
                  Unable to load YouTube video. The video may be restricted or
                  unavailable.
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
              title={media.title || "YouTube Video"}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                backgroundColor: "#000",
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
      <AspectRatio ratio={16 / 9}>
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
                {errorMessage || "Unable to load video"}
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
        ) : !videoUrl || videoUrl.length === 0 ? (
          <Center bg="gray.50">
            <VStack spacing={4}>
              <Box
                p={6}
                borderRadius="full"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaBullseye size="40px" color="gray.400" />
              </Box>
              <VStack spacing={2} textAlign="center">
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  No Video Available
                </Text>
                <Text fontSize="sm" color="gray.500" maxW="300px">
                  This game doesn't have any trailers or video content available from our sources.
                </Text>
              </VStack>
            </VStack>
          </Center>
        ) : (
          <Box position="relative" width="100%" height="100%">
            {/* Video element - always rendered when videoUrl exists */}
            <video
              ref={videoRef}
              src={videoUrl}
              poster={media.thumbnail}
              style={{ width: "100%", height: "100%", display: "block" }}
              onClick={togglePlay}
              controls={!showControls}
              crossOrigin="anonymous"
              preload="metadata"
              playsInline
              muted={autoplay}
              onLoadStart={() => {
                console.log("VideoPlayer: Load started");
                if (!isFetchingUrl) {
                  setIsLoading(true);
                  setLoadingStage('Buffering video...');
                }
              }}
              onLoadedMetadata={(e) => {
                const duration = e.currentTarget.duration;
                console.log("VideoPlayer: Metadata loaded, duration:", duration);
                if (!isNaN(duration) && duration > 0) {
                  setDuration(duration);
                  setIsLoading(false);
                  setLoadingStage('');
                }
              }}
              onCanPlay={() => {
                console.log("VideoPlayer: Can play - video ready");
                setIsLoading(false);
                setLoadingStage('');
              }}
              onTimeUpdate={(e) => {
                const currentTime = e.currentTarget.currentTime;
                console.log("VideoPlayer: Time update:", currentTime);
                setCurrentTime(currentTime);
              }}
              onPlay={() => {
                console.log("VideoPlayer: Play event");
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log("VideoPlayer: Pause event");
                setIsPlaying(false);
              }}
              onError={(e) => {
                const error = e.currentTarget.error;
                console.error("VideoPlayer: Video error:", error);

                let errorMsg = "Failed to load video";
                if (error) {
                  switch (error.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                      errorMsg = "Video loading was aborted";
                      break;
                    case MediaError.MEDIA_ERR_NETWORK:
                      errorMsg = "Network error while loading video";
                      break;
                    case MediaError.MEDIA_ERR_DECODE:
                      errorMsg = "Video format not supported";
                      break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                      errorMsg = "Video source not supported";
                      break;
                    default:
                      errorMsg = "Unknown video error";
                  }
                }

                setHasError(true);
                setErrorMessage(errorMsg);
                setIsLoading(false);
              }}
            />

            {/* Loading overlay - shown on top of video while loading */}
            {isLoading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <VStack spacing={3}>
                  <Spinner size="lg" color="white" thickness="4px" />
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    {loadingStage || 'Loading video...'}
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        )}
      </AspectRatio>

      {/* Controls Overlay - show for regular videos (not YouTube, not error) */}
      {showControls && showControlsOverlay && !hasError && (
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
                  aria-label={isPlaying ? "Pause" : "Play"}
                  icon={isPlaying ? <FaPause /> : <FaPlay />}
                  size="sm"
                  onClick={togglePlay}
                  colorScheme="teal"
                  variant="ghost"
                  isDisabled={isFetchingUrl || isPlayPromisePending}
                  opacity={isFetchingUrl ? 0.5 : 1}
                />

                <IconButton
                  aria-label={isMuted ? "Unmute" : "Mute"}
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
                  <MenuList
                    bg={menuBg}
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                  >
                    {qualityOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => setQuality(option.value)}
                        bg={
                          quality === option.value
                            ? menuItemSelectedBg
                            : undefined
                        }
                        color={
                          quality === option.value
                            ? menuItemSelectedColor
                            : undefined
                        }
                        _hover={{
                          bg:
                            quality === option.value
                              ? menuItemSelectedBg
                              : menuItemHoverBg,
                        }}
                        _focus={{
                          bg:
                            quality === option.value
                              ? menuItemSelectedBg
                              : menuItemHoverBg,
                        }}
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

// Custom comparison function to prevent re-renders when media object reference changes
const arePropsEqual = (prevProps: Props, nextProps: Props) => {
  // Only re-render if the actual media URL changes, not the media object reference
  const urlChanged = prevProps.media.url !== nextProps.media.url;
  const autoplayChanged = prevProps.autoplay !== nextProps.autoplay;
  const showControlsChanged = prevProps.showControls !== nextProps.showControls;
  const onDownloadChanged = prevProps.onDownload !== nextProps.onDownload;
  
  const shouldUpdate = urlChanged || autoplayChanged || showControlsChanged || onDownloadChanged;
  
  if (shouldUpdate) {
    console.log("🔴 VideoPlayer: Props changed, allowing re-render", {
      urlChanged,
      autoplayChanged, 
      showControlsChanged,
      onDownloadChanged,
      prevUrl: prevProps.media.url,
      nextUrl: nextProps.media.url
    });
  } else {
    console.log("🔴 VideoPlayer: Props same, preventing re-render");
  }
  
  return !shouldUpdate; // Return true to prevent re-render, false to allow re-render
};

export default React.memo(VideoPlayer, arePropsEqual);
