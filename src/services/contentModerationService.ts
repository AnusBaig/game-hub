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
      return this.getMockContentScore();
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
        return this.getMockContentScore();
      }

      const data: SightEngineResponse = await response.json();
      return this.parseResponse(data);

    } catch (error) {
      console.error('Error analyzing image:', error);
      return this.getMockContentScore();
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

  private getMockContentScore(): ContentScore {
    // Generate realistic mock scores for demonstration
    const nudityScore = Math.floor(Math.random() * 100);
    const weaponScore = Math.floor(Math.random() * 50); // Weapons less common
    const alcoholScore = Math.floor(Math.random() * 30); // Alcohol less common
    
    const { primaryContent, primaryScore } = this.determinePrimaryContent(
      nudityScore, 
      weaponScore, 
      alcoholScore
    );
    
    // Category is based on the primary content type and score
    const category = this.determineCategory(primaryContent, primaryScore);
    
    return {
      primaryContent,
      primaryScore,
      nudityScore,
      weaponScore,
      alcoholScore,
      category,
      confidence: 0.7 + Math.random() * 0.3, // 70-100% confidence
      timestamp: Date.now(),
    };
  }

  // Batch analysis for multiple images
  async analyzeMultipleImages(imageUrls: string[]): Promise<(ContentScore | null)[]> {
    const promises = imageUrls.map(url => this.analyzeImage(url));
    return Promise.all(promises);
  }

  // Check if content moderation is available
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }
}

export default new ContentModerationService();