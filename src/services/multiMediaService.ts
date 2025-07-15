import { MediaCollection, MediaItem } from "../models/mediaItem";
import ApiClient from "./apiClient";
import GameScreenshot from "../models/gameScrrenshot";
import GameTrailer from "../models/gameTrailer";
import { Endpoints } from "../constants/endpoints";
import contentModerationService from "./contentModerationService";
import igdbApiClient from "./igdbApiClient";
import gameMappingService from "./gameMappingService";
import youtubeApiClient from "./youtubeApiClient";

// Use existing API clients
const screenshotsClient = new ApiClient<{ results: GameScreenshot[] }>(Endpoints.FETCH_GAME_SCREENSHOTS);
const trailersClient = new ApiClient<{ results: GameTrailer[] }>(Endpoints.FETCH_GAME_TRAILERS);

class MultiMediaService {
  async getGameMedia(gameId: number, gameDetails?: { name: string; name_original: string; released?: string }): Promise<MediaCollection> {
    try {
      // Fetch from multiple sources in parallel with individual error handling
      const [rawgMedia, igdbMedia, youtubeMedia, steamMedia] = await Promise.allSettled([
        this.getRawgMedia(gameId),
        gameDetails ? this.getIGDBMedia(gameId, gameDetails) : Promise.resolve({ screenshots: [], videos: [], artwork: [] }),
        gameDetails ? this.getYouTubeMedia(gameDetails.name) : Promise.resolve({ videos: [] }),
        gameDetails ? this.getSteamMedia(gameId, gameDetails.name) : Promise.resolve({ screenshots: [], videos: [], artwork: [] })
      ]);

      // Extract successful results and log failures
      const rawgResult = rawgMedia.status === 'fulfilled' ? rawgMedia.value : { screenshots: [], videos: [], artwork: [], total: 0 };
      const igdbResult = igdbMedia.status === 'fulfilled' ? igdbMedia.value : { screenshots: [], videos: [], artwork: [] };
      const youtubeResult = youtubeMedia.status === 'fulfilled' ? youtubeMedia.value : { videos: [] };
      const steamResult = steamMedia.status === 'fulfilled' ? steamMedia.value : { screenshots: [], videos: [], artwork: [] };

      // Log any failures
      if (rawgMedia.status === 'rejected') console.warn('RAWG media fetch failed:', rawgMedia.reason);
      if (igdbMedia.status === 'rejected') console.warn('IGDB media fetch failed:', igdbMedia.reason);
      if (youtubeMedia.status === 'rejected') console.warn('YouTube media fetch failed:', youtubeMedia.reason);
      if (steamMedia.status === 'rejected') console.warn('Steam media fetch failed:', steamMedia.reason);

      // Combine and deduplicate media from all sources
      const combinedScreenshots = [
        ...rawgResult.screenshots, 
        ...(igdbResult.screenshots || []),
        ...(steamResult.screenshots || [])
      ];
      const combinedVideos = [
        ...rawgResult.videos, 
        ...(igdbResult.videos || []), 
        ...(youtubeResult.videos || []),
        ...(steamResult.videos || [])
      ];
      const combinedArtwork = [
        ...rawgResult.artwork, 
        ...(igdbResult.artwork || []),
        ...(steamResult.artwork || [])
      ];

      // Remove duplicate media based on URL similarity
      const uniqueScreenshots = this.removeDuplicateMedia(combinedScreenshots);
      const uniqueVideos = this.removeDuplicateMedia(combinedVideos);
      const uniqueArtwork = this.removeDuplicateMedia(combinedArtwork);

      // Add content scoring to all images
      const scoredScreenshots = await this.addContentScoring(uniqueScreenshots);
      const scoredArtwork = await this.addContentScoring(uniqueArtwork);

      // Count successful sources for logging
      const sourcesUsed = [];
      if (rawgResult.screenshots.length > 0 || rawgResult.videos.length > 0) sourcesUsed.push('RAWG');
      if (igdbResult.screenshots?.length || igdbResult.videos?.length || igdbResult.artwork?.length) sourcesUsed.push('IGDB');
      if (youtubeResult.videos?.length) sourcesUsed.push('YouTube');
      if (steamResult.screenshots?.length || steamResult.videos?.length) sourcesUsed.push('Steam');

      console.log(`Total media fetched: ${scoredScreenshots.length} screenshots, ${uniqueVideos.length} videos, ${scoredArtwork.length} artwork from ${sourcesUsed.join(', ') || 'no sources'}`);

      return {
        screenshots: scoredScreenshots,
        videos: uniqueVideos,
        artwork: scoredArtwork,
        total: scoredScreenshots.length + uniqueVideos.length + scoredArtwork.length
      };

    } catch (error) {
      console.error('Error fetching game media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: [],
        total: 0
      };
    }
  }

