interface MetacriticGame {
  id: number;
  title: string;
  slug: string;
  summary: string;
  platform: string;
  score?: number;
  userScore?: number;
  releaseDate: string;
  genre: string;
  publisher: string;
  developer: string;
  rating: string;
  imageUrl?: string;
  url: string;
}

interface MetacriticSearchResult {
  results: MetacriticGame[];
  totalResults: number;
  page: number;
  totalPages: number;
}

class MetacriticApiClient {
  private baseUrl = 'https://www.metacritic.com/api';
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_METACRITIC_API_KEY || '';
  }

  // Search for games
  async searchGames(query: string, platform?: string, page: number = 1): Promise<MetacriticSearchResult> {
    if (!this.apiKey) {
      console.log('Metacritic API key not configured');
      return {
        results: [],
        totalResults: 0,
        page: 1,
        totalPages: 0
      };
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        query,
        page: page.toString(),
        limit: '20'
      });

      if (platform) {
        params.set('platform', platform);
      }

      // Note: This is a placeholder for the actual Metacritic API
      // Since Metacritic doesn't have a public API, this would need to be
      // implemented with web scraping or a third-party service
      console.log('Metacritic API not available - using mock data');
      
      return this.getMockData(query);
    } catch (error) {
      console.error('Error searching Metacritic games:', error);
      return {
        results: [],
        totalResults: 0,
        page: 1,
        totalPages: 0
      };
    }
  }

  // Get game details by ID
  async getGameDetails(gameId: number): Promise<MetacriticGame | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      // Placeholder implementation
      console.log('Metacritic game details not available - using mock data');
      return null;
    } catch (error) {
      console.error('Error fetching Metacritic game details:', error);
      return null;
    }
  }

  // Get top games by platform
  async getTopGames(platform: string = 'pc', limit: number = 20): Promise<MetacriticGame[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      // Placeholder implementation
      console.log('Metacritic top games not available - using mock data');
      return [];
    } catch (error) {
      console.error('Error fetching top Metacritic games:', error);
      return [];
    }
  }

  // Mock data for development purposes
  private getMockData(query: string): MetacriticSearchResult {
    const mockGames: MetacriticGame[] = [
      {
        id: 1,
        title: `${query} - Sample Game`,
        slug: `${query.toLowerCase().replace(/\s+/g, '-')}-sample`,
        summary: 'This is a mock game for development purposes',
        platform: 'PC',
        score: 85,
        userScore: 8.2,
        releaseDate: '2024-01-15',
        genre: 'Action',
        publisher: 'Sample Publisher',
        developer: 'Sample Developer',
        rating: 'T',
        url: `https://www.metacritic.com/game/${query.toLowerCase()}`
      }
    ];

    return {
      results: mockGames,
      totalResults: 1,
      page: 1,
      totalPages: 1
    };
  }

  // Check if API is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Convert Metacritic game to our Game interface
  convertToGame(metacriticGame: MetacriticGame): any {
    return {
      id: metacriticGame.id + 1000000, // Offset to avoid conflicts
      slug: metacriticGame.slug,
      name: metacriticGame.title,
      released: metacriticGame.releaseDate,
      tba: false,
      background_image: metacriticGame.imageUrl || '',
      rating: (metacriticGame.userScore || 0) / 2, // Convert 0-10 to 0-5
      rating_top: 5,
      ratings_count: 0,
      reviews_text_count: '0',
      added: 0,
      metacritic: metacriticGame.score || 0,
      playtime: 0,
      suggestions_count: 0,
      updated: new Date().toISOString(),
      esrb_rating: {
        id: this.convertRating(metacriticGame.rating),
        name: metacriticGame.rating,
        slug: metacriticGame.rating.toLowerCase()
      },
      platforms: [{
        platform: {
          id: this.getPlatformId(metacriticGame.platform),
          name: metacriticGame.platform,
          slug: metacriticGame.platform.toLowerCase()
        }
      }],
      parent_platforms: [],
      genres: [{
        id: 0,
        name: metacriticGame.genre,
        slug: metacriticGame.genre.toLowerCase(),
        games_count: 0,
        image_background: ''
      }],
      publishers: [{
        id: 0,
        name: metacriticGame.publisher,
        slug: metacriticGame.publisher.toLowerCase(),
        games_count: 0,
        image_background: ''
      }],
      source: 'metacritic'
    };
  }

  private convertRating(rating: string): number {
    switch (rating.toUpperCase()) {
      case 'E': return 1;
      case 'E10+': return 2;
      case 'T': return 3;
      case 'M': return 4;
      case 'AO': return 5;
      default: return 1;
    }
  }

  private getPlatformId(platform: string): number {
    switch (platform.toLowerCase()) {
      case 'pc': return 4;
      case 'playstation': case 'ps5': return 187;
      case 'xbox': case 'xbox series x': return 186;
      case 'nintendo switch': return 7;
      default: return 4;
    }
  }
}

export default new MetacriticApiClient();