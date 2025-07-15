import Game from '../models/game';
import steamApiClient from './steamApiClient';
import metacriticApiClient from './metacriticApiClient';
import epicGamesApiClient from './epicGamesApiClient';
import ApiClient from './apiClient';
import { Endpoints } from '../constants/endpoints';

interface GameSource {
  name: string;
  priority: number;
  enabled: boolean;
}

interface AggregatedGameData {
  games: Game[];
  sources: string[];
  totalCount: number;
  hasMore: boolean;
}

class GameAggregatorService {
  private sources: GameSource[] = [
    { name: 'rawg', priority: 1, enabled: true }, // Always try RAWG as primary source
    { name: 'steam', priority: 2, enabled: true }, // Steam works without API key
    { name: 'epic', priority: 3, enabled: false }, // Disabled by default (no public API)
    { name: 'metacritic', priority: 4, enabled: false }, // Disabled by default (limited API)
    { name: 'igdb', priority: 5, enabled: false }, // Disabled by default
  ];

  private rawgClient = new ApiClient<{ results: Game[] }>(Endpoints.FETCH_ALL_GAMES);

  // Get games from multiple sources with pagination
  async getAggregatedGames(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    genre?: string;
    platform?: string;
    ordering?: string;
  } = {}): Promise<AggregatedGameData> {
    const { page = 1, pageSize = 20, search, genre, platform, ordering } = params;
    const allGames: Game[] = [];
    const usedSources: string[] = [];

    console.log(`🎮 GameAggregator: Fetching games with params:`, { page, pageSize, search, genre, platform, ordering });
    console.log(`🎮 GameAggregator: Available sources:`, this.sources.filter(s => s.enabled).map(s => s.name));

    try {
      // RAWG API (primary source)
      if (this.isSourceEnabled('rawg')) {
        console.log(`🎮 GameAggregator: Fetching from RAWG...`);
        try {
          const rawgGames = await this.getRawgGames({
            page,
            page_size: Math.ceil(pageSize * 0.7), // 70% from RAWG
            search,
            genres: genre,
            platforms: platform,
            ordering,
          });
          
          console.log(`🎮 GameAggregator: RAWG returned ${rawgGames.length} games`);
          if (rawgGames.length > 0) {
            allGames.push(...rawgGames);
            usedSources.push('rawg');
          }
        } catch (error) {
          console.warn(`🎮 GameAggregator: RAWG failed:`, error instanceof Error ? error.message : 'Unknown error');
        }
      } else {
        console.log(`🎮 GameAggregator: RAWG source disabled`);
      }

      // Steam API (secondary source)
      if (this.isSourceEnabled('steam') && allGames.length < pageSize) {
        console.log(`🎮 GameAggregator: Fetching from Steam... (need ${pageSize - allGames.length} more games)`);
        try {
          const steamGames = await this.getSteamGames({
            count: pageSize - allGames.length,
            search,
          });
          
          console.log(`🎮 GameAggregator: Steam returned ${steamGames.length} raw games`);
          if (steamGames.length > 0) {
            // Convert Steam games to our Game interface
            const convertedSteamGames = steamGames.map(game => 
              steamApiClient.convertSteamAppToGame(game)
            ).filter(game => game !== null);
            
            console.log(`🎮 GameAggregator: Steam converted ${convertedSteamGames.length} games successfully`);
            allGames.push(...convertedSteamGames);
            usedSources.push('steam');
          }
        } catch (error) {
          console.warn('🎮 GameAggregator: Steam API unavailable, continuing with other sources:', error instanceof Error ? error.message : 'Unknown error');
          // Continue without Steam data - graceful degradation
        }
      } else if (!this.isSourceEnabled('steam')) {
        console.log(`🎮 GameAggregator: Steam source disabled`);
      } else {
        console.log(`🎮 GameAggregator: Steam skipped - already have enough games (${allGames.length}/${pageSize})`);
      }

      // Remove duplicates based on name similarity
      const uniqueGames = this.removeDuplicateGames(allGames);

      // Sort by relevance/rating
      const sortedGames = this.sortGamesByRelevance(uniqueGames, ordering);

      const result = {
        games: sortedGames.slice(0, pageSize),
        sources: usedSources,
        totalCount: sortedGames.length,
        hasMore: sortedGames.length > pageSize
      };

      console.log(`🎮 GameAggregator: Final result - ${result.games.length} games from sources: [${usedSources.join(', ')}]`);
      
      return result;

    } catch (error) {
      console.error('Error aggregating games:', error);
      return {
        games: [],
        sources: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  // Get games from RAWG API
  private async getRawgGames(params: any): Promise<Game[]> {
    try {
      const response = await this.rawgClient.get(params);
      return response.results || [];
    } catch (error) {
      console.error('Error fetching RAWG games:', error);
      return [];
    }
  }

  // Get games from Steam API
  private async getSteamGames(params: { count: number; search?: string }): Promise<any[]> {
    try {
      console.log(`🎮 Steam: Getting games with params:`, params);
      
      if (params.search) {
        console.log(`🎮 Steam: Searching for "${params.search}"`);
        // Search for specific games
        const searchResults = await steamApiClient.searchApps(params.search, params.count);
        console.log(`🎮 Steam: Search returned ${searchResults.length} results`);
        const gameDetails = [];
        
        // Get detailed information for search results
        for (const app of searchResults.slice(0, Math.min(5, params.count))) {
          console.log(`🎮 Steam: Getting details for app ${app.appid} (${app.name})`);
          const details = await steamApiClient.getAppDetails(app.appid);
          if (details) {
            gameDetails.push(details);
          }
        }
        
        console.log(`🎮 Steam: Retrieved ${gameDetails.length} detailed games from search`);
        return gameDetails;
      } else {
        console.log(`🎮 Steam: Getting featured games`);
        // Get featured/popular games
        const featured = await steamApiClient.getFeaturedGames();
        if (featured && featured.featured_win) {
          console.log(`🎮 Steam: Featured games response has ${featured.featured_win.length} games`);
          const gameDetails = [];
          
          for (const game of featured.featured_win.slice(0, params.count)) {
            console.log(`🎮 Steam: Getting details for featured app ${game.id}`);
            const details = await steamApiClient.getAppDetails(game.id);
            if (details) {
              gameDetails.push(details);
            }
          }
          
          console.log(`🎮 Steam: Retrieved ${gameDetails.length} detailed featured games`);
          return gameDetails;
        } else {
          console.log(`🎮 Steam: No featured games data available`);
        }
      }
      
      return [];
    } catch (error) {
      console.error('🎮 Steam: Error fetching Steam games:', error);
      return [];
    }
  }

  // Remove duplicate games based on name similarity
  private removeDuplicateGames(games: Game[]): Game[] {
    const uniqueGames: Game[] = [];
    const seenNames = new Set<string>();

    for (const game of games) {
      const normalizedName = this.normalizeGameName(game.name);
      
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueGames.push(game);
      }
    }

    return uniqueGames;
  }

  // Normalize game names for duplicate detection
  private normalizeGameName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  // Sort games by relevance
  private sortGamesByRelevance(games: Game[], ordering?: string): Game[] {
    return games.sort((a, b) => {
      switch (ordering) {
        case 'name':
          return a.name.localeCompare(b.name);
        case '-name':
          return b.name.localeCompare(a.name);
        case 'released':
          return new Date(a.released).getTime() - new Date(b.released).getTime();
        case '-released':
          return new Date(b.released).getTime() - new Date(a.released).getTime();
        case 'rating':
          return a.rating - b.rating;
        case '-rating':
        default:
          // Default: sort by rating (high to low), then by metacritic score
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return (b.metacritic || 0) - (a.metacritic || 0);
      }
    });
  }

  // Check if a source is enabled
  private isSourceEnabled(sourceName: string): boolean {
    const source = this.sources.find(s => s.name === sourceName);
    return source ? source.enabled : false;
  }

  // Enable/disable sources
  setSourceEnabled(sourceName: string, enabled: boolean): void {
    const source = this.sources.find(s => s.name === sourceName);
    if (source) {
      source.enabled = enabled;
    }
  }

  // Get source status
  getSourceStatus(): GameSource[] {
    return [...this.sources];
  }

  // Search across all sources
  async searchGames(query: string, limit: number = 20): Promise<AggregatedGameData> {
    return this.getAggregatedGames({
      search: query,
      pageSize: limit,
    });
  }

  // Get game details from the best available source
  async getGameDetails(gameId: number, preferredSource?: string): Promise<Game | null> {
    const errors: string[] = [];

    try {
      // Try RAWG first (most comprehensive)
      if (!preferredSource || preferredSource === 'rawg') {
        try {
          const rawgClient = new ApiClient<Game>(Endpoints.FETCH_GAME_DETAIL.replace(':id', gameId.toString()));
          const game = await rawgClient.get();
          if (game) {
            return { ...game, source: 'rawg' };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`RAWG: ${errorMessage}`);
          console.warn('RAWG API failed for game details, trying other sources:', errorMessage);
        }
      }

      // Try Steam if it's a Steam ID or no RAWG result
      if (preferredSource === 'steam' || !preferredSource) {
        try {
          const steamDetails = await steamApiClient.getAppDetails(gameId);
          if (steamDetails) {
            return steamApiClient.convertSteamAppToGame(steamDetails);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Steam: ${errorMessage}`);
          console.warn('Steam API failed for game details:', errorMessage);
        }
      }

      // Log all errors if no source worked
      if (errors.length > 0) {
        console.warn(`All sources failed for game ${gameId}:`, errors);
      }

      return null;
    } catch (error) {
      console.error('Unexpected error fetching game details:', error);
      return null;
    }
  }

  // Get trending/popular games from all sources
  async getTrendingGames(limit: number = 20): Promise<AggregatedGameData> {
    return this.getAggregatedGames({
      pageSize: limit,
      ordering: '-rating',
    });
  }

  // Get recently released games
  async getRecentGames(limit: number = 20): Promise<AggregatedGameData> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return this.getAggregatedGames({
      pageSize: limit,
      ordering: '-released',
    });
  }

  // Get free games (primarily from Steam)
  async getFreeGames(limit: number = 20): Promise<AggregatedGameData> {
    try {
      const freeGames: Game[] = [];
      
      // Get free games from Steam
      if (this.isSourceEnabled('steam')) {
        const featured = await steamApiClient.getFeaturedGames();
        if (featured && featured.free_games) {
          for (const freeGame of featured.free_games.slice(0, limit)) {
            const details = await steamApiClient.getAppDetails(freeGame.id);
            if (details && details.is_free) {
              const convertedGame = steamApiClient.convertSteamAppToGame(details);
              if (convertedGame) {
                freeGames.push(convertedGame);
              }
            }
          }
        }
      }

      return {
        games: freeGames,
        sources: ['steam'],
        totalCount: freeGames.length,
        hasMore: false
      };
    } catch (error) {
      console.error('Error fetching free games:', error);
      return {
        games: [],
        sources: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }
}

export default new GameAggregatorService();