  // Fetch media from RAWG API
  private async getRawgMedia(gameId: number): Promise<MediaCollection> {
    try {
      const screenshotsEndpoint = Endpoints.FETCH_GAME_SCREENSHOTS.replace(':id', gameId.toString());
      const trailersEndpoint = Endpoints.FETCH_GAME_TRAILERS.replace(':id', gameId.toString());
      
      const screenshotsClient = new ApiClient<{ results: GameScreenshot[] }>(screenshotsEndpoint);
      const trailersClient = new ApiClient<{ results: GameTrailer[] }>(trailersEndpoint);
      
      const [screenshotsResponse, trailersResponse] = await Promise.all([
        screenshotsClient.get({ page_size: 20 }),
        trailersClient.get({ page_size: 10 })
      ]);

      // Convert RAWG screenshots to MediaItems
      const screenshots: MediaItem[] = screenshotsResponse?.results?.map((screenshot, index) => ({
        id: `rawg-screenshot-${screenshot.id}`,
        type: 'image' as const,
        url: screenshot.image,
        thumbnail: screenshot.image,
        title: `Screenshot ${index + 1}`,
        source: 'rawg' as const,
        gameId,
        width: screenshot.width,
        height: screenshot.height,
      })) || [];

      // Convert RAWG trailers to MediaItems  
      const videos: MediaItem[] = trailersResponse?.results?.map((trailer) => {
        // Use the best available video quality
        const videoUrl = trailer.data?.[480] || trailer.data?.[360] || trailer.data?.max || '';
        
        return {
          id: `rawg-video-${trailer.id}`,
          type: 'video' as const,
          url: videoUrl,
          thumbnail: trailer.preview,
          title: trailer.name,
          source: 'rawg' as const,
          gameId,
          metadata: {
            duration: 0, // RAWG doesn't provide duration
            format: 'mp4',
            originalUrl: videoUrl // Store original URL for debugging
          }
        };
      }).filter(video => video.url) || []; // Filter out videos without URLs

      return {
        screenshots,
        videos,
        artwork: [], // RAWG doesn't have artwork
        total: screenshots.length + videos.length
      };

    } catch (error) {
      console.error('Error fetching RAWG media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: [],
        total: 0
      };
    }
  }

