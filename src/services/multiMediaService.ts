import { MediaCollection, MediaItem } from "../models/mediaItem";
import ApiClient from "./apiClient";
import GameScreenshot from "../models/gameScrrenshot";
import GameTrailer from "../models/gameTrailer";
import { Endpoints } from "../constants/endpoints";
import contentModerationService from "./contentModerationService";
import igdbApiClient from "./igdbApiClient";
import gameMappingService from "./gameMappingService";
import youtubeApiClient from "./youtubeApiClient";
import adultGameApiClient from "./adultGameApiClient";
import adultVideoApiClient from "./adultVideoApiClient";

// Use existing API clients
const screenshotsClient = new ApiClient<{ results: GameScreenshot[] }>(Endpoints.FETCH_GAME_SCREENSHOTS);
const trailersClient = new ApiClient<{ results: GameTrailer[] }>(Endpoints.FETCH_GAME_TRAILERS);

class MultiMediaService {
  async getGameMedia(gameId: number, gameDetails?: { name: string; name_original: string; released?: string }): Promise<MediaCollection> {
    try {
      // Fetch from multiple sources in parallel with individual error handling
      const [rawgMedia, igdbMedia, youtubeMedia, steamMedia, adultMedia] = await Promise.allSettled([
        this.getRawgMedia(gameId),
        gameDetails ? this.getIGDBMedia(gameId, gameDetails) : Promise.resolve({ screenshots: [], videos: [], artwork: [] }),
        gameDetails ? this.getYouTubeMedia(gameDetails.name) : Promise.resolve({ videos: [], gameplay: [] }),
        gameDetails ? this.getSteamMedia(gameId, gameDetails.name) : Promise.resolve({ screenshots: [], videos: [], artwork: [] }),
        gameDetails ? this.getAdultPlatformMedia(gameId, gameDetails.name) : Promise.resolve({ screenshots: [], videos: [], artwork: [], gameplay: [] })
      ]);

      // Extract successful results and log failures
      const rawgResult = rawgMedia.status === 'fulfilled' ? rawgMedia.value : { screenshots: [], videos: [], artwork: [], gameplay: [], total: 0 };
      const igdbResult = igdbMedia.status === 'fulfilled' ? igdbMedia.value : { screenshots: [], videos: [], artwork: [] };
      const youtubeResult = youtubeMedia.status === 'fulfilled' ? youtubeMedia.value : { videos: [], gameplay: [] };
      const steamResult = steamMedia.status === 'fulfilled' ? steamMedia.value : { screenshots: [], videos: [], artwork: [] };
      const adultResult = adultMedia.status === 'fulfilled' ? adultMedia.value : { screenshots: [], videos: [], artwork: [], gameplay: [] };

      // Log any failures
      if (rawgMedia.status === 'rejected') console.warn('RAWG media fetch failed:', rawgMedia.reason);
      if (igdbMedia.status === 'rejected') console.warn('IGDB media fetch failed:', igdbMedia.reason);
      if (youtubeMedia.status === 'rejected') console.warn('YouTube media fetch failed:', youtubeMedia.reason);
      if (steamMedia.status === 'rejected') console.warn('Steam media fetch failed:', steamMedia.reason);
      if (adultMedia.status === 'rejected') console.warn('Adult platform media fetch failed:', adultMedia.reason);

      // Combine and deduplicate media from all sources
      const combinedScreenshots = [
        ...rawgResult.screenshots,
        ...(igdbResult.screenshots || []),
        ...(steamResult.screenshots || []),
        ...(adultResult.screenshots || [])
      ];
      const combinedVideos = [
        ...rawgResult.videos,
        ...(igdbResult.videos || []),
        ...(youtubeResult.videos || []),
        ...(steamResult.videos || []),
        ...(adultResult.videos || [])
      ];
      const combinedArtwork = [
        ...rawgResult.artwork,
        ...(igdbResult.artwork || []),
        ...(steamResult.artwork || []),
        ...(adultResult.artwork || [])
      ];
      const combinedGameplay = [
        ...(rawgResult.gameplay || []),
        ...(youtubeResult.gameplay || []),
        ...(adultResult.gameplay || [])
      ];

      // Remove duplicate media based on URL similarity
      const uniqueScreenshots = this.removeDuplicateMedia(combinedScreenshots);
      const uniqueVideos = this.removeDuplicateMedia(combinedVideos);
      const uniqueArtwork = this.removeDuplicateMedia(combinedArtwork);
      const uniqueGameplay = this.removeDuplicateMedia(combinedGameplay);

      // Add content scoring to all images
      const scoredScreenshots = await this.addContentScoring(uniqueScreenshots);
      const scoredArtwork = await this.addContentScoring(uniqueArtwork);

      // Count successful sources for logging
      const sourcesUsed = [];
      if (rawgResult.screenshots.length > 0 || rawgResult.videos.length > 0) sourcesUsed.push('RAWG');
      if (igdbResult.screenshots?.length || igdbResult.videos?.length || igdbResult.artwork?.length) sourcesUsed.push('IGDB');
      if (youtubeResult.videos?.length || youtubeResult.gameplay?.length) sourcesUsed.push('YouTube');
      if (steamResult.screenshots?.length || steamResult.videos?.length) sourcesUsed.push('Steam');
      if (adultResult.screenshots?.length || adultResult.videos?.length || adultResult.artwork?.length || adultResult.gameplay?.length) sourcesUsed.push('Adult Platforms');

      console.log(`Total media fetched: ${scoredScreenshots.length} screenshots, ${uniqueVideos.length} videos, ${scoredArtwork.length} artwork, ${uniqueGameplay.length} gameplay from ${sourcesUsed.join(', ') || 'no sources'}`);

      return {
        screenshots: scoredScreenshots,
        videos: uniqueVideos,
        artwork: scoredArtwork,
        gameplay: uniqueGameplay,
        total: scoredScreenshots.length + uniqueVideos.length + scoredArtwork.length + uniqueGameplay.length
      };

    } catch (error) {
      console.error('Error fetching game media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: [],
        gameplay: [],
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
            originalUrl: videoUrl, // Store original URL for debugging
            isGameplay: false
          }
        };
      }).filter(video => video.url) || []; // Filter out videos without URLs

      return {
        screenshots,
        videos,
        artwork: [], // RAWG doesn't have artwork
        gameplay: [], // RAWG trailers are not gameplay videos
        total: screenshots.length + videos.length
      };

    } catch (error) {
      console.error('Error fetching RAWG media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: [],
        gameplay: [],
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
          isGameplay: false
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

  // Fetch media from YouTube API (includes gameplay videos)
  private async getYouTubeMedia(gameName: string): Promise<{ videos: MediaItem[]; gameplay: MediaItem[] }> {
    if (!(await youtubeApiClient.isConfigured())) {
      console.log('YouTube API not configured, skipping');
      return { videos: [], gameplay: [] };
    }

    try {
      // Search for game-related videos on YouTube (including gameplay)
      const youtubeVideos = await youtubeApiClient.searchGameVideos(`${gameName} gameplay`, 10);

      if (youtubeVideos.length === 0) {
        return { videos: [], gameplay: [] };
      }

      // Separate gameplay videos from regular trailers based on title/description
      const gameplay: MediaItem[] = [];
      const videos: MediaItem[] = [];

      youtubeVideos.forEach((video, index) => {
        const titleLower = video.snippet.title.toLowerCase();
        const descLower = video.snippet.description.toLowerCase();
        const isGameplay = titleLower.includes('gameplay') ||
          titleLower.includes('playthrough') ||
          titleLower.includes('walkthrough') ||
          titleLower.includes('let\'s play') ||
          descLower.includes('gameplay');

        const mediaItem: MediaItem = {
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
            tags: [video.snippet.channelTitle, ...(isGameplay ? ['gameplay'] : ['trailer'])],
            uploadDate: video.snippet.publishedAt,
            isGameplay: isGameplay
          }
        };

        if (isGameplay) {
          gameplay.push(mediaItem);
        } else {
          videos.push(mediaItem);
        }
      });

      console.log(`YouTube fetched: ${videos.length} trailers, ${gameplay.length} gameplay videos for "${gameName}"`);

      return { videos, gameplay };

    } catch (error) {
      console.error('Error fetching YouTube media:', error);
      return { videos: [], gameplay: [] };
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
          isGameplay: false
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

  // Fetch media from adult game platforms AND adult video platforms
  // Get playable video URL for adult videos
  async getPlayableVideoUrl(mediaItem: MediaItem): Promise<string | null> {
    try {
      const format = mediaItem.metadata?.format as string;

      // Only process adult platform videos
      const adultFormats = ['pornhub', 'xvideos', 'redtube', 'xhamster'];
      if (!adultFormats.includes(format)) {
        console.log(`Not an adult video format: ${format}, returning original URL`);
        return mediaItem.url || null;
      }

      // Check if URL is already a video file URL (not a webpage)
      const videoExtensions = ['.mp4', '.webm', '.m3u8'];
      const isVideoUrl = videoExtensions.some(ext => mediaItem.url?.toLowerCase().includes(ext));

      if (isVideoUrl) {
        console.log(`URL is already a video file: ${mediaItem.url}`);
        return mediaItem.url;
      }

      // Fetch playable URL from API
      console.log(`Fetching playable URL for ${format} video: ${mediaItem.id}`);
      const playableUrl = await adultVideoApiClient.getVideoUrl(mediaItem);

      if (playableUrl) {
        console.log(`✅ Got playable URL for ${format} video`);
        return playableUrl;
      } else {
        console.warn(`⚠️ Could not get playable URL for ${format} video, falling back to page URL`);
        return mediaItem.url || null;
      }

    } catch (error) {
      console.error('Error getting playable video URL:', error);
      return mediaItem.url || null;
    }
  }

  private async getAdultPlatformMedia(gameId: number, gameName: string): Promise<Partial<MediaCollection>> {
    if (!adultGameApiClient.isAdultContentEnabled()) {
      console.log('Adult content is disabled');
      return { screenshots: [], videos: [], artwork: [], gameplay: [] };
    }

    try {
      // Fetch from both adult game platforms and adult video platforms in parallel
      const [gameMedia, allVideoResults] = await Promise.allSettled([
        // Adult game platforms (Nutaku, DLsite, Itch.io)
        adultGameApiClient.isConfigured()
          ? adultGameApiClient.getAllAdultPlatformMedia(gameName, gameId)
          : Promise.resolve({ screenshots: [], videos: [], artwork: [], gameplay: [] }),
        // Adult video platforms (Pornhub, RedTube, xVideos, xHamster)
        adultVideoApiClient.isEnabled()
          ? adultVideoApiClient.searchAllPlatforms(gameName, 8)
          : Promise.resolve([])
      ]);

      const gameResult = gameMedia.status === 'fulfilled' ? gameMedia.value : { screenshots: [], videos: [], artwork: [], gameplay: [] };
      const videoResult = allVideoResults.status === 'fulfilled' ? allVideoResults.value : [];

      // Separate gameplay videos from regular videos based on metadata.isGameplay flag
      const gameplayVideos = videoResult.filter(video => video.metadata?.isGameplay);
      const regularVideos = videoResult.filter(video => !video.metadata?.isGameplay);

      // Combine gameplay from both sources
      const combinedGameplay = [
        ...(gameResult.gameplay || []),
        ...gameplayVideos
      ];

      // Combine regular videos from both sources
      const combinedVideos = [
        ...(gameResult.videos || []),
        ...regularVideos
      ];

      console.log(`Adult platforms fetched: ${gameResult.screenshots.length} screenshots, ${combinedVideos.length} videos (${regularVideos.length} from video platforms), ${gameResult.artwork.length} artwork, ${combinedGameplay.length} gameplay (${gameplayVideos.length} from video platforms)`);

      return {
        screenshots: gameResult.screenshots,
        videos: combinedVideos,
        artwork: gameResult.artwork,
        gameplay: combinedGameplay
      };

    } catch (error) {
      console.error('Error fetching adult platform media:', error);
      return {
        screenshots: [],
        videos: [],
        artwork: [],
        gameplay: []
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

  // Public methods for progressive loading - expose individual source methods
  async getRawgMediaOnly(gameId: number): Promise<MediaCollection> {
    const rawgMedia = await this.getRawgMedia(gameId);

    // Add content scoring to screenshots and artwork
    const scoredScreenshots = await this.addContentScoring(rawgMedia.screenshots);
    const scoredArtwork = await this.addContentScoring(rawgMedia.artwork);

    return {
      screenshots: scoredScreenshots,
      videos: rawgMedia.videos,
      artwork: scoredArtwork,
      gameplay: rawgMedia.gameplay,
      total: scoredScreenshots.length + rawgMedia.videos.length + scoredArtwork.length + rawgMedia.gameplay.length
    };
  }

  async getIGDBMediaOnly(gameId: number, gameDetails: { name: string; name_original: string; released?: string }): Promise<Partial<MediaCollection>> {
    const igdbMedia = await this.getIGDBMedia(gameId, gameDetails);

    // Add content scoring to screenshots and artwork
    const scoredScreenshots = await this.addContentScoring(igdbMedia.screenshots || []);
    const scoredArtwork = await this.addContentScoring(igdbMedia.artwork || []);

    return {
      screenshots: scoredScreenshots,
      videos: igdbMedia.videos,
      artwork: scoredArtwork,
      gameplay: [] // IGDB doesn't have gameplay videos
    };
  }

  async getYouTubeMediaOnly(gameName: string): Promise<{ videos: MediaItem[]; gameplay: MediaItem[] }> {
    return await this.getYouTubeMedia(gameName);
  }

  async getSteamMediaOnly(gameId: number, gameName?: string): Promise<Partial<MediaCollection>> {
    const steamMedia = await this.getSteamMedia(gameId, gameName);

    // Add content scoring to screenshots and artwork
    const scoredScreenshots = await this.addContentScoring(steamMedia.screenshots || []);
    const scoredArtwork = await this.addContentScoring(steamMedia.artwork || []);

    return {
      screenshots: scoredScreenshots,
      videos: steamMedia.videos,
      artwork: scoredArtwork,
      gameplay: [] // Steam doesn't have dedicated gameplay videos
    };
  }

  async getAdultPlatformMediaOnly(gameId: number, gameName: string): Promise<Partial<MediaCollection>> {
    const adultMedia = await this.getAdultPlatformMedia(gameId, gameName);

    // Add content scoring to screenshots and artwork
    const scoredScreenshots = await this.addContentScoring(adultMedia.screenshots || []);
    const scoredArtwork = await this.addContentScoring(adultMedia.artwork || []);

    return {
      screenshots: scoredScreenshots,
      videos: adultMedia.videos,
      artwork: scoredArtwork,
      gameplay: adultMedia.gameplay
    };
  }
}

export default new MultiMediaService();