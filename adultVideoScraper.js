import * as cheerio from 'cheerio';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Helper to get cached data or fetch new
function getCachedOrFetch(key, fetchFn) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Cache hit for: ${key}`);
    return Promise.resolve(cached.data);
  }

  return fetchFn().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

// Extract video URL from Pornhub video page
async function extractPornhubVideoUrl(pageUrl) {
  try {
    console.log(`🎬 Extracting video URL from: ${pageUrl}`);

    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.pornhub.com/'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch video page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Try multiple extraction methods

    // Method 1: Look for flashvars_xxxxxxxxx variable containing video URLs
    const flashvarsMatch = html.match(/var\s+flashvars_\d+\s*=\s*({[\s\S]*?});/);
    if (flashvarsMatch) {
      try {
        const jsonStr = flashvarsMatch[1];
        const flashvars = JSON.parse(jsonStr);

        // Pornhub stores video URLs in mediaDefinitions array
        if (flashvars.mediaDefinitions) {
          // Find highest quality MP4
          const mp4Videos = flashvars.mediaDefinitions
            .filter(def => def.format === 'mp4' && def.videoUrl)
            .sort((a, b) => (b.quality || 0).localeCompare(a.quality || 0));

          if (mp4Videos.length > 0) {
            console.log(`✅ Found ${mp4Videos.length} video qualities`);
            return mp4Videos[0].videoUrl; // Return highest quality
          }
        }
      } catch (e) {
        console.error('Failed to parse flashvars:', e.message);
      }
    }

    // Method 2: Look for player JavaScript with video sources
    const playerMatch = html.match(/"videoUrl":"([^"]+)"/);
    if (playerMatch) {
      const videoUrl = playerMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
      console.log(`✅ Found video URL via player match`);
      return videoUrl;
    }

    // Method 3: Look for m3u8 playlist
    const m3u8Match = html.match(/"(https?:\/\/[^"]*\.m3u8[^"]*)"/);
    if (m3u8Match) {
      console.log(`✅ Found HLS stream`);
      return m3u8Match[1].replace(/\\/g, '');
    }

    console.warn(`⚠️ Could not extract video URL from Pornhub page`);
    return null;

  } catch (error) {
    console.error(`❌ Error extracting Pornhub video URL:`, error.message);
    return null;
  }
}

// Extract video URL from xVideos video page
async function extractXVideosVideoUrl(pageUrl) {
  try {
    console.log(`🎬 Extracting video URL from: ${pageUrl}`);

    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.xvideos.com/'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch video page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Method 1: Look for html5player.setVideoUrlHigh or similar
    const highQualityMatch = html.match(/html5player\.setVideoUrlHigh\('([^']+)'\)/);
    if (highQualityMatch) {
      console.log(`✅ Found high quality video URL`);
      return highQualityMatch[1];
    }

    // Method 2: Look for html5player.setVideoUrlLow
    const lowQualityMatch = html.match(/html5player\.setVideoUrlLow\('([^']+)'\)/);
    if (lowQualityMatch) {
      console.log(`✅ Found low quality video URL`);
      return lowQualityMatch[1];
    }

    // Method 3: Look for setVideoHLS (m3u8)
    const hlsMatch = html.match(/html5player\.setVideoHLS\('([^']+)'\)/);
    if (hlsMatch) {
      console.log(`✅ Found HLS stream`);
      return hlsMatch[1];
    }

    // Method 4: Look for video_url in page data
    const videoUrlMatch = html.match(/"video_url":"([^"]+)"/);
    if (videoUrlMatch) {
      console.log(`✅ Found video URL in page data`);
      return videoUrlMatch[1].replace(/\\/g, '');
    }

    console.warn(`⚠️ Could not extract video URL from xVideos page`);
    return null;

  } catch (error) {
    console.error(`❌ Error extracting xVideos video URL:`, error.message);
    return null;
  }
}

// Extract video URL from RedTube video page
async function extractRedTubeVideoUrl(pageUrl) {
  try {
    console.log(`🎬 Extracting video URL from: ${pageUrl}`);

    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.redtube.com/'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch video page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Method 1: Look for mediaDefinitions in page
    const mediaDefMatch = html.match(/"mediaDefinitions":\s*(\[[\s\S]*?\])/);
    if (mediaDefMatch) {
      try {
        const mediaDefinitions = JSON.parse(mediaDefMatch[1]);

        // Find highest quality MP4
        const mp4Videos = mediaDefinitions
          .filter(def => def.format === 'mp4' && def.videoUrl)
          .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

        if (mp4Videos.length > 0) {
          console.log(`✅ Found ${mp4Videos.length} video qualities`);
          return mp4Videos[0].videoUrl;
        }
      } catch (e) {
        console.error('Failed to parse mediaDefinitions:', e.message);
      }
    }

    // Method 2: Look for direct video source
    const videoSrcMatch = html.match(/<source\s+src="([^"]+\.mp4[^"]*)"/);
    if (videoSrcMatch) {
      console.log(`✅ Found video source tag`);
      return videoSrcMatch[1];
    }

    // Method 3: Look for m3u8
    const m3u8Match = html.match(/"(https?:\/\/[^"]*\.m3u8[^"]*)"/);
    if (m3u8Match) {
      console.log(`✅ Found HLS stream`);
      return m3u8Match[1];
    }

    console.warn(`⚠️ Could not extract video URL from RedTube page`);
    return null;

  } catch (error) {
    console.error(`❌ Error extracting RedTube video URL:`, error.message);
    return null;
  }
}

// Extract video URL from xHamster video page
async function extractXHamsterVideoUrl(pageUrl) {
  try {
    console.log(`🎬 Extracting video URL from: ${pageUrl}`);

    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://xhamster.com/'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch video page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Method 1: Look for initials window object with video sources
    const initialsMatch = html.match(/window\.initials\s*=\s*({[\s\S]*?});/);
    if (initialsMatch) {
      try {
        const initials = JSON.parse(initialsMatch[1]);

        if (initials.videoModel && initials.videoModel.sources) {
          const sources = initials.videoModel.sources;

          // Try to find best quality MP4
          const mp4Source = sources.find(s => s.format === 'mp4' && s.url) ||
                           sources.find(s => s.url && s.url.includes('.mp4'));

          if (mp4Source) {
            console.log(`✅ Found video source`);
            return mp4Source.url;
          }

          // Fallback to any source with URL
          const anySource = sources.find(s => s.url);
          if (anySource) {
            console.log(`✅ Found fallback video source`);
            return anySource.url;
          }
        }
      } catch (e) {
        console.error('Failed to parse window.initials:', e.message);
      }
    }

    // Method 2: Look for video source tags
    const $ = cheerio.load(html);
    const videoSrc = $('video source[src]').first().attr('src');
    if (videoSrc) {
      console.log(`✅ Found video source tag`);
      return videoSrc;
    }

    // Method 3: Look for m3u8
    const m3u8Match = html.match(/"(https?:\/\/[^"]*\.m3u8[^"]*)"/);
    if (m3u8Match) {
      console.log(`✅ Found HLS stream`);
      return m3u8Match[1];
    }

    console.warn(`⚠️ Could not extract video URL from xHamster page`);
    return null;

  } catch (error) {
    console.error(`❌ Error extracting xHamster video URL:`, error.message);
    return null;
  }
}

// Scrape Pornhub search results
export async function scrapePornhubSearch(query, limit = 20) {
  const cacheKey = `pornhub:${query}:${limit}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const searchUrl = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`;
      console.log(`🔞 Scraping Pornhub: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.pornhub.com/'
        }
      });

      if (!response.ok) {
        throw new Error(`Pornhub returned ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const videos = [];

      // Pornhub uses .videoblock or .phimage class for video items
      $('.phimage, .videoblock, .pcVideoListItem').slice(0, limit).each((i, element) => {
        try {
          const $el = $(element);
          const $link = $el.find('a').first();
          const href = $link.attr('href');

          if (!href) return;

          // Extract video ID from URL
          const videoId = href.split('/').find(part => part.includes('viewkey='))?.split('=')[1] ||
                         href.split('/').filter(p => p).pop();

          const title = $link.attr('title') ||
                       $el.find('.title a').text().trim() ||
                       $el.find('[data-title]').attr('data-title') ||
                       'Unknown Title';

          const thumb = $el.find('img').attr('data-src') ||
                       $el.find('img').attr('data-thumb_url') ||
                       $el.find('img').attr('src') ||
                       '';

          const duration = $el.find('.duration, .marker-overlays .duration').text().trim() || '0:00';

          const views = $el.find('.views, .videoDetailsBlock .views').text().trim() || '0';

          const rating = $el.find('.value, .percent').text().trim() || '';

          // Build full URL
          const url = href.startsWith('http') ? href : `https://www.pornhub.com${href}`;

          if (videoId && title && title !== 'Unknown Title') {
            videos.push({
              video_id: videoId,
              title: title,
              url: url,
              pageUrl: url, // Store page URL for later extraction
              thumb: thumb.replace(/\s/g, ''),
              default_thumb: thumb.replace(/\s/g, ''),
              duration: duration,
              views: views,
              rating: rating,
              publish_date: '',
              tags: [],
              categories: []
            });
          }
        } catch (err) {
          console.error('Error parsing Pornhub video item:', err.message);
        }
      });

      console.log(`✅ Pornhub: Found ${videos.length} videos`);
      return { videos };

    } catch (error) {
      console.error('❌ Pornhub scraping error:', error.message);
      return { videos: [] };
    }
  });
}