  // Fetch media from IGDB API
  private async getIGDBMedia(gameId: number, gameDetails: { name: string; name_original: string; released?: string }): Promise<Partial<MediaCollection>> {
    if (!(await igdbApiClient.isConfigured())) {
      console.log('IGDB not configured, skipping');
      return { screenshots: [], videos: [], artwork: [] };
    }

    try {
      // Get IGDB game ID using mapping service
      const igdbId = await gameMappingService.getIGDBId({
        id: gameId,
        name: gameDetails.name,
        name_original: gameDetails.name_original,
        released: gameDetails.released
      } as any);

      if (!igdbId) {
        console.log(`No IGDB mapping found for game: ${gameDetails.name}`);
        return { screenshots: [], videos: [], artwork: [] };
      }

      // Fetch all media types from IGDB in parallel
      const [igdbScreenshots, igdbVideos, igdbArtwork] = await Promise.all([
        igdbApiClient.getGameScreenshots(igdbId),
        igdbApiClient.getGameVideos(igdbId),
        igdbApiClient.getGameArtwork(igdbId)
      ]);

      // Convert IGDB screenshots to MediaItems
      const screenshots: MediaItem[] = igdbScreenshots.map((screenshot, index) => ({
        id: `igdb-screenshot-${screenshot.id}`,
        type: 'image' as const,
        url: igdbApiClient.getImageUrl(screenshot.image_id, 'screenshot_big'),
        thumbnail: igdbApiClient.getImageUrl(screenshot.image_id, 'screenshot_med'),
        title: `IGDB Screenshot ${index + 1}`,
        source: 'igdb' as const,
        gameId,
        width: screenshot.width,
        height: screenshot.height,
      }));

      // Convert IGDB videos to MediaItems
      const videos: MediaItem[] = igdbVideos.map((video) => ({
        id: `igdb-video-${video.id}`,
        type: 'video' as const,
        url: igdbApiClient.getVideoUrl(video.video_id),
        thumbnail: igdbApiClient.getVideoThumbnail(video.video_id),
        title: video.name || 'IGDB Video',
        source: 'igdb' as const,
        gameId,
        metadata: {
          duration: 0, // IGDB doesn't provide duration
          format: 'youtube',
        }
      }));

      // Convert IGDB artwork to MediaItems
      const artwork: MediaItem[] = igdbArtwork.map((art, index) => ({
        id: `igdb-artwork-${art.id}`,
        type: 'image' as const,
        url: igdbApiClient.getImageUrl(art.image_id, '1080p'),
        thumbnail: igdbApiClient.getImageUrl(art.image_id, 'cover_big'),
        title: `Artwork ${index + 1}`,
        source: 'igdb' as const,
        gameId,
        width: art.width,
        height: art.height,
      }));

      console.log(`IGDB fetched: ${screenshots.length} screenshots, ${videos.length} videos, ${artwork.length} artwork`);

      return {
        screenshots,
        videos,
        artwork
      };

    } catch (error) {
      console.error('Error fetching IGDB media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: []
      };
    }
  }

  // Fetch media from YouTube API
  private async getYouTubeMedia(gameName: string): Promise<{ videos: MediaItem[] }> {
    if (!(await youtubeApiClient.isConfigured())) {
      console.log('YouTube API not configured, skipping');
      return { videos: [] };
    }

    try {
      // Search for game-related videos on YouTube
      const youtubeVideos = await youtubeApiClient.searchGameVideos(gameName, 8);

      if (youtubeVideos.length === 0) {
        return { videos: [] };
      }

      // Convert YouTube videos to MediaItems
      const videos: MediaItem[] = youtubeVideos.map((video, index) => ({
        id: `youtube-video-${video.id.videoId}`,
        type: 'video' as const,
        url: youtubeApiClient.getVideoUrl(video.id.videoId),
        thumbnail: youtubeApiClient.getThumbnailUrl(video, 'high'),
        title: video.snippet.title,
        description: video.snippet.description.substring(0, 200) + '...',
        source: 'youtube' as const,
        gameId: 0, // YouTube videos don't have a gameId
        metadata: {
          duration: 0, // YouTube search doesn't provide duration
          format: 'youtube',
          tags: [video.snippet.channelTitle],
          uploadDate: video.snippet.publishedAt,
        }
      }));

      console.log(`YouTube fetched: ${videos.length} videos for "${gameName}"`);

      return { videos };

    } catch (error) {
      console.error('Error fetching YouTube media:', error);
      return { videos: [] };
    }
  }

