import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MediaCollection, MediaItem } from '../models/mediaItem';
import multiMediaService from '../services/multiMediaService';

interface GameDetails {
  name: string;
  name_original: string;
  released?: string;
}

interface ProgressiveMediaState {
  data: MediaCollection;
  isLoading: boolean;
  isStillLoading: boolean;
  error: Error | null;
  sourcesCompleted: string[];
}

const useProgressiveGameMedia = (gameId: number, gameDetails?: GameDetails) => {
  const [progressiveState, setProgressiveState] = useState<{
    currentData: MediaCollection;
    isStillLoading: boolean;
    sourcesCompleted: string[];
  }>({
    currentData: { screenshots: [], videos: [], artwork: [], gameplay: [], total: 0 },
    isStillLoading: true,
    sourcesCompleted: []
  });

  // Keep the original query as baseline - it works and fetches from all sources
  const originalQuery = useQuery({
    queryKey: ['gameMedia', gameId, gameDetails?.name],
    queryFn: () => multiMediaService.getGameMedia(gameId, gameDetails),
    staleTime: 1000 * 60 * 5,
    enabled: !!gameId, // Re-enable to ensure we get all source data
  });

  // Progressive loading effect
  useEffect(() => {
    if (!gameId) return;

    let mounted = true;
    let sourcesCompleted = 0;
    const totalSources = gameDetails ? 5 : 1; // RAWG + IGDB + YouTube + Steam + Adult Platforms OR just RAWG
    
    console.log('🔄 Starting progressive loading for game:', gameId, {
      hasGameDetails: !!gameDetails,
      gameDetails: gameDetails ? {
        name: gameDetails.name,
        name_original: gameDetails.name_original,
        released: gameDetails.released
      } : null,
      totalSources
    });
    
    // Reset state
    setProgressiveState({
      currentData: { screenshots: [], videos: [], artwork: [], gameplay: [], total: 0 },
      isStillLoading: totalSources > 1,
      sourcesCompleted: []
    });

    // Function to merge new media with existing
    const mergeMediaData = (newMedia: Partial<MediaCollection>, sourceName: string) => {
      if (!mounted) return;

      setProgressiveState(prev => {
        const screenshots = [...prev.currentData.screenshots, ...(newMedia.screenshots || [])];
        const videos = [...prev.currentData.videos, ...(newMedia.videos || [])];
        const artwork = [...prev.currentData.artwork, ...(newMedia.artwork || [])];
        const gameplay = [...prev.currentData.gameplay, ...(newMedia.gameplay || [])];

        // Simple deduplication by URL
        const uniqueScreenshots = screenshots.filter((item, index, arr) =>
          arr.findIndex(i => i.url === item.url) === index
        );
        const uniqueVideos = videos.filter((item, index, arr) =>
          arr.findIndex(i => i.url === item.url) === index
        );
        const uniqueArtwork = artwork.filter((item, index, arr) =>
          arr.findIndex(i => i.url === item.url) === index
        );
        const uniqueGameplay = gameplay.filter((item, index, arr) =>
          arr.findIndex(i => i.url === item.url) === index
        );

        const updatedData = {
          screenshots: uniqueScreenshots,
          videos: uniqueVideos,
          artwork: uniqueArtwork,
          gameplay: uniqueGameplay,
          total: uniqueScreenshots.length + uniqueVideos.length + uniqueArtwork.length + uniqueGameplay.length
        };

        console.log(`✅ ${sourceName} data merged. Total: ${updatedData.total} items`);

        return {
          currentData: updatedData,
          isStillLoading: prev.sourcesCompleted.length + 1 < totalSources,
          sourcesCompleted: [...prev.sourcesCompleted, sourceName]
        };
      });
    };

    // Fetch sources progressively
    const fetchSources = async () => {
      const checkAllSourcesComplete = () => {
        sourcesCompleted++;
        console.log(`📊 Completed ${sourcesCompleted}/${totalSources} sources`);
        if (sourcesCompleted >= totalSources && mounted) {
          console.log('🏁 All sources completed, hiding loading indicator');
          setProgressiveState(prev => ({
            ...prev,
            isStillLoading: false
          }));
        }
      };

      // Always fetch RAWG first (fastest and most reliable)
      console.log('🎯 Starting RAWG fetch for game:', gameId);
      try {
        const rawgData = await multiMediaService.getRawgMediaOnly(gameId);
        console.log('📥 RAWG response:', rawgData ? {
          screenshots: rawgData.screenshots?.length || 0,
          videos: rawgData.videos?.length || 0,
          artwork: rawgData.artwork?.length || 0,
          total: rawgData.total || 0
        } : 'null');
        
        if (rawgData && mounted) {
          mergeMediaData(rawgData, 'RAWG');
        }
      } catch (error) {
        console.warn('❌ RAWG fetch failed:', error);
      } finally {
        checkAllSourcesComplete();
      }

      // If we have game details, fetch other sources
      if (gameDetails && mounted) {
        // Fetch remaining sources in parallel
        const otherSources = [
          {
            name: 'IGDB',
            fetch: () => multiMediaService.getIGDBMediaOnly(gameId, gameDetails)
          },
          {
            name: 'YouTube',
            fetch: () => multiMediaService.getYouTubeMediaOnly(gameDetails.name)
          },
          {
            name: 'Steam',
            fetch: () => multiMediaService.getSteamMediaOnly(gameId, gameDetails.name)
          },
          {
            name: 'Adult Platforms',
            fetch: () => multiMediaService.getAdultPlatformMediaOnly(gameId, gameDetails.name)
          }
        ];

        otherSources.forEach(({ name, fetch }) => {
          console.log(`🎯 Starting ${name} fetch for game:`, gameId);
          fetch()
            .then(data => {
              console.log(`📥 ${name} response:`, data ? {
                screenshots: ('screenshots' in data) ? data.screenshots?.length || 0 : 'N/A',
                videos: data.videos?.length || 0,
                artwork: ('artwork' in data) ? data.artwork?.length || 0 : 'N/A'
              } : 'null');
              
              if (data && mounted) {
                const hasContent = ('screenshots' in data && data.screenshots?.length) ||
                                 (data.videos?.length) ||
                                 ('artwork' in data && data.artwork?.length) ||
                                 ('gameplay' in data && data.gameplay?.length);
                console.log(`${name} hasContent:`, hasContent);
                if (hasContent) {
                  mergeMediaData(data, name);
                }
              }
            })
            .catch(error => {
              console.warn(`❌ ${name} fetch failed:`, error);
            })
            .finally(() => {
              checkAllSourcesComplete();
            });
        });
      } else {
        // Only RAWG source, so we're done
        console.log('🏁 Only RAWG source, marking as complete');
      }
    };

    fetchSources();

    return () => {
      mounted = false;
    };
  }, [gameId, gameDetails?.name]);

  // Log both data sources for comparison
  if (originalQuery.data && progressiveState.currentData.total > 0) {
    console.log('📊 Data comparison:', {
      original: originalQuery.data.total,
      progressive: progressiveState.currentData.total,
      originalScreenshots: originalQuery.data.screenshots.length,
      progressiveScreenshots: progressiveState.currentData.screenshots.length,
      originalVideos: originalQuery.data.videos.length,
      progressiveVideos: progressiveState.currentData.videos.length,
      originalArtwork: originalQuery.data.artwork.length,
      progressiveArtwork: progressiveState.currentData.artwork.length,
    });
  }

  return {
    // Use progressive data if it has content, otherwise use proven working original query
    data: progressiveState.currentData.total > 0 ? progressiveState.currentData : (originalQuery.data || { screenshots: [], videos: [], artwork: [], gameplay: [], total: 0 }),
    isLoading: originalQuery.isLoading && progressiveState.currentData.total === 0,
    isStillLoading: progressiveState.isStillLoading && progressiveState.currentData.total > 0, // Only show if we have some data
    error: originalQuery.error
  };
};

export default useProgressiveGameMedia;