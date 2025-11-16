import { MediaItem } from "../models/mediaItem";

// Pornhub API Response Interface
interface PornhubVideo {
  video_id: string;
  title: string;
  duration: string;
  thumb: string;
  default_thumb: string;
  url: string;
  publish_date: string;
  tags: Array<{ tag_name: string }>;
  categories: Array<{ category: string }>;
}

interface PornhubSearchResponse {
  videos: PornhubVideo[];
}

// xVideos Video Interface (scraped data structure)
interface XVideosVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  views: string;
}

// RedTube API Response Interface
interface RedTubeVideo {
  video_id: string;
  title: string;
  duration: string;
  thumb: string;
  url: string;
  publish_date: string;
  tags: string[];
}

interface RedTubeSearchResponse {
  videos: RedTubeVideo[];
  count: number;
}

class AdultVideoApiClient {
  private serverBaseUrl: string;
  private enabled: boolean;

  constructor() {
    this.serverBaseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3501';
    this.enabled = import.meta.env.VITE_ADULT_CONTENT_ENABLED === 'true';
  }

  // Check if adult video search is enabled
  isEnabled(): boolean {
    return this.enabled;
  }

  // Search Pornhub for game-related videos
  async searchPornhub(gameName: string, limit: number = 10): Promise<MediaItem[]> {
    if (!this.isEnabled()) {
      console.log('Adult video search is disabled');
      return [];
    }

    try {
      // Search for game name + gameplay keywords
      const searchQuery = `${gameName} gameplay game`;
      console.log(`🔞 Pornhub: Searching for "${searchQuery}"`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/pornhub/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('Pornhub search failed:', response.statusText);
        return [];
      }

      const data: PornhubSearchResponse = await response.json();

      if (!data.videos || data.videos.length === 0) {
        return [];
      }

      // Convert ALL videos to MediaItems (no filtering)
      const mediaItems: MediaItem[] = data.videos.map(video => {
        const titleLower = video.title.toLowerCase();
        const tags = video.tags?.map(t => t.tag_name.toLowerCase()) || [];
        const categories = video.categories?.map(c => c.category.toLowerCase()) || [];

        // Detect if this is gameplay content
        const isGameplay = (
          titleLower.includes('gameplay') ||
          titleLower.includes('playthrough') ||
          titleLower.includes('game play') ||
          titleLower.includes('walkthrough') ||
          tags.some(tag => tag.includes('gameplay') || tag.includes('game')) ||
          categories.some(cat => cat.includes('game'))
        );

        return {
          id: `pornhub-${video.video_id}`,
          type: 'video' as const,
          url: video.url,
          thumbnail: video.default_thumb || video.thumb,
          title: video.title,
          source: 'nutaku' as const,
          gameId: 0,
          contentRating: 'explicit' as const,
          metadata: {
            duration: parseInt(video.duration) || 0,
            format: 'pornhub',
            tags: [
              ...(isGameplay ? ['gameplay'] : []),
              'adult',
              ...(video.tags?.map(t => t.tag_name) || [])
            ],
            uploadDate: video.publish_date,
            isGameplay // Track if it's gameplay content
          }
        };
      });

      console.log(`Pornhub found: ${mediaItems.length} videos`);
      return mediaItems;

    } catch (error) {
      console.error('Error searching Pornhub:', error);
      return [];
    }
  }

  // Search xVideos for game-related videos
  async searchXVideos(gameName: string, limit: number = 10): Promise<MediaItem[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const searchQuery = `${gameName} gameplay game`;
      console.log(`🔞 xVideos: Searching for "${searchQuery}"`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/xvideos/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('xVideos search failed:', response.statusText);
        return [];
      }

      const data: XVideosVideo[] = await response.json();

      if (!data || data.length === 0) {
        return [];
      }

      // Convert ALL videos to MediaItems (no filtering)
      const mediaItems: MediaItem[] = data.map(video => {
        const titleLower = video.title.toLowerCase();

        // Detect if this is gameplay content
        const isGameplay = (
          titleLower.includes('gameplay') ||
          titleLower.includes('playthrough') ||
          titleLower.includes('game play') ||
          titleLower.includes('walkthrough')
        );

        return {
          id: `xvideos-${video.id}`,
          type: 'video' as const,
          url: video.url,
          thumbnail: video.thumbnail,
          title: video.title,
          source: 'nutaku' as const,
          gameId: 0,
          contentRating: 'explicit' as const,
          metadata: {
            duration: 0,
            format: 'xvideos',
            tags: [
              ...(isGameplay ? ['gameplay'] : []),
              'adult'
            ],
            isGameplay
          }
        };
      });

      console.log(`xVideos found: ${mediaItems.length} videos`);
      return mediaItems;

    } catch (error) {
      console.error('Error searching xVideos:', error);
      return [];
    }
  }

  // Search RedTube for game-related videos
  async searchRedTube(gameName: string, limit: number = 10): Promise<MediaItem[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const searchQuery = `${gameName} gameplay game`;
      console.log(`🔞 RedTube: Searching for "${searchQuery}"`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/redtube/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('RedTube search failed:', response.statusText);
        return [];
      }

      const data: RedTubeSearchResponse = await response.json();

      if (!data.videos || data.videos.length === 0) {
        return [];
      }

      // Convert ALL videos to MediaItems (no filtering)
      const mediaItems: MediaItem[] = data.videos.map(video => {
        const titleLower = video.title.toLowerCase();
        const tags = video.tags?.map(t => t.toLowerCase()) || [];

        // Detect if this is gameplay content
        const isGameplay = (
          titleLower.includes('gameplay') ||
          titleLower.includes('playthrough') ||
          titleLower.includes('game play') ||
          titleLower.includes('walkthrough') ||
          tags.some(tag => tag.includes('gameplay') || tag.includes('game'))
        );

        return {
          id: `redtube-${video.video_id}`,
          type: 'video' as const,
          url: video.url,
          thumbnail: video.thumb,
          title: video.title,
          source: 'nutaku' as const,
          gameId: 0,
          contentRating: 'explicit' as const,
          metadata: {
            duration: parseInt(video.duration) || 0,
            format: 'redtube',
            tags: [
              ...(isGameplay ? ['gameplay'] : []),
              'adult',
              ...(video.tags || [])
            ],
            uploadDate: video.publish_date,
            isGameplay
          }
        };
      });

      console.log(`RedTube found: ${mediaItems.length} videos`);
      return mediaItems;

    } catch (error) {
      console.error('Error searching RedTube:', error);
      return [];
    }
  }

  // Search xHamster for game-related videos
  async searchXHamster(gameName: string, limit: number = 10): Promise<MediaItem[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const searchQuery = `${gameName} gameplay game`;
      console.log(`🔞 xHamster: Searching for "${searchQuery}"`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/xhamster/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('xHamster search failed:', response.statusText);
        return [];
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return [];
      }

      // Convert ALL videos to MediaItems (no filtering)
      const mediaItems: MediaItem[] = data.map((video: any) => {
        const titleLower = video.title.toLowerCase();

        // Detect if this is gameplay content
        const isGameplay = (
          titleLower.includes('gameplay') ||
          titleLower.includes('playthrough') ||
          titleLower.includes('game play') ||
          titleLower.includes('walkthrough')
        );

        return {
          id: `xhamster-${video.id}`,
          type: 'video' as const,
          url: video.url,
          thumbnail: video.thumbnail,
          title: video.title,
          source: 'nutaku' as const,
          gameId: 0,
          contentRating: 'explicit' as const,
          metadata: {
            duration: video.duration || 0,
            format: 'xhamster',
            tags: [
              ...(isGameplay ? ['gameplay'] : []),
              'adult'
            ],
            isGameplay
          }
        };
      });

      console.log(`xHamster found: ${mediaItems.length} videos`);
      return mediaItems;

    } catch (error) {
      console.error('Error searching xHamster:', error);
      return [];
    }
  }

  // Aggregate videos from all adult platforms
  async searchAllPlatforms(gameName: string, limitPerPlatform: number = 8): Promise<MediaItem[]> {
    if (!this.isEnabled()) {
      console.log('Adult video search is disabled');
      return [];
    }

    console.log(`🔞 Searching all adult video platforms for "${gameName}"...`);

    try {
      // Search all platforms in parallel
      const [pornhubVideos, xvideosVideos, redtubeVideos, xhamsterVideos] = await Promise.allSettled([
        this.searchPornhub(gameName, limitPerPlatform),
        this.searchXVideos(gameName, limitPerPlatform),
        this.searchRedTube(gameName, limitPerPlatform),
        this.searchXHamster(gameName, limitPerPlatform)
      ]);

      // Extract successful results
      const allVideos: MediaItem[] = [];

      if (pornhubVideos.status === 'fulfilled') allVideos.push(...pornhubVideos.value);
      if (xvideosVideos.status === 'fulfilled') allVideos.push(...xvideosVideos.value);
      if (redtubeVideos.status === 'fulfilled') allVideos.push(...redtubeVideos.value);
      if (xhamsterVideos.status === 'fulfilled') allVideos.push(...xhamsterVideos.value);

      // Remove duplicates based on title similarity
      const uniqueVideos = this.removeDuplicateVideos(allVideos);

      // Count gameplay vs non-gameplay videos
      const gameplayCount = uniqueVideos.filter(v => v.metadata?.isGameplay).length;
      const regularCount = uniqueVideos.length - gameplayCount;

      console.log(`🔞 Total adult videos found: ${uniqueVideos.length} (${gameplayCount} gameplay, ${regularCount} regular) - from ${allVideos.length} before deduplication`);

      return uniqueVideos;

    } catch (error) {
      console.error('Error searching adult video platforms:', error);
      return [];
    }
  }

  // Remove duplicate videos based on title similarity
  private removeDuplicateVideos(videos: MediaItem[]): MediaItem[] {
    const seen = new Set<string>();
    const uniqueVideos: MediaItem[] = [];

    for (const video of videos) {
      // Normalize title for comparison
      const normalizedTitle = video.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 50) || '';

      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        uniqueVideos.push(video);
      }
    }

    return uniqueVideos;
  }

  // Get playable video URL for Pornhub video
  async getPornhubVideoUrl(videoId: string, pageUrl: string): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      console.log(`🎬 Fetching playable URL for Pornhub video ${videoId}`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/pornhub/video/${videoId}?pageUrl=${encodeURIComponent(pageUrl)}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('Failed to get Pornhub video URL:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.videoUrl || null;

    } catch (error) {
      console.error('Error getting Pornhub video URL:', error);
      return null;
    }
  }

  // Get playable video URL for xVideos video
  async getXVideosVideoUrl(videoId: string, pageUrl: string): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      console.log(`🎬 Fetching playable URL for xVideos video ${videoId}`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/xvideos/video/${videoId}?pageUrl=${encodeURIComponent(pageUrl)}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('Failed to get xVideos video URL:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.videoUrl || null;

    } catch (error) {
      console.error('Error getting xVideos video URL:', error);
      return null;
    }
  }

  // Get playable video URL for RedTube video
  async getRedTubeVideoUrl(videoId: string, pageUrl: string): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      console.log(`🎬 Fetching playable URL for RedTube video ${videoId}`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/redtube/video/${videoId}?pageUrl=${encodeURIComponent(pageUrl)}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('Failed to get RedTube video URL:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.videoUrl || null;

    } catch (error) {
      console.error('Error getting RedTube video URL:', error);
      return null;
    }
  }

  // Get playable video URL for xHamster video
  async getXHamsterVideoUrl(videoId: string, pageUrl: string): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      console.log(`🎬 Fetching playable URL for xHamster video ${videoId}`);

      const response = await fetch(
        `${this.serverBaseUrl}/api/xhamster/video/${videoId}?pageUrl=${encodeURIComponent(pageUrl)}`,
        { cache: 'no-cache' }
      );

      if (!response.ok) {
        console.warn('Failed to get xHamster video URL:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.videoUrl || null;

    } catch (error) {
      console.error('Error getting xHamster video URL:', error);
      return null;
    }
  }

  // Generic method to get playable URL for any adult video
  async getVideoUrl(mediaItem: MediaItem): Promise<string | null> {
    if (!this.isEnabled() || !mediaItem.url) {
      return null;
    }

    const format = mediaItem.metadata?.format as string;
    const videoId = mediaItem.id.split('-')[1]; // Extract ID after platform prefix

    try {
      switch (format) {
        case 'pornhub':
          return await this.getPornhubVideoUrl(videoId, mediaItem.url);
        case 'xvideos':
          return await this.getXVideosVideoUrl(videoId, mediaItem.url);
        case 'redtube':
          return await this.getRedTubeVideoUrl(videoId, mediaItem.url);
        case 'xhamster':
          return await this.getXHamsterVideoUrl(videoId, mediaItem.url);
        default:
          console.warn(`Unknown video format: ${format}`);
          return null;
      }
    } catch (error) {
      console.error(`Error getting video URL for ${format}:`, error);
      return null;
    }
  }
}

export default new AdultVideoApiClient();