// Scrape RedTube search results
export async function scrapeRedTubeSearch(query, limit = 20) {
  const cacheKey = `redtube:${query}:${limit}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const searchUrl = `https://www.redtube.com/?search=${encodeURIComponent(query)}`;
      console.log(`🔞 Scraping RedTube: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.redtube.com/'
        }
      });

      if (!response.ok) {
        throw new Error(`RedTube returned ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const videos = [];

      // RedTube uses .video_link or .videoblock class
      $('.video_link, .videoblock, li[data-video-id]').slice(0, limit).each((i, element) => {
        try {
          const $el = $(element);
          const $link = $el.find('a').first();
          const href = $link.attr('href');

          if (!href) return;

          const videoId = $el.attr('data-video-id') ||
                         href.split('/').filter(p => p && !isNaN(p))[0] ||
                         href.split('/').pop();

          const title = $link.attr('title') ||
                       $el.find('.video_title').text().trim() ||
                       $el.find('img').attr('alt') ||
                       'Unknown Title';

          const thumb = $el.find('img').attr('data-src') ||
                       $el.find('img').attr('data-thumb_url') ||
                       $el.find('img').attr('src') ||
                       '';

          const duration = $el.find('.duration').text().trim() || '0:00';
          const views = $el.find('.video_views, .views').text().trim() || '0';

          const url = href.startsWith('http') ? href : `https://www.redtube.com${href}`;

          if (videoId && title && title !== 'Unknown Title') {
            videos.push({
              video_id: videoId,
              title: title,
              url: url,
              thumb: thumb.replace(/\s/g, ''),
              duration: duration,
              views: views,
              publish_date: '',
              tags: []
            });
          }
        } catch (err) {
          console.error('Error parsing RedTube video item:', err.message);
        }
      });

      console.log(`✅ RedTube: Found ${videos.length} videos`);
      return { videos, count: videos.length };

    } catch (error) {
      console.error('❌ RedTube scraping error:', error.message);
      return { videos: [], count: 0 };
    }
  });
}

