interface IGDBAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  first_release_date?: number;
  platforms?: number[];
  screenshots?: number[];
  videos?: number[];
  artworks?: number[];
  cover?: number;
}

interface IGDBScreenshot {
  id: number;
  game: number;
  url: string;
  width: number;
  height: number;
  image_id: string;
}

interface IGDBVideo {
  id: number;
  game: number;
  name: string;
  video_id: string;
  checksum: string;
}

interface IGDBArtwork {
  id: number;
  game: number;
  url: string;
  width: number;
  height: number;
  image_id: string;
}

class IGDBApiClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private proxyBaseUrl = '/api/igdb';
  private isConfiguredCache: boolean | null = null;

  // Authenticate with Twitch OAuth to get IGDB access token via proxy
  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!(await this.isConfigured())) {
      throw new Error('IGDB credentials not configured');
    }

    try {
      const response = await fetch(`${this.proxyBaseUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.configured === false) {
          throw new Error('IGDB credentials not configured on server');
        }
        throw new Error(`IGDB authentication failed: ${response.statusText}`);
      }

      const data: IGDBAuthResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

      return this.accessToken;

    } catch (error) {
      console.error('IGDB authentication error:', error);
      throw error;
    }
  }

  // Make authenticated request to IGDB API
  private async makeRequest<T>(endpoint: string, body: string): Promise<T[]> {
    const token = await this.authenticate();

    try {
      const response = await fetch(`${this.proxyBaseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`IGDB API error: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error(`IGDB ${endpoint} request error:`, error);
      throw error;
    }
  }

  // Search for games by name to get IGDB ID
  async searchGames(gameName: string, limit: number = 5): Promise<IGDBGame[]> {
    const query = `
      fields id, name, slug, first_release_date, platforms, screenshots, videos, artworks, cover;
      search "${gameName}";
      limit ${limit};
    `;

    try {
      return await this.makeRequest<IGDBGame>('games', query);
    } catch (error) {
      console.error('Error searching IGDB games:', error);
      return [];
    }
  }

  // Get game by specific IGDB ID
  async getGame(igdbId: number): Promise<IGDBGame | null> {
    const query = `
      fields id, name, slug, first_release_date, platforms, screenshots, videos, artworks, cover;
      where id = ${igdbId};
      limit 1;
    `;

    try {
      const games = await this.makeRequest<IGDBGame>('games', query);
      return games.length > 0 ? games[0] : null;
    } catch (error) {
      console.error('Error fetching IGDB game:', error);
      return null;
    }
  }

  // Get screenshots for a game
  async getGameScreenshots(igdbGameId: number): Promise<IGDBScreenshot[]> {
    const query = `
      fields id, game, url, width, height, image_id;
      where game = ${igdbGameId};
      limit 20;
    `;

    try {
      return await this.makeRequest<IGDBScreenshot>('screenshots', query);
    } catch (error) {
      console.error('Error fetching IGDB screenshots:', error);
      return [];
    }
  }

  // Get videos for a game
  async getGameVideos(igdbGameId: number): Promise<IGDBVideo[]> {
    const query = `
      fields id, game, name, video_id, checksum;
      where game = ${igdbGameId};
      limit 10;
    `;

    try {
      return await this.makeRequest<IGDBVideo>('game_videos', query);
    } catch (error) {
      console.error('Error fetching IGDB videos:', error);
      return [];
    }
  }

  // Get artwork for a game
  async getGameArtwork(igdbGameId: number): Promise<IGDBArtwork[]> {
    const query = `
      fields id, game, url, width, height, image_id;
      where game = ${igdbGameId};
      limit 15;
    `;

    try {
      return await this.makeRequest<IGDBArtwork>('artworks', query);
    } catch (error) {
      console.error('Error fetching IGDB artwork:', error);
      return [];
    }
  }

  // Helper function to construct full image URLs
  getImageUrl(imageId: string, size: 'thumb' | 'cover_small' | 'screenshot_med' | 'screenshot_big' | 'cover_big' | '1080p' = 'screenshot_big'): string {
    return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
  }

  // Helper function to get YouTube video URL from video_id
  getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Helper function to get YouTube video thumbnail
  getVideoThumbnail(videoId: string, quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  }

  // Check if IGDB is properly configured
  async isConfigured(): Promise<boolean> {
    if (this.isConfiguredCache !== null) {
      return this.isConfiguredCache;
    }
    
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        this.isConfiguredCache = data.apis?.igdb || false;
        return this.isConfiguredCache || false;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export default new IGDBApiClient();