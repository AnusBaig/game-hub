import { MediaItem } from "../models/mediaItem";

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class MediaStorageService {
  private getProxyUrl(originalUrl: string): string {
    // In development, use the dev server proxy
    // In production, use the same origin proxy
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3501' 
      : window.location.origin;
    
    return `${baseUrl}/api/proxy-media?url=${encodeURIComponent(originalUrl)}`;
  }

  // Check if URL is a YouTube video
  isYouTubeVideo(url: string): boolean {
    return url.includes('youtube.com/watch') || 
           url.includes('youtu.be/') || 
           url.includes('youtube.com/embed/');
  }

  // Open YouTube video in new tab
  openYouTubeVideo(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  
  // Download media file with progress tracking
  async downloadMedia(
    media: MediaItem,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    // Check if this is a YouTube video
    if (this.isYouTubeVideo(media.url)) {
      throw new Error('YouTube videos cannot be downloaded. Use "Open in YouTube" instead.');
    }

    try {
      const proxyUrl = this.getProxyUrl(media.url);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && total > 0) {
          onProgress({
            loaded,
            total,
            percentage: (loaded / total) * 100
          });
        }
      }

      // Create blob from chunks
      const blob = new Blob(chunks);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.generateFileName(media);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Save media to browser storage (for offline access)
  async saveToLocalStorage(media: MediaItem): Promise<boolean> {
    try {
      const proxyUrl = this.getProxyUrl(media.url);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      // Convert to base64 for storage
      const base64 = await this.blobToBase64(blob);
      
      const storageKey = `media_${media.id}`;
      const storageData = {
        media,
        data: base64,
        savedAt: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(storageData));
      return true;
      
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      return false;
    }
  }

  // Get saved media from local storage
  getSavedMedia(mediaId: string): { media: MediaItem; dataUrl: string } | null {
    try {
      const storageKey = `media_${mediaId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return {
        media: parsed.media,
        dataUrl: parsed.data
      };
      
    } catch (error) {
      console.error('Failed to retrieve saved media:', error);
      return null;
    }
  }

  // Remove saved media from local storage
  removeSavedMedia(mediaId: string): boolean {
    try {
      const storageKey = `media_${mediaId}`;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to remove saved media:', error);
      return false;
    }
  }

  // Get list of all saved media
  getSavedMediaList(): MediaItem[] {
    const savedMedia: MediaItem[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('media_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            savedMedia.push(parsed.media);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get saved media list:', error);
    }
    
    return savedMedia;
  }

  // Clear all saved media
  clearAllSavedMedia(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('media_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear saved media:', error);
    }
  }

  // Generate appropriate filename for download
  private generateFileName(media: MediaItem): string {
    const extension = this.getFileExtension(media);
    const baseName = media.title 
      ? media.title.replace(/[^a-zA-Z0-9]/g, '_') 
      : `${media.source}_${media.type}_${media.id}`;
    
    return `${baseName}.${extension}`;
  }

  // Determine file extension based on media type and URL
  private getFileExtension(media: MediaItem): string {
    if (media.type === 'video') {
      return 'mp4'; // Default for videos
    }
    
    // Try to extract extension from URL
    const urlExtension = media.url.split('.').pop()?.toLowerCase();
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (urlExtension && validImageExtensions.includes(urlExtension)) {
      return urlExtension;
    }
    
    return 'jpg'; // Default for images
  }

  // Convert blob to base64 string
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Get storage usage information
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('media_')) {
          const value = localStorage.getItem(key);
          if (value) {
            used += value.length;
          }
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }
    
    // Browser localStorage limit is typically ~5-10MB
    const available = 10 * 1024 * 1024; // Assume 10MB limit
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  }
}

export default new MediaStorageService();