// Scrape xVideos search results
export async function scrapeXVideosSearch(query, limit = 20) {
  const cacheKey = `xvideos:${query}:${limit}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const searchUrl = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
      console.log(`🔞 Scraping xVideos: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.xvideos.com/'
        }
      });

      if (!response.ok) {
        throw new Error(`xVideos returned ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const videos = [];

      // xVideos uses .thumb-block or similar
      $('.thumb-block, .mozaique cust-nb-cols, div[class*="thumb"]').slice(0, limit).each((i, element) => {
        try {
          const $el = $(element);
          const $link = $el.find('a').first();
          const href = $link.attr('href');

          if (!href) return;

          const videoId = href.split('/').filter(p => p && /^video/.test(p))[0] ||
                         href.split('/').pop();

          const title = $link.attr('title') ||
                       $el.find('p a').attr('title') ||
                       $el.find('.title').text().trim() ||
                       'Unknown Title';

          const thumb = $el.find('img').attr('data-src') ||
                       $el.find('img').attr('data-lazy-src') ||
                       $el.find('img').attr('src') ||
                       '';

          const duration = $el.find('.duration, .bg').text().trim() || '0:00';
          const views = $el.find('.views, .bg-views').text().trim() || '0';

          const url = href.startsWith('http') ? href : `https://www.xvideos.com${href}`;

          if (videoId && title && title !== 'Unknown Title') {
            videos.push({
              id: videoId,
              title: title,
              url: url,
              thumbnail: thumb.replace(/\s/g, ''),
              duration: duration,
              views: views
            });
          }
        } catch (err) {
          console.error('Error parsing xVideos video item:', err.message);
        }
      });

      console.log(`✅ xVideos: Found ${videos.length} videos`);
      return videos;

    } catch (error) {
      console.error('❌ xVideos scraping error:', error.message);
      return [];
    }
  });
}