  // Steam integration  
  private async getSteamMedia(gameId: number, gameName?: string): Promise<Partial<MediaCollection>> {
    try {
      // Import steamApiClient
      const steamApiClient = (await import('./steamApiClient')).default;
      
      if (!steamApiClient.isAvailable()) {
        console.log('Steam API not available, skipping');
        return { screenshots: [], videos: [], artwork: [] };
      }

      let steamAppDetails = null;
      
      // Try to get Steam app details by ID first
      if (gameId) {
        steamAppDetails = await steamApiClient.getAppDetails(gameId);
      }
      
      // If no details found and we have a game name, try searching
      if (!steamAppDetails && gameName) {
        const searchResults = await steamApiClient.searchApps(gameName, 5);
        if (searchResults.length > 0) {
          // Try to get details for the first matching result
          steamAppDetails = await steamApiClient.getAppDetails(searchResults[0].appid);
        }
      }

      if (!steamAppDetails) {
        return { screenshots: [], videos: [], artwork: [] };
      }

      // Convert Steam screenshots to MediaItems
      const screenshots: MediaItem[] = steamAppDetails.screenshots?.map((screenshot, index) => ({
        id: `steam-screenshot-${screenshot.id}`,
        type: 'image' as const,
        url: screenshot.path_full,
        thumbnail: screenshot.path_thumbnail,
        title: `Steam Screenshot ${index + 1}`,
        source: 'steam' as const,
        gameId,
        width: 1920, // Steam screenshots are typically 1920x1080
        height: 1080,
      })) || [];

      // Convert Steam videos to MediaItems
      const videos: MediaItem[] = steamAppDetails.movies?.map((movie) => ({
        id: `steam-video-${movie.id}`,
        type: 'video' as const,
        url: movie.mp4.max || movie.mp4[480] || '',
        thumbnail: movie.thumbnail,
        title: movie.name,
        source: 'steam' as const,
        gameId,
        metadata: {
          duration: 0, // Steam doesn't provide duration
          format: 'mp4',
          webmUrl: movie.webm.max || movie.webm[480] || '',
        }
      })).filter(video => video.url) || [];

      console.log(`Steam fetched: ${screenshots.length} screenshots, ${videos.length} videos for "${gameName}"`);

      return {
        screenshots,
        videos,
        artwork: [] // Steam doesn't have separate artwork
      };

    } catch (error) {
      console.error('Error fetching Steam media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: []
      };
    }
  }

  // Remove duplicate media items based on URL similarity
  private removeDuplicateMedia(mediaItems: MediaItem[]): MediaItem[] {
    const seen = new Set<string>();
    const uniqueItems: MediaItem[] = [];

    for (const item of mediaItems) {
      // Create a normalized URL for comparison
      const normalizedUrl = this.normalizeMediaUrl(item.url);
      
      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  }

  // Normalize media URLs for duplicate detection
  private normalizeMediaUrl(url: string): string {
    return url
      .toLowerCase()
      .replace(/https?:\/\//, '') // Remove protocol
      .replace(/\/+$/, '') // Remove trailing slashes
      .replace(/\?.*$/, '') // Remove query parameters
      .replace(/#.*$/, ''); // Remove fragments
  }

  // Add content scoring to media items
  private async addContentScoring(mediaItems: MediaItem[]): Promise<MediaItem[]> {
    try {
      // Only score images, limit to first 5 for performance
      const imagesToScore = mediaItems
        .filter(item => item.type === 'image')
        .slice(0, 5);

      if (imagesToScore.length === 0) {
        return mediaItems;
      }

      // Analyze images for content scoring
      const imageUrls = imagesToScore.map(item => item.url);
      const contentScores = await contentModerationService.analyzeMultipleImages(imageUrls);

      // Add scores to corresponding media items
      const scoredItems = mediaItems.map(item => {
        if (item.type === 'image') {
          const index = imagesToScore.findIndex(img => img.id === item.id);
          if (index !== -1 && contentScores[index]) {
            return {
              ...item,
              contentScore: contentScores[index] || undefined
            };
          }
        }
        return item;
      });

      return scoredItems;

    } catch (error) {
      console.error('Error adding content scoring:', error);
      return mediaItems; // Return original items if scoring fails
    }
  }
}

export default new MultiMediaService();