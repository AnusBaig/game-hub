import igdbApiClient from './igdbApiClient';
import { safeLocalStorage } from '../utils/localStorage';

interface GameMapping {
  rawgId: number;
  igdbId: number;
  gameName: string;
  confidence: number;
  timestamp: number;
}

interface RAWGGame {
  id: number;
  name: string;
  name_original: string;
  released?: string;
  platforms?: Array<{ platform: { name: string } }>;
}

class GameMappingService {
  private mappingCache = new Map<number, GameMapping>();
  private cacheKey = 'game_mappings';
  private cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.loadCache();
  }

  // Load cached mappings from localStorage
  private loadCache(): void {
    try {
      const cached = safeLocalStorage.getItem(this.cacheKey);
      if (cached.success && cached.data && Array.isArray(cached.data)) {
        const mappings: GameMapping[] = cached.data;
        
        // Filter out expired mappings
        const validMappings = mappings.filter(
          mapping => Date.now() - mapping.timestamp < this.cacheExpiry
        );

        validMappings.forEach(mapping => {
          this.mappingCache.set(mapping.rawgId, mapping);
        });

        // Save cleaned cache
        this.saveCache();
      }
    } catch (error) {
      console.error('Error loading game mapping cache:', error);
    }
  }

  // Save cache to localStorage
  private saveCache(): void {
    try {
      const mappings = Array.from(this.mappingCache.values());
      safeLocalStorage.setItem(this.cacheKey, mappings);
    } catch (error) {
      console.error('Error saving game mapping cache:', error);
    }
  }

  // Get IGDB ID for a RAWG game
  async getIGDBId(rawgGame: RAWGGame): Promise<number | null> {
    // Check cache first
    const cached = this.mappingCache.get(rawgGame.id);
    if (cached && cached.confidence > 0.7) {
      return cached.igdbId;
    }

    // Search IGDB for matching game
    const igdbId = await this.searchIGDBGame(rawgGame);
    
    if (igdbId) {
      // Cache the mapping
      const mapping: GameMapping = {
        rawgId: rawgGame.id,
        igdbId,
        gameName: rawgGame.name,
        confidence: 0.8, // Default confidence for found matches
        timestamp: Date.now()
      };

      this.mappingCache.set(rawgGame.id, mapping);
      this.saveCache();
    }

    return igdbId;
  }

  // Search IGDB for a game and return best match ID
  private async searchIGDBGame(rawgGame: RAWGGame): Promise<number | null> {
    if (!igdbApiClient.isConfigured()) {
      return null;
    }

    try {
      // Try exact name match first
      let searchResults = await igdbApiClient.searchGames(rawgGame.name);
      
      // If no results, try original name
      if (searchResults.length === 0 && rawgGame.name_original !== rawgGame.name) {
        searchResults = await igdbApiClient.searchGames(rawgGame.name_original);
      }

      // If still no results, try simplified name (remove subtitles, special chars)
      if (searchResults.length === 0) {
        const simplifiedName = this.simplifyGameName(rawgGame.name);
        searchResults = await igdbApiClient.searchGames(simplifiedName);
      }

      if (searchResults.length === 0) {
        return null;
      }

      // Score and rank matches
      const scoredResults = searchResults.map(igdbGame => ({
        ...igdbGame,
        score: this.calculateMatchScore(rawgGame, igdbGame)
      }));

      // Sort by score and take the best match
      scoredResults.sort((a, b) => b.score - a.score);
      
      // Only return if confidence is reasonable (> 0.5)
      if (scoredResults[0].score > 0.5) {
        return scoredResults[0].id;
      }

      return null;

    } catch (error) {
      console.error('Error searching IGDB for game:', error);
      return null;
    }
  }

  // Calculate match confidence score between RAWG and IGDB games
  private calculateMatchScore(rawgGame: RAWGGame, igdbGame: any): number {
    let score = 0;

    // Name similarity (most important factor)
    const nameScore = this.calculateNameSimilarity(rawgGame.name, igdbGame.name);
    score += nameScore * 0.6;

    // Original name similarity
    if (rawgGame.name_original && rawgGame.name_original !== rawgGame.name) {
      const originalNameScore = this.calculateNameSimilarity(rawgGame.name_original, igdbGame.name);
      score += originalNameScore * 0.4;
    }

    // Release date proximity (if available)
    if (rawgGame.released && igdbGame.first_release_date) {
      const rawgYear = new Date(rawgGame.released).getFullYear();
      const igdbYear = new Date(igdbGame.first_release_date * 1000).getFullYear();
      const yearDiff = Math.abs(rawgYear - igdbYear);
      
      if (yearDiff === 0) score += 0.3;
      else if (yearDiff === 1) score += 0.2;
      else if (yearDiff <= 2) score += 0.1;
    }

    // Platform overlap (bonus if platforms match)
    if (rawgGame.platforms && igdbGame.platforms) {
      const rawgPlatforms = rawgGame.platforms.map(p => p.platform.name.toLowerCase());
      const platformOverlap = this.checkPlatformOverlap(rawgPlatforms, igdbGame.platforms);
      score += platformOverlap * 0.2;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  // Calculate string similarity using Levenshtein distance
  private calculateNameSimilarity(name1: string, name2: string): number {
    const str1 = name1.toLowerCase().trim();
    const str2 = name2.toLowerCase().trim();

    // Exact match
    if (str1 === str2) return 1.0;

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    return Math.max(0, 1 - (distance / maxLength));
  }

  // Levenshtein distance algorithm
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Simplify game name for better matching
  private simplifyGameName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[:\-–—]/g, ' ') // Replace colons and dashes with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(the|a|an)\b/g, '') // Remove articles
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
  }

  // Check platform overlap (simplified)
  private checkPlatformOverlap(rawgPlatforms: string[], igdbPlatforms: number[]): number {
    // This is simplified - in a real implementation, you'd map platform IDs
    // For now, just return a bonus if both have platforms
    return rawgPlatforms.length > 0 && igdbPlatforms.length > 0 ? 0.2 : 0;
  }

  // Get all cached mappings
  getCachedMappings(): GameMapping[] {
    return Array.from(this.mappingCache.values());
  }

  // Clear cache
  clearCache(): void {
    this.mappingCache.clear();
    safeLocalStorage.removeItem(this.cacheKey);
  }

  // Get cache statistics
  getCacheStats(): { total: number; fresh: number; expired: number } {
    const mappings = Array.from(this.mappingCache.values());
    const now = Date.now();
    
    return {
      total: mappings.length,
      fresh: mappings.filter(m => now - m.timestamp < this.cacheExpiry).length,
      expired: mappings.filter(m => now - m.timestamp >= this.cacheExpiry).length
    };
  }
}

export default new GameMappingService();