interface SteamApp {
  appid: number;
  name: string;
}

interface SteamAppList {
  applist: {
    apps: SteamApp[];
  };
}

interface SteamAppDetails {
  [key: string]: {
    success: boolean;
    data?: {
      type: string;
      name: string;
      steam_appid: number;
      required_age: number;
      is_free: boolean;
      detailed_description: string;
      about_the_game: string;
      short_description: string;
      supported_languages: string;
      header_image: string;
      website: string;
      pc_requirements: {
        minimum?: string;
        recommended?: string;
      };
      developers: string[];
      publishers: string[];
      price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
        initial_formatted: string;
        final_formatted: string;
      };
      packages: number[];
      package_groups: any[];
      platforms: {
        windows: boolean;
        mac: boolean;
        linux: boolean;
      };
      metacritic?: {
        score: number;
        url: string;
      };
      categories: Array<{
        id: number;
        description: string;
      }>;
      genres: Array<{
        id: string;
        description: string;
      }>;
      screenshots: Array<{
        id: number;
        path_thumbnail: string;
        path_full: string;
      }>;
      movies?: Array<{
        id: number;
        name: string;
        thumbnail: string;
        webm: {
          480: string;
          max: string;
        };
        mp4: {
          480: string;
          max: string;
        };
        highlight: boolean;
      }>;
      release_date: {
        coming_soon: boolean;
        date: string;
      };
      support_info: {
        url: string;
        email: string;
      };
      background: string;
      content_descriptors: {
        ids: number[];
        notes: string;
      };
    };
  };
}

interface SteamReviews {
  success: number;
  query_summary: {
    num_reviews: number;
    review_score: number;
    review_score_desc: string;
    total_positive: number;
    total_negative: number;
    total_reviews: number;
  };
  reviews: Array<{
    recommendationid: string;
    author: {
      steamid: string;
      num_games_owned: number;
      num_reviews: number;
      playtime_forever: number;
      playtime_last_two_weeks: number;
      playtime_at_review: number;
      last_played: number;
    };
    language: string;
    review: string;
    timestamp_created: number;
    timestamp_updated: number;
    voted_up: boolean;
    votes_up: number;
    votes_funny: number;
    weighted_vote_score: string;
    comment_count: number;
    steam_purchase: boolean;
    received_for_free: boolean;
    written_during_early_access: boolean;
  }>;
}

class SteamApiClient {
  private proxyBaseUrl = 'http://localhost:3501/api/steam';
  private isAvailableCache: boolean | null = null;
  