// Scrape xHamster search results
export async function scrapeXHamsterSearch(query, limit = 20) {
  const cacheKey = `xhamster:${query}:${limit}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const searchUrl = `https://xhamster.com/search/${encodeURIComponent(query)}`;
      console.log(`🔞 Scraping xHamster: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://xhamster.com/'
        }
      });

      if (!response.ok) {
        throw new Error(`xHamster returned ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const videos = [];

      // xHamster uses .video-item or .thumb-list__item
      ('.thumb-list__item, .video-item, [class*="video-thumb"]').slice(0, limit).each((i, element) => {
        try {
          const $el = $(element);
          const $link = $el.find('a').first();
          const href = $link.attr('href');

          if (!href) return;

          const videoId = href.split('/').filter(p => p && /^videos/.test(p))[0] ||
                         href.split('-').pop();

          const title = $link.attr('title') ||
                       $el.find('.video-thumb-info__name').text().trim() ||
                       $el.find('img').attr('alt') ||
                       'Unknown Title';

          const thumb = $el.find('img').attr('data-src') ||
                       $el.find('img').attr('src') ||
                       '';

          const duration = $el.find('.thumb-image-container__duration, .duration').text().trim() || '0:00';
          const views = $el.find('.views').text().trim() || '0';

          const url = href.startsWith('http') ? href : `https://xhamster.com${href}`;

          if (videoId && title && title !== 'Unknown Title') {
            videos.push({
              id: videoId,
              title: title,
              url: url,
              thumbnail: thumb.replace(/\s/g, ''),
              duration: duration,
              views: views
            });
          }
        } catch (err) {
          console.error('Error parsing xHamster video item:', err.message);
        }
      });

      console.log(`✅ xHamster: Found ${videos.length} videos`);
      return videos;

    } catch (error) {
      console.error('❌ xHamster scraping error:', error.message);
      return [];
    }
  });
}

// Get video details with playable URL for Pornhub
export async function getPornhubVideoDetails(videoId, pageUrl) {
  const cacheKey = `pornhub:video:${videoId}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const videoUrl = await extractPornhubVideoUrl(pageUrl);
      return {
        videoUrl: videoUrl,
        pageUrl: pageUrl,
        videoId: videoId
      };
    } catch (error) {
      console.error(`❌ Error getting Pornhub video details:`, error.message);
      return {
        videoUrl: null,
        pageUrl: pageUrl,
        videoId: videoId
      };
    }
  });
}

// Get video details with playable URL for xVideos
export async function getXVideosVideoDetails(videoId, pageUrl) {
  const cacheKey = `xvideos:video:${videoId}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const videoUrl = await extractXVideosVideoUrl(pageUrl);
      return {
        videoUrl: videoUrl,
        pageUrl: pageUrl,
        videoId: videoId
      };
    } catch (error) {
      console.error(`❌ Error getting xVideos video details:`, error.message);
      return {
        videoUrl: null,
        pageUrl: pageUrl,
        videoId: videoId
      };
    }
  });
}

// Get video details with playable URL for RedTube
export async function getRedTubeVideoDetails(videoId, pageUrl) {
  const cacheKey = `redtube:video:${videoId}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const videoUrl = await extractRedTubeVideoUrl(pageUrl);
      return {
        videoUrl: videoUrl,
        pageUrl: pageUrl,
        videoId: videoId
      };
    } catch (error) {
      console.error(`❌ Error getting RedTube video details:`, error.message);
      return {
        videoUrl: null,
        pageUrl: pageUrl,
        videoId: videoId
      };
    }
  });
}

// Get video details with playable URL for xHamster
export async function getXHamsterVideoDetails(videoId, pageUrl) {
  const cacheKey = `xhamster:video:${videoId}`;

  return getCachedOrFetch(cacheKey, async () => {
    try {
      const videoUrl = await extractXHamsterVideoUrl(pageUrl);
      return {
        videoUrl: videoUrl,
        pageUrl: pageUrl,
        videoId: videoId
      };
    } catch (error) {
      console.error(`❌ Error getting xHamster video details:`, error.message);
      return {
        videoUrl: null,
        pageUrl: pageUrl,
        videoId: videoId
      };
    }
  });
}

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, CACHE_TTL);

export default {
  scrapePornhubSearch,
  scrapeRedTubeSearch,
  scrapeXVideosSearch,
  scrapeXHamsterSearch,
  getPornhubVideoDetails,
  getXVideosVideoDetails,
  getRedTubeVideoDetails,
  getXHamsterVideoDetails
};
