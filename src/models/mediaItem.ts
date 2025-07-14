export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  source: 'rawg' | 'igdb' | 'steam' | 'youtube';
  gameId: number;
  width?: number;
  height?: number;
  fileSize?: number;
  contentScore?: ContentScore;
  metadata?: MediaMetadata;
}

export interface ContentScore {
  // Primary content type to display
  primaryContent: 'nudity' | 'weapon' | 'alcohol' | 'safe';
  primaryScore: number; // Score of the primary content (0-100)
  
  // Individual content scores
  nudityScore: number; // 0-100
  weaponScore: number; // 0-100
  alcoholScore: number; // 0-100
  
  // Content category based on primary content type and score
  category: 'safe' | 'suggestive' | 'partial' | 'explicit' | 'erotic' | 'brutal' | 'cockeyed';
  confidence: number; // 0-1
  timestamp: number;
}

export interface MediaMetadata {
  uploadDate?: string;
  tags?: string[];
  resolution?: string;
  duration?: number; // for videos
  format?: string;
}

export interface MediaCollection {
  screenshots: MediaItem[];
  videos: MediaItem[];
  artwork: MediaItem[];
  total: number;
}