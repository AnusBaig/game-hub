interface EpicGame {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  genres: string[];
  platforms: string[];
  price: {
    original: number;
    current: number;
    discount: number;
  };
  images: {
    thumbnail: string;
    hero: string;
    screenshots: string[];
  };
  isFree: boolean;
  tags: string[];
  rating?: {
    esrb?: string;
    pegi?: string;
  };
}

interface EpicFreeGame {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  originalPrice: number;
  discountPercentage: number;
  images: {
    thumbnail: string;
    hero: string;
  };
}

class EpicGamesApiClient {
  private graphqlEndpoint = 'https://graphql.epicgames.com/graphql';
  private storeEndpoint = 'https://store-api.epicgames.com/en-US/api/v1';

  // Get current free games
  async getFreeGames(): Promise<EpicFreeGame[]> {
    try {
      // Note: Epic Games Store doesn't have a public API
      // This would require web scraping or unofficial APIs
      console.log('Epic Games Store API not available - using mock data');
      
      return this.getMockFreeGames();
    } catch (error) {
      console.error('Error fetching Epic free games:', error);
      return [];
    }
  }

  // Search for games
  async searchGames(query: string, limit: number = 20): Promise<EpicGame[]> {
    try {
      console.log('Epic Games Store search not available - using mock data');
      return this.getMockSearchResults(query, limit);
    } catch (error) {
      console.error('Error searching Epic games:', error);
      return [];
    }
  }

  // Get game details
  async getGameDetails(gameId: string): Promise<EpicGame | null> {
    try {
      console.log('Epic Games Store game details not available - using mock data');
      return null;
    } catch (error) {
      console.error('Error fetching Epic game details:', error);
      return null;
    }
  }

  // Mock data for free games
  private getMockFreeGames(): EpicFreeGame[] {
    return [
      {
        id: 'epic-free-1',
        title: 'Sample Free Game',
        description: 'A great free game this week',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        originalPrice: 29.99,
        discountPercentage: 100,
        images: {
          thumbnail: 'https://via.placeholder.com/300x400?text=Epic+Free+Game',
          hero: 'https://via.placeholder.com/1920x1080?text=Epic+Free+Game'
        }
      }
    ];
  }

  // Mock search results
  private getMockSearchResults(query: string, limit: number): EpicGame[] {
    const mockGame: EpicGame = {
      id: `epic-${query.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${query} - Epic Edition`,
      description: 'Mock Epic Games Store result',
      developer: 'Epic Developer',
      publisher: 'Epic Games',
      releaseDate: '2024-01-01',
      genres: ['Action', 'Adventure'],
      platforms: ['PC'],
      price: {
        original: 59.99,
        current: 29.99,
        discount: 50
      },
      images: {
        thumbnail: 'https://via.placeholder.com/300x400?text=Epic+Game',
        hero: 'https://via.placeholder.com/1920x1080?text=Epic+Game',
        screenshots: []
      },
      isFree: false,
      tags: ['epic-exclusive'],
      rating: {
        esrb: 'T'
      }
    };

    return Array(Math.min(limit, 3)).fill(null).map((_, index) => ({
      ...mockGame,
      id: `${mockGame.id}-${index}`,
      title: `${mockGame.title} ${index + 1}`
    }));
  }

  // Convert Epic game to our Game interface
  convertToGame(epicGame: EpicGame): any {
    return {
      id: this.hashString(epicGame.id), // Convert string ID to number
      slug: epicGame.id,
      name: epicGame.title,
      released: epicGame.releaseDate,
      tba: false,
      background_image: epicGame.images.hero || epicGame.images.thumbnail,
      rating: 0, // Epic doesn't provide user ratings
      rating_top: 5,
      ratings_count: 0,
      reviews_text_count: '0',
      added: 0,
      metacritic: 0,
      playtime: 0,
      suggestions_count: 0,
      updated: new Date().toISOString(),
      esrb_rating: {
        id: this.convertEsrbRating(epicGame.rating?.esrb || 'E'),
        name: epicGame.rating?.esrb || 'Everyone',
        slug: (epicGame.rating?.esrb || 'e').toLowerCase()
      },
      platforms: epicGame.platforms.map(platform => ({
        platform: {
          id: this.getPlatformId(platform),
          name: platform,
          slug: platform.toLowerCase()
        }
      })),
      parent_platforms: [],
      genres: epicGame.genres.map((genre, index) => ({
        id: index + 100, // Offset to avoid conflicts
        name: genre,
        slug: genre.toLowerCase().replace(/\s+/g, '-'),
        games_count: 0,
        image_background: ''
      })),
      publishers: [{
        id: 0,
        name: epicGame.publisher,
        slug: epicGame.publisher.toLowerCase().replace(/\s+/g, '-'),
        games_count: 0,
        image_background: ''
      }],
      // Epic-specific fields
      epic_id: epicGame.id,
      is_free: epicGame.isFree,
      price: epicGame.price,
      source: 'epic'
    };
  }

  // Hash string to number for ID conversion
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private convertEsrbRating(rating: string): number {
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
      case 'pc': case 'windows': return 4;
      case 'mac': case 'macos': return 5;
      case 'linux': return 6;
      default: return 4;
    }
  }

  // Check if Epic integration is available
  isAvailable(): boolean {
    // Epic Games Store doesn't have a public API
    // This would be true if we had access to their internal API or web scraping
    return false;
  }
}

export default new EpicGamesApiClient();