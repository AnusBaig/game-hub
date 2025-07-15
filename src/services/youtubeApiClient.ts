interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
      maxres?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
    channelId: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

class YouTubeApiClient {
  private proxyBaseUrl = '/api/youtube';
  private isConfiguredCache: boolean | null = null;

  // Search for gaming videos related to a specific game
  async searchGameVideos(
    gameName: string, 
    maxResults: number = 10
  ): Promise<YouTubeVideo[]> {
    if (!(await this.isConfigured())) {
      console.log('YouTube API not configured');
      return [];
    }

    try {
      // Create search query with game name + relevant keywords
      const searchQuery = `${gameName} gameplay trailer review`;
      
      const response = await fetch(
        `${this.proxyBaseUrl}/search?` +
        new URLSearchParams({
          q: searchQuery,
          maxResults: maxResults.toString(),
          order: 'relevance',
          videoDuration: 'medium'
        })
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.configured === false) {
          console.log('YouTube API not configured on server');
          return [];
        }
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data: YouTubeSearchResponse = await response.json();
      
      // Filter for quality content
      return this.filterQualityVideos(data.items, gameName);

    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return [];
    }
  }

  // Filter videos for quality and relevance
  private filterQualityVideos(videos: YouTubeVideo[], gameName: string): YouTubeVideo[] {
    return videos.filter(video => {
      const title = video.snippet.title.toLowerCase();
      const gameNameLower = gameName.toLowerCase();
      const channel = video.snippet.channelTitle.toLowerCase();
      
      // Must contain the game name
      if (!title.includes(gameNameLower)) {
        return false;
      }

      // Prefer official or well-known gaming channels
      const isOfficialChannel = this.isOfficialGamingChannel(channel);
      const hasGoodKeywords = this.hasRelevantKeywords(title);
      
      // Filter out low-quality content
      const isLowQuality = this.isLowQualityContent(title);
      
      return !isLowQuality && (isOfficialChannel || hasGoodKeywords);
    });
  }

  // Check if channel is from a known gaming publisher/developer
  private isOfficialGamingChannel(channelName: string): boolean {
    const officialChannels = [
      'playstation', 'xbox', 'nintendo', 'steam', 'epic games',
      'ubisoft', 'ea', 'activision', 'square enix', 'capcom',
      'sega', 'bethesda', 'rockstar games', 'cd projekt red',
      'blizzard entertainment', 'riot games', 'valve', 'gamespot',
      'ign', 'polygon', 'kotaku', 'game informer'
    ];

    return officialChannels.some(official => 
      channelName.includes(official) || 
      channelName.replace(/\s+/g, '').includes(official.replace(/\s+/g, ''))
    );
  }

  // Check for relevant gaming keywords
  private hasRelevantKeywords(title: string): boolean {
    const relevantKeywords = [
      'official', 'trailer', 'gameplay', 'review', 'walkthrough',
      'guide', 'tips', 'strategy', 'showcase', 'preview',
      'launch', 'reveal', 'announcement', 'interview'
    ];

    return relevantKeywords.some(keyword => title.includes(keyword));
  }

  // Filter out low-quality content
  private isLowQualityContent(title: string): boolean {
    const lowQualityIndicators = [
      'live stream', 'stream highlights', 'reaction',
      'meme', 'funny moments', 'compilation', 'montage',
      'fail', 'rage', 'clickbait', 'leaked', 'rumor'
    ];

    return lowQualityIndicators.some(indicator => title.includes(indicator));
  }

  // Get video details including statistics
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (!(await this.isConfigured()) || videoIds.length === 0) {
      return [];
    }

    try {
      // This would need to be implemented via proxy if needed
      console.log('Video details endpoint not implemented via proxy yet');
      return [];
    } catch (error) {
      console.error('Error fetching YouTube video details:', error);
      return [];
    }
  }

  // Get video thumbnail URL
  getThumbnailUrl(video: YouTubeVideo, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
    const thumbnails = video.snippet.thumbnails;
    
    if (quality === 'maxres' && thumbnails.maxres) {
      return thumbnails.maxres.url;
    }
    
    return thumbnails[quality]?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;
  }

  // Get video URL
  getVideoUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Get embed URL for video player
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Check if YouTube API is configured
  async isConfigured(): Promise<boolean> {
    if (this.isConfiguredCache !== null) {
      return this.isConfiguredCache;
    }
    
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        this.isConfiguredCache = data.apis?.youtube || false;
        return this.isConfiguredCache || false;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Get channel information
  async getChannelInfo(channelId: string) {
    if (!(await this.isConfigured())) return null;

    try {
      // This would need to be implemented via proxy if needed
      console.log('Channel info endpoint not implemented via proxy yet');
      return null;
    } catch (error) {
      console.error('Error fetching channel info:', error);
      return null;
    }
  }
}

export default new YouTubeApiClient();