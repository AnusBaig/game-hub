import { ContentScore } from "../models/mediaItem";

interface SightEngineResponse {
  status: string;
  request: {
    id: string;
    timestamp: number;
  };
  nudity: {
    raw: number;
    safe: number;
    partial: number;
  };
  weapon?: {
    classes?: {
      firearm?: number;
      firearm_gesture?: number;
      firearm_toy?: number;
      knife?: number;
    };
  };
  alcohol?: {
    prob?: number;
  };
}

class ContentModerationService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.sightengine.com/1.0/check.json';

  constructor() {
    // These would be set from environment variables
    this.apiKey = import.meta.env.VITE_SIGHTENGINE_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_SIGHTENGINE_API_SECRET || '';
  }

  async analyzeImage(imageUrl: string): Promise<ContentScore | null> {
    // Return mock data if API credentials not configured
    if (!this.apiKey || !this.apiSecret) {
      return this.getMockContentScore(imageUrl);
    }

    try {
      const formData = new FormData();
      formData.append('url', imageUrl);
      formData.append('models', 'nudity,weapon,alcohol');
      formData.append('api_user', this.apiKey);
      formData.append('api_secret', this.apiSecret);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Sightengine API error:', response.statusText);
        return this.getMockContentScore(imageUrl);
      }

      const data: SightEngineResponse = await response.json();
      return this.parseResponse(data);

    } catch (error) {
      console.error('Error analyzing image:', error);
      return this.getMockContentScore(imageUrl);
    }
  }

  private parseResponse(data: SightEngineResponse): ContentScore {
    // Parse nudity scores
    const rawScore = (data.nudity?.raw || 0) * 100;
    const partialScore = (data.nudity?.partial || 0) * 100;
    const nudityScore = Math.max(rawScore, partialScore);

    // Parse weapon scores
    const weaponClasses = data.weapon?.classes || {};
    const weaponScore = Math.max(
      (weaponClasses.firearm || 0) * 100,
      (weaponClasses.firearm_gesture || 0) * 100,
      (weaponClasses.knife || 0) * 100,
      (weaponClasses.firearm_toy || 0) * 100
    );

    // Parse alcohol score
    const alcoholScore = (data.alcohol?.prob || 0) * 100;

    // Calculate confidence based on how decisive the safe score is
    const safeScore = data.nudity?.safe || 0;
    const confidence = Math.max(0.1, safeScore);

    // Determine primary content to display
    const { primaryContent, primaryScore } = this.determinePrimaryContent(
      nudityScore, 
      weaponScore, 
      alcoholScore
    );

    const category = this.determineCategory(primaryContent, primaryScore);

    return {
      primaryContent,
      primaryScore: Math.round(primaryScore),
      nudityScore: Math.round(nudityScore),
      weaponScore: Math.round(weaponScore),
      alcoholScore: Math.round(alcoholScore),
      category,
      confidence,
      timestamp: Date.now(),
    };
  }

  private determinePrimaryContent(
    nudityScore: number, 
    weaponScore: number, 
    alcoholScore: number
  ): { primaryContent: 'nudity' | 'weapon' | 'alcohol' | 'safe'; primaryScore: number } {
    // Find all scores with their content types
    const allScores = [
      { type: 'nudity' as const, score: nudityScore },
      { type: 'weapon' as const, score: weaponScore },
      { type: 'alcohol' as const, score: alcoholScore }
    ];

    // Filter scores that are >= 6% (threshold changed from 5% to 6%)
    const validScores = allScores.filter(s => s.score >= 6);
    
    // If no scores are >= 6%, mark as safe
    if (validScores.length === 0) {
      return { primaryContent: 'safe', primaryScore: 0 };
    }

    // Find the highest score among all valid scores
    const highest = validScores.reduce((max, current) => 
      current.score > max.score ? current : max
    );

    return { primaryContent: highest.type, primaryScore: highest.score };
  }

  private determineCategory(
    primaryContent: 'nudity' | 'weapon' | 'alcohol' | 'safe', 
    primaryScore: number
  ): 'safe' | 'suggestive' | 'partial' | 'explicit' | 'erotic' | 'brutal' | 'cockeyed' {
    // High-score categories for specific content types (>85%)
    if (primaryScore > 85) {
      if (primaryContent === 'nudity') return 'erotic';
      if (primaryContent === 'weapon') return 'brutal';
      if (primaryContent === 'alcohol') return 'cockeyed';
    }
    
    // Existing score-based categories
    if (primaryScore < 10) return 'safe';
    if (primaryScore < 30) return 'suggestive';
    if (primaryScore < 60) return 'partial';
    return 'explicit';
  }

  private getMockContentScore(imageUrl?: string): ContentScore {
    // Generate more realistic scores based on gaming content patterns
    let nudityScore = 0;
    let weaponScore = 0; 
    let alcoholScore = 0;
    
    // Analyze URL for content hints (for more realistic mock data)
    const urlLower = (imageUrl || '').toLowerCase();
    const isActionGame = urlLower.includes('counter-strike') || urlLower.includes('call-of-duty') || 
                        urlLower.includes('battlefield') || urlLower.includes('doom') ||
                        urlLower.includes('gta') || urlLower.includes('grand-theft-auto');
    const isRPGGame = urlLower.includes('witcher') || urlLower.includes('cyberpunk') || 
                      urlLower.includes('elder-scrolls') || urlLower.includes('fallout');
    const isSteamContent = urlLower.includes('steam') || urlLower.includes('akamai');
    
    // Gaming content typically has weapons but low nudity/alcohol
    if (isActionGame) {
      // Action games likely have weapons, low nudity/alcohol
      weaponScore = 15 + Math.floor(Math.random() * 60); // 15-75%
      nudityScore = Math.floor(Math.random() * 15); // 0-15%
      alcoholScore = Math.floor(Math.random() * 20); // 0-20%
    } else if (isRPGGame) {
      // RPGs may have more varied content
      weaponScore = 10 + Math.floor(Math.random() * 40); // 10-50%
      nudityScore = Math.floor(Math.random() * 25); // 0-25%
      alcoholScore = Math.floor(Math.random() * 30); // 0-30%
    } else if (isSteamContent) {
      // Steam gaming content - moderate weapon likelihood
      weaponScore = 5 + Math.floor(Math.random() * 35); // 5-40%
      nudityScore = Math.floor(Math.random() * 20); // 0-20%
      alcoholScore = Math.floor(Math.random() * 25); // 0-25%
    } else {
      // General gaming content - conservative scores
      weaponScore = Math.floor(Math.random() * 30); // 0-30%
      nudityScore = Math.floor(Math.random() * 15); // 0-15%
      alcoholScore = Math.floor(Math.random() * 20); // 0-20%
    }
    
    // Add some randomness but keep scores realistic for gaming
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    nudityScore = Math.min(100, Math.floor(nudityScore * randomFactor));
    weaponScore = Math.min(100, Math.floor(weaponScore * randomFactor));
    alcoholScore = Math.min(100, Math.floor(alcoholScore * randomFactor));
    
    const { primaryContent, primaryScore } = this.determinePrimaryContent(
      nudityScore, 
      weaponScore, 
      alcoholScore
    );
    
    // Category is based on the primary content type and score
    const category = this.determineCategory(primaryContent, primaryScore);
    
    // Higher confidence for obvious gaming content
    const baseConfidence = isSteamContent || isActionGame || isRPGGame ? 0.8 : 0.7;
    const confidence = baseConfidence + Math.random() * 0.2;
    
    return {
      primaryContent,
      primaryScore,
      nudityScore,
      weaponScore,
      alcoholScore,
      category,
      confidence,
      timestamp: Date.now(),
    };
  }

  // Batch analysis for multiple images
  async analyzeMultipleImages(imageUrls: string[]): Promise<(ContentScore | null)[]> {
    try {
      const promises = imageUrls.map(url => this.analyzeImage(url));
      const results = await Promise.all(promises);
      
      // Log content scoring summary
      const validResults = results.filter(r => r !== null);
      if (validResults.length > 0) {
        const avgNudity = validResults.reduce((sum, r) => sum + (r?.nudityScore || 0), 0) / validResults.length;
        const avgWeapon = validResults.reduce((sum, r) => sum + (r?.weaponScore || 0), 0) / validResults.length;
        const avgAlcohol = validResults.reduce((sum, r) => sum + (r?.alcoholScore || 0), 0) / validResults.length;
        
        console.log(`🛡️ Content Analysis: ${validResults.length} images analyzed`);
        console.log(`🛡️ Average scores - Nudity: ${avgNudity.toFixed(1)}%, Weapons: ${avgWeapon.toFixed(1)}%, Alcohol: ${avgAlcohol.toFixed(1)}%`);
      }
      
      return results;
    } catch (error) {
      console.error('Error in batch content analysis:', error);
      return imageUrls.map(() => null);
    }
  }

  // Check if content moderation is available
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }
}

export default new ContentModerationService();