  // Get list of all Steam apps
  async getAllApps(): Promise<SteamApp[]> {
    try {
      const url = `${this.proxyBaseUrl}/apps`;
      console.log('🎮 Steam API Client: Fetching apps from', url);
      
      const response = await fetch(url);
      
      console.log('🎮 Steam API Client: Response status:', response.status, response.statusText);
      console.log('🎮 Steam API Client: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎮 Steam API Client: Error response body:', errorText.substring(0, 200));
        throw new Error(`Steam API error: ${response.statusText}`);
      }
      
      const data: SteamAppList = await response.json();
      console.log('🎮 Steam API Client: Successfully fetched', data.applist.apps.length, 'apps');
      return data.applist.apps;
    } catch (error) {
      console.error('🎮 Steam API Client: Error fetching Steam apps:', error);
      return [];
    }
  }

  // Get detailed information about a specific app
  async getAppDetails(appId: number, country: string = 'US'): Promise<SteamAppDetails['0']['data'] | null> {
    try {
      const url = `${this.proxyBaseUrl}/app/${appId}?cc=${country}&l=en`;
      console.log(`🎮 Steam API Client: Fetching app details for ${appId} from`, url);
      
      const response = await fetch(url);
      
      console.log(`🎮 Steam API Client: App ${appId} response status:`, response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🎮 Steam API Client: Error response for app ${appId}:`, errorText.substring(0, 200));
        throw new Error(`Steam API error: ${response.statusText}`);
      }
      
      const data: SteamAppDetails = await response.json();
      const appData = data[appId.toString()];
      
      if (appData && appData.success && appData.data) {
        console.log(`🎮 Steam API Client: Successfully fetched details for app ${appId}:`, appData.data.name);
        return appData.data;
      }
      
      console.log(`🎮 Steam API Client: No valid data for app ${appId}`);
      return null;
    } catch (error) {
      console.error(`🎮 Steam API Client: Error fetching Steam app details for ${appId}:`, error);
      return null;
    }
  }

  // Get app reviews
  async getAppReviews(appId: number, count: number = 20): Promise<SteamReviews | null> {
    try {
      const response = await fetch(
        `https://store.steampowered.com/api/appreviews/${appId}?json=1&num_per_page=${count}&review_type=all&purchase_type=all`
      );
      
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.statusText}`);
      }
      
      const data: SteamReviews = await response.json();
      return data.success === 1 ? data : null;
    } catch (error) {
      console.error(`Error fetching Steam reviews for ${appId}:`, error);
      return null;
    }
  }

  // Search apps by name
  async searchApps(searchTerm: string, limit: number = 50): Promise<SteamApp[]> {
    try {
      const allApps = await this.getAllApps();
      const searchLower = searchTerm.toLowerCase();
      
      return allApps
        .filter(app => app.name.toLowerCase().includes(searchLower))
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching Steam apps:', error);
      return [];
    }
  }

  // Get popular/featured games (using Steam's featured API)
  async getFeaturedGames(): Promise<any> {
    try {
      const response = await fetch(`${this.proxyBaseUrl}/featured`);
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured Steam games:', error);
      return null;
    }
  }

  // Convert Steam app to our Game interface format
  convertSteamAppToGame(steamApp: SteamAppDetails['0']['data']): any {
    if (!steamApp) return null;

    return {
      id: steamApp.steam_appid,
      slug: steamApp.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: steamApp.name,
      released: steamApp.release_date.date,
      tba: steamApp.release_date.coming_soon,
      background_image: steamApp.header_image,
      rating: 0, // Will be filled from reviews
      rating_top: 5,
      ratings_count: 0, // Will be filled from reviews
      reviews_text_count: '0',
      added: 0,
      metacritic: steamApp.metacritic?.score || 0,
      playtime: 0,
      suggestions_count: 0,
      updated: new Date().toISOString(),
      esrb_rating: {
        id: steamApp.required_age >= 18 ? 6 : steamApp.required_age >= 13 ? 4 : 1,
        name: steamApp.required_age >= 18 ? 'Adults Only' : steamApp.required_age >= 13 ? 'Teen' : 'Everyone',
        slug: steamApp.required_age >= 18 ? 'adults-only' : steamApp.required_age >= 13 ? 'teen' : 'everyone'
      },
      platforms: Object.entries(steamApp.platforms)
        .filter(([, supported]) => supported)
        .map(([platform]) => ({
          platform: {
            id: platform === 'windows' ? 4 : platform === 'mac' ? 5 : 6,
            name: platform === 'windows' ? 'PC' : platform === 'mac' ? 'macOS' : 'Linux',
            slug: platform
          }
        })),
      parent_platforms: [],
      genres: steamApp.genres.map(genre => ({
        id: parseInt(genre.id),
        name: genre.description,
        slug: genre.description.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        games_count: 0,
        image_background: ''
      })),
      publishers: steamApp.publishers.map(publisher => ({
        id: 0,
        name: publisher,
        slug: publisher.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        games_count: 0,
        image_background: ''
      })),
      // Steam-specific fields
      steam_appid: steamApp.steam_appid,
      short_description: steamApp.short_description,
      detailed_description: steamApp.detailed_description,
      is_free: steamApp.is_free,
      price_overview: steamApp.price_overview,
      screenshots: steamApp.screenshots,
      movies: steamApp.movies,
      source: 'steam'
    };
  }

  // Check if Steam API is available
  async isAvailable(): Promise<boolean> {
    if (this.isAvailableCache !== null) {
      return this.isAvailableCache;
    }
    
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        this.isAvailableCache = data.apis?.steam || false;
        return this.isAvailableCache || false;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export default new SteamApiClient();