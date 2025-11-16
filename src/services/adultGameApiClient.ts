import { MediaItem } from "../models/mediaItem";

// Nutaku Platform Interfaces
interface NutakuGame {
  id: number;
  title: string;
  images: {
    screenshots?: string[];
    gallery?: string[];
  };
  videos?: {
    url: string;
    thumbnail: string;
    title: string;
  }[];
}

// DLsite Platform Interfaces
interface DLsiteGame {
  id: string;
  title: string;
  images: string[];
  sample_images?: string[];
}

// Itch.io Platform Interfaces
interface ItchGame {
  id: number;
  title: string;
  cover_url: string;
  screenshots: {
    url: string;
    thumb: string;
  }[];
}

class AdultGameApiClient {
  private nutakuApiKey: string;
  private dlsiteApiKey: string;
  private itchApiKey: string;
  private serverBaseUrl: string;

  constructor() {
    this.nutakuApiKey = import.meta.env.VITE_NUTAKU_API_KEY || '';
    this.dlsiteApiKey = import.meta.env.VITE_DLSITE_API_KEY || '';
    this.itchApiKey = import.meta.env.VITE_ITCH_API_KEY || '';
    this.serverBaseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3501';
  }

  // Check if adult content is enabled
  isAdultContentEnabled(): boolean {
    const enabled = import.meta.env.VITE_ADULT_CONTENT_ENABLED === 'true';
    console.log('Adult content enabled:', enabled);
    return enabled;
  }

  // Check if any adult platform is configured
  isConfigured(): boolean {
    return this.isAdultContentEnabled() &&
           !!(this.nutakuApiKey || this.dlsiteApiKey || this.itchApiKey);
  }

  // Nutaku Platform Methods
  async getNutakuMedia(gameName: string, gameId: number): Promise<{ screenshots: MediaItem[]; videos: MediaItem[]; gameplay: MediaItem[] }> {
    if (!this.nutakuApiKey || this.nutakuApiKey === 'your_nutaku_api_key_here') {
      console.log('Nutaku API not configured');
      return { screenshots: [], videos: [], gameplay: [] };
    }

    try {
      // Use server proxy to fetch from Nutaku
      const response = await fetch(`${this.serverBaseUrl}/api/nutaku/search?q=${encodeURIComponent(gameName)}`);

      if (!response.ok) {
        console.warn('Nutaku API request failed:', response.statusText);
        return { screenshots: [], videos: [], gameplay: [] };
      }

      const data: NutakuGame[] = await response.json();

      if (!data || data.length === 0) {
        return { screenshots: [], videos: [], gameplay: [] };
      }

      // Use the first matching game
      const game = data[0];

      // Convert screenshots
      const screenshots: MediaItem[] = (game.images.screenshots || []).map((url, index) => ({
        id: `nutaku-screenshot-${game.id}-${index}`,
        type: 'image' as const,
        url,
        thumbnail: url,
        title: `${game.title} - Screenshot ${index + 1}`,
        source: 'nutaku' as const,
        gameId,
        contentRating: 'adult' as const,
      }));

      // Convert gallery images
      const gallery: MediaItem[] = (game.images.gallery || []).map((url, index) => ({
        id: `nutaku-gallery-${game.id}-${index}`,
        type: 'image' as const,
        url,
        thumbnail: url,
        title: `${game.title} - Gallery ${index + 1}`,
        source: 'nutaku' as const,
        gameId,
        contentRating: 'adult' as const,
      }));

      // Convert videos to gameplay
      const gameplay: MediaItem[] = (game.videos || []).map((video, index) => ({
        id: `nutaku-video-${game.id}-${index}`,
        type: 'video' as const,
        url: video.url,
        thumbnail: video.thumbnail,
        title: video.title || `${game.title} - Gameplay ${index + 1}`,
        source: 'nutaku' as const,
        gameId,
        contentRating: 'adult' as const,
        metadata: {
          format: 'mp4',
          tags: ['gameplay', 'adult']
        }
      }));

      console.log(`Nutaku fetched: ${screenshots.length} screenshots, ${gallery.length} gallery, ${gameplay.length} gameplay videos`);

      return {
        screenshots: [...screenshots, ...gallery],
        videos: [],
        gameplay
      };

    } catch (error) {
      console.error('Error fetching Nutaku media:', error);
      return { screenshots: [], videos: [], gameplay: [] };
    }
  }

  // DLsite Platform Methods
  async getDLsiteMedia(gameName: string, gameId: number): Promise<{ screenshots: MediaItem[]; artwork: MediaItem[] }> {
    if (!this.dlsiteApiKey || this.dlsiteApiKey === 'your_dlsite_api_key_here') {
      console.log('DLsite API not configured');
      return { screenshots: [], artwork: [] };
    }

    try {
      // Use server proxy to fetch from DLsite
      const response = await fetch(`${this.serverBaseUrl}/api/dlsite/search?q=${encodeURIComponent(gameName)}`);

      if (!response.ok) {
        console.warn('DLsite API request failed:', response.statusText);
        return { screenshots: [], artwork: [] };
      }

      const data: DLsiteGame[] = await response.json();

      if (!data || data.length === 0) {
        return { screenshots: [], artwork: [] };
      }

      const game = data[0];

      // Convert main images to screenshots
      const screenshots: MediaItem[] = (game.images || []).map((url, index) => ({
        id: `dlsite-screenshot-${game.id}-${index}`,
        type: 'image' as const,
        url,
        thumbnail: url,
        title: `${game.title} - Screenshot ${index + 1}`,
        source: 'dlsite' as const,
        gameId,
        contentRating: 'adult' as const,
      }));

      // Convert sample images to artwork
      const artwork: MediaItem[] = (game.sample_images || []).map((url, index) => ({
        id: `dlsite-artwork-${game.id}-${index}`,
        type: 'image' as const,
        url,
        thumbnail: url,
        title: `${game.title} - Artwork ${index + 1}`,
        source: 'dlsite' as const,
        gameId,
        contentRating: 'adult' as const,
      }));

      console.log(`DLsite fetched: ${screenshots.length} screenshots, ${artwork.length} artwork`);

      return {
        screenshots,
        artwork
      };

    } catch (error) {
      console.error('Error fetching DLsite media:', error);
      return { screenshots: [], artwork: [] };
    }
  }

  // Itch.io Platform Methods (supports adult games)
  async getItchMedia(gameName: string, gameId: number): Promise<{ screenshots: MediaItem[]; artwork: MediaItem[] }> {
    if (!this.itchApiKey || this.itchApiKey === 'your_itch_api_key_here') {
      console.log('Itch.io API not configured');
      return { screenshots: [], artwork: [] };
    }

    try {
      // Use server proxy to fetch from Itch.io
      const response = await fetch(`${this.serverBaseUrl}/api/itch/search?q=${encodeURIComponent(gameName)}`, {
        headers: {
          'Authorization': `Bearer ${this.itchApiKey}`
        }
      });

      if (!response.ok) {
        console.warn('Itch.io API request failed:', response.statusText);
        return { screenshots: [], artwork: [] };
      }

      const data: { games: ItchGame[] } = await response.json();

      if (!data.games || data.games.length === 0) {
        return { screenshots: [], artwork: [] };
      }

      const game = data.games[0];

      // Convert screenshots
      const screenshots: MediaItem[] = (game.screenshots || []).map((screenshot, index) => ({
        id: `itch-screenshot-${game.id}-${index}`,
        type: 'image' as const,
        url: screenshot.url,
        thumbnail: screenshot.thumb || screenshot.url,
        title: `${game.title} - Screenshot ${index + 1}`,
        source: 'itch' as const,
        gameId,
        contentRating: 'mature' as const,
      }));

      // Convert cover to artwork
      const artwork: MediaItem[] = game.cover_url ? [{
        id: `itch-cover-${game.id}`,
        type: 'image' as const,
        url: game.cover_url,
        thumbnail: game.cover_url,
        title: `${game.title} - Cover Art`,
        source: 'itch' as const,
        gameId,
        contentRating: 'mature' as const,
      }] : [];

      console.log(`Itch.io fetched: ${screenshots.length} screenshots, ${artwork.length} artwork`);

      return {
        screenshots,
        artwork
      };

    } catch (error) {
      console.error('Error fetching Itch.io media:', error);
      return { screenshots: [], artwork: [] };
    }
  }

  // F95Zone scraper (web scraping - use cautiously and respect ToS)
  async getF95ZoneMedia(gameName: string, gameId: number): Promise<{ screenshots: MediaItem[]; gameplay: MediaItem[] }> {
    // F95Zone doesn't have a public API, so this would require web scraping
    // For now, return empty results as a placeholder
    console.log('F95Zone scraping not implemented (requires web scraping compliance check)');

    try {
      // Would use server-side scraping through proxy
      const response = await fetch(`${this.serverBaseUrl}/api/f95zone/search?q=${encodeURIComponent(gameName)}`);

      if (!response.ok) {
        return { screenshots: [], gameplay: [] };
      }

      const data = await response.json();

      // Parse scraped data and convert to MediaItems
      // This is a placeholder for actual implementation

      return { screenshots: [], gameplay: [] };

    } catch (error) {
      console.error('Error fetching F95Zone media:', error);
      return { screenshots: [], gameplay: [] };
    }
  }

  // Aggregate all adult platform media
  async getAllAdultPlatformMedia(gameName: string, gameId: number): Promise<{
    screenshots: MediaItem[];
    videos: MediaItem[];
    artwork: MediaItem[];
    gameplay: MediaItem[];
  }> {
    if (!this.isAdultContentEnabled()) {
      console.log('Adult content is disabled');
      return { screenshots: [], videos: [], artwork: [], gameplay: [] };
    }

    try {
      // Fetch from all configured platforms in parallel
      const [nutakuMedia, dlsiteMedia, itchMedia] = await Promise.allSettled([
        this.getNutakuMedia(gameName, gameId),
        this.getDLsiteMedia(gameName, gameId),
        this.getItchMedia(gameName, gameId)
      ]);

      // Extract successful results
      const nutakuResult = nutakuMedia.status === 'fulfilled' ? nutakuMedia.value : { screenshots: [], videos: [], gameplay: [] };
      const dlsiteResult = dlsiteMedia.status === 'fulfilled' ? dlsiteMedia.value : { screenshots: [], artwork: [] };
      const itchResult = itchMedia.status === 'fulfilled' ? itchMedia.value : { screenshots: [], artwork: [] };

      // Combine results
      const screenshots = [
        ...(nutakuResult.screenshots || []),
        ...(dlsiteResult.screenshots || []),
        ...(itchResult.screenshots || [])
      ];

      const videos = [
        ...(nutakuResult.videos || [])
      ];

      const artwork = [
        ...(dlsiteResult.artwork || []),
        ...(itchResult.artwork || [])
      ];

      const gameplay = [
        ...(nutakuResult.gameplay || [])
      ];

      console.log(`Adult platforms total: ${screenshots.length} screenshots, ${videos.length} videos, ${artwork.length} artwork, ${gameplay.length} gameplay`);

      return {
        screenshots,
        videos,
        artwork,
        gameplay
      };

    } catch (error) {
      console.error('Error aggregating adult platform media:', error);
      return { screenshots: [], videos: [], artwork: [], gameplay: [] };
    }
  }
}

export default new AdultGameApiClient();
