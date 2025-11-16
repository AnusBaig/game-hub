import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  scrapePornhubSearch,
  scrapeRedTubeSearch,
  scrapeXVideosSearch,
  scrapeXHamsterSearch,
  getPornhubVideoDetails,
  getXVideosVideoDetails,
  getRedTubeVideoDetails,
  getXHamsterVideoDetails
} from './adultVideoScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3501;

// Enable CORS for all routes
app.use(cors());

// Add CSP headers for iframe embedding
app.use((req, res, next) => {
  // Allow YouTube iframe embedding and media playback
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://youtube.com https://www.gstatic.com; " +
    "frame-src 'self' https://www.youtube.com https://youtube.com; " +
    "media-src 'self' https://www.youtube.com https://youtube.com https://*.googlevideo.com https://media.rawg.io https://videos.rawg.io https://video.rawg.io https://*.phncdn.com https://*.xhcdn.com https://*.xvideos-cdn.com https://*.xhamster.com https://*.pornhub.com https://*.xvideos.com https://*.redtube.com https://cv.phncdn.com https://cv.xvideos-cdn.com https://cv.xhamster.com https://steamcdn-a.akamaihd.net blob: data:; " +
    "img-src 'self' data: https:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "connect-src 'self' https:; " +
    "font-src 'self' https:;"
  );
  
  // Allow embedding in iframes
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Allow fullscreen for video players
  res.setHeader('Permissions-Policy', 'fullscreen=(), picture-in-picture=()');
  
  next();
});

// Parse JSON bodies
app.use(express.json());

// Media proxy endpoint to handle CORS issues
app.get('/api/proxy-media', async (req, res) => {
  try {
    const { url } = req.query;

    console.log('📦 Proxy request for:', url);

    if (!url) {
      console.error('❌ No URL provided');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate URL to prevent abuse
    const allowedDomains = [
      'media.rawg.io',
      'images.igdb.com',
      'img.youtube.com',
      'i.ytimg.com',
      'steamcdn-a.akamaihd.net',
      'steamcdn-b.akamaihd.net',
      'steamcdn-c.akamaihd.net',
      'store.steampowered.com',
      'steampowered.com',
      'steamstatic.com',
      'cdn.cloudflare.steamstatic.com',
      'cdn.akamai.steamstatic.com',
      'videos.rawg.io',
      'video.rawg.io',
      'rawg.io',
      'api.rawg.io',
      'cdn.rawg.io',
      // Adult game platforms
      'nutaku.net',
      'cdn.nutaku.net',
      'static.nutaku.net',
      'img.dlsite.jp',
      'img.dlsite.com',
      'doujin-assets.dlsite.com',
      'itch.io',
      'img.itch.zone',
      'static.itch.io',
      'f95zone.to',
      'attachments.f95zone.to',
      // Adult video platforms
      'pornhub.com',
      '*.pornhub.com',
      'phncdn.com',
      '*.phncdn.com',
      'xvideos.com',
      '*.xvideos.com',
      'xvideos-cdn.com',
      'redtube.com',
      '*.redtube.com',
      'xhamster.com',
      '*.xhamster.com',
      'xhcdn.com'
    ];

    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain =>
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      console.error('❌ Domain not allowed:', urlObj.hostname);
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    console.log('✅ Domain allowed, fetching media...');

    // Get range header from client request
    const range = req.headers.range;
    console.log('📍 Range request:', range || 'none');

    // Fetch the media from external source with range support
    const fetchHeaders = {
      'User-Agent': 'GameHub/1.0 (Media Proxy)',
      'Accept': 'image/*,video/*,*/*',
    };

    // Forward range header if present
    if (range) {
      fetchHeaders['Range'] = range;
    }

    const response = await fetch(url, {
      headers: fetchHeaders,
    });

    if (!response.ok) {
      console.error('❌ Fetch failed:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Failed to fetch media: ${response.statusText}` 
      });
    }
    
    console.log('✅ Media fetched successfully, status:', response.status);

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    // Check if this is a video file
    const isVideo = contentType && contentType.startsWith('video/');

    // Set appropriate headers
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    };

    // Add range support for videos
    if (isVideo && acceptRanges) {
      headers['Accept-Ranges'] = acceptRanges;
    }

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    if (contentRange) {
      headers['Content-Range'] = contentRange;
    }

    // Set status code (206 for partial content, 200 for full content)
    const statusCode = response.status === 206 ? 206 : 200;
    res.status(statusCode);
    res.set(headers);

    console.log(`📤 Sending ${statusCode} response with headers:`, { contentType, contentLength, contentRange });

    // For videos, use streaming instead of buffering
    if (isVideo && response.body) {
      console.log('🎬 Streaming video response');

      // Use Node.js streams for better compatibility
      const reader = response.body.getReader();

      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              console.log('✅ Video stream completed');
              break;
            }
            res.write(Buffer.from(value));
          }
        } catch (err) {
          console.error('Stream error:', err);
          if (!res.headersSent) {
            res.status(500).end();
          } else {
            res.end();
          }
        }
      };

      await pump();
    } else {
      // For images and other media, buffer then send
      console.log('📦 Buffering non-video media');
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Steam API proxy endpoints
app.get('/api/steam/apps', async (req, res) => {
  try {
    console.log('🎮 Steam API: Fetching app list');
    
    const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/');
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter out unwanted content
    const filteredApps = data.applist.apps.filter(app => 
      app.name && 
      app.name.trim().length > 0 &&
      !app.name.toLowerCase().includes('soundtrack') &&
      !app.name.toLowerCase().includes('demo') &&
      !app.name.toLowerCase().includes('trailer')
    );
    
    res.json({ applist: { apps: filteredApps } });
    
  } catch (error) {
    console.error('Steam API error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/steam/app/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const { cc = 'US', l = 'en' } = req.query;
    
    console.log(`🎮 Steam API: Fetching app details for ${appId}`);
    
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${cc}&l=${l}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const appData = data[appId];
    
    if (appData && appData.success && appData.data) {
      // Filter out non-games and mature content
      if (appData.data.type !== 'game') {
        return res.json({ [appId]: { success: false, data: null } });
      }
      
      if (appData.data.required_age >= 18) {
        console.log(`Filtering out mature content: ${appData.data.name}`);
        return res.json({ [appId]: { success: false, data: null } });
      }
    }
    
    res.json(data);
    
  } catch (error) {
    console.error(`Steam API error for app ${req.params.appId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/steam/featured', async (req, res) => {
  try {
    console.log('🎮 Steam API: Fetching featured games');
    
    const response = await fetch('https://store.steampowered.com/api/featured/');
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Steam featured games error:', error);
    res.status(500).json({ error: error.message });
  }
});

// YouTube API proxy endpoints
app.get('/api/youtube/search', async (req, res) => {
  try {
    const apiKey = process.env.VITE_YOUTUBE_API_KEY;
    
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      return res.status(400).json({ 
        error: 'YouTube API key not configured',
        configured: false 
      });
    }
    
    const { q, maxResults = 8, order = 'relevance', videoDuration = 'medium' } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    console.log(`📺 YouTube API: Searching for "${q}"`);
    
    const params = new URLSearchParams({
      part: 'snippet',
      q: q,
      type: 'video',
      maxResults: maxResults,
      order: order,
      videoDuration: videoDuration,
      videoDefinition: 'high',
      key: apiKey,
      safeSearch: 'moderate'
    });
    
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('YouTube API error:', response.status, errorData);
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// IGDB API proxy endpoints
app.post('/api/igdb/token', async (req, res) => {
  try {
    const clientId = process.env.VITE_IGDB_CLIENT_ID;
    const clientSecret = process.env.VITE_IGDB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret || 
        clientId === 'your_twitch_client_id_here' || 
        clientSecret === 'your_twitch_client_secret_here') {
      return res.status(400).json({ 
        error: 'IGDB credentials not configured',
        configured: false 
      });
    }
    
    console.log('🎮 IGDB: Fetching access token');
    
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    });
    
    if (!response.ok) {
      throw new Error(`IGDB token error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('IGDB token error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/igdb/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { authorization } = req.headers;
    const clientId = process.env.VITE_IGDB_CLIENT_ID;
    
    if (!clientId || clientId === 'your_twitch_client_id_here') {
      return res.status(400).json({ 
        error: 'IGDB client ID not configured',
        configured: false 
      });
    }
    
    if (!authorization) {
      return res.status(400).json({ error: 'Authorization header required' });
    }
    
    console.log(`🎮 IGDB API: ${endpoint} request`);
    
    const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error(`IGDB ${req.params.endpoint} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Nutaku API proxy endpoints
app.get('/api/nutaku/search', async (req, res) => {
  try {
    const apiKey = process.env.VITE_NUTAKU_API_KEY;

    if (!apiKey || apiKey === 'your_nutaku_api_key_here') {
      return res.status(400).json({
        error: 'Nutaku API key not configured',
        configured: false
      });
    }

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 Nutaku API: Searching for "${q}"`);

    // Note: Nutaku doesn't have a public API yet
    // This is a placeholder for when/if they release one
    // For now, return empty results
    res.json([]);

  } catch (error) {
    console.error('Nutaku API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DLsite API proxy endpoints
app.get('/api/dlsite/search', async (req, res) => {
  try {
    const apiKey = process.env.VITE_DLSITE_API_KEY;

    if (!apiKey || apiKey === 'your_dlsite_api_key_here') {
      return res.status(400).json({
        error: 'DLsite API key not configured',
        configured: false
      });
    }

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 DLsite API: Searching for "${q}"`);

    // Note: DLsite has limited API access
    // This is a placeholder for affiliate API integration
    // For now, return empty results
    res.json([]);

  } catch (error) {
    console.error('DLsite API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Itch.io API proxy endpoints
app.get('/api/itch/search', async (req, res) => {
  try {
    const apiKey = process.env.VITE_ITCH_API_KEY;

    if (!apiKey || apiKey === 'your_itch_api_key_here') {
      return res.status(400).json({
        error: 'Itch.io API key not configured',
        configured: false
      });
    }

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🎮 Itch.io API: Searching for "${q}"`);

    // Itch.io has a public API
    const response = await fetch(`https://itch.io/api/1/${apiKey}/search/games?query=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'GameHub/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Itch.io API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Itch.io API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// F95Zone scraper endpoint (use cautiously - web scraping)
app.get('/api/f95zone/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 F95Zone: Search request for "${q}" (scraping not implemented)`);

    // F95Zone doesn't have a public API and web scraping may violate ToS
    // Return empty results for now
    res.json([]);

  } catch (error) {
    console.error('F95Zone scraper error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Adult Video Platform Search Endpoints
// ======================================

// Pornhub search endpoint (web scraping)
app.get('/api/pornhub/search', async (req, res) => {
  try {
    console.log('[DEBUG] VITE_ADULT_CONTENT_ENABLED:', process.env.VITE_ADULT_CONTENT_ENABLED);
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';
    console.log('[DEBUG] adultContentEnabled:', adultContentEnabled);

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false,
        debug: {
          env: process.env.VITE_ADULT_CONTENT_ENABLED,
          check: process.env.VITE_ADULT_CONTENT_ENABLED === 'true'
        }
      });
    }

    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 Pornhub: Searching for "${q}"`);

    // Use web scraping
    const data = await scrapePornhubSearch(q, parseInt(limit));

    res.json(data);

  } catch (error) {
    console.error('Pornhub search error:', error);
    res.status(500).json({ error: error.message, videos: [] });
  }
});

// xVideos search endpoint (web scraping)
app.get('/api/xvideos/search', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 xVideos: Searching for "${q}"`);

    // Use web scraping
    const data = await scrapeXVideosSearch(q, parseInt(limit));

    res.json(data);

  } catch (error) {
    console.error('xVideos search error:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// RedTube search endpoint (web scraping)
app.get('/api/redtube/search', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 RedTube: Searching for "${q}"`);

    // Use web scraping
    const data = await scrapeRedTubeSearch(q, parseInt(limit));

    res.json(data);

  } catch (error) {
    console.error('RedTube search error:', error);
    res.status(500).json({ error: error.message, videos: [], count: 0 });
  }
});

// xHamster search endpoint (web scraping)
app.get('/api/xhamster/search', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`🔞 xHamster: Searching for "${q}"`);

    // Use web scraping
    const data = await scrapeXHamsterSearch(q, parseInt(limit));

    res.json(data);

  } catch (error) {
    console.error('xHamster search error:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Video details endpoints with playable URLs
// ==========================================

// Pornhub video details with playable URL
app.get('/api/pornhub/video/:videoId', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { videoId } = req.params;
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter required' });
    }

    console.log(`🎬 Pornhub: Getting video details for ${videoId}`);

    const details = await getPornhubVideoDetails(videoId, pageUrl);

    res.json(details);

  } catch (error) {
    console.error('Pornhub video details error:', error);
    res.status(500).json({ error: error.message });
  }
});

// xVideos video details with playable URL
app.get('/api/xvideos/video/:videoId', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { videoId } = req.params;
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter required' });
    }

    console.log(`🎬 xVideos: Getting video details for ${videoId}`);

    const details = await getXVideosVideoDetails(videoId, pageUrl);

    res.json(details);

  } catch (error) {
    console.error('xVideos video details error:', error);
    res.status(500).json({ error: error.message });
  }
});

// RedTube video details with playable URL
app.get('/api/redtube/video/:videoId', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { videoId } = req.params;
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter required' });
    }

    console.log(`🎬 RedTube: Getting video details for ${videoId}`);

    const details = await getRedTubeVideoDetails(videoId, pageUrl);

    res.json(details);

  } catch (error) {
    console.error('RedTube video details error:', error);
    res.status(500).json({ error: error.message });
  }
});

// xHamster video details with playable URL
app.get('/api/xhamster/video/:videoId', async (req, res) => {
  try {
    const adultContentEnabled = process.env.VITE_ADULT_CONTENT_ENABLED === 'true';

    if (!adultContentEnabled) {
      return res.status(403).json({
        error: 'Adult content is disabled',
        enabled: false
      });
    }

    const { videoId } = req.params;
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter required' });
    }

    console.log(`🎬 xHamster: Getting video details for ${videoId}`);

    const details = await getXHamsterVideoDetails(videoId, pageUrl);

    res.json(details);

  } catch (error) {
    console.error('xHamster video details error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const apiStatus = {
    youtube: !!(process.env.VITE_YOUTUBE_API_KEY && process.env.VITE_YOUTUBE_API_KEY !== 'your_youtube_api_key_here'),
    igdb: !!(process.env.VITE_IGDB_CLIENT_ID && process.env.VITE_IGDB_CLIENT_ID !== 'your_twitch_client_id_here'),
    steam: true, // Steam doesn't require API key for basic endpoints
    rawg: !!(process.env.VITE_RAWG_API_KEY && process.env.VITE_RAWG_API_KEY !== 'your_rawg_api_key_here'),
    nutaku: !!(process.env.VITE_NUTAKU_API_KEY && process.env.VITE_NUTAKU_API_KEY !== 'your_nutaku_api_key_here'),
    dlsite: !!(process.env.VITE_DLSITE_API_KEY && process.env.VITE_DLSITE_API_KEY !== 'your_dlsite_api_key_here'),
    itch: !!(process.env.VITE_ITCH_API_KEY && process.env.VITE_ITCH_API_KEY !== 'your_itch_api_key_here'),
    adultContentEnabled: process.env.VITE_ADULT_CONTENT_ENABLED === 'true',
    adultVideoPlatforms: {
      pornhub: true, // Public API available
      redtube: true, // Public API available
      xvideos: false, // Requires scraping
      xhamster: false // Requires scraping
    }
  };

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GameHub Media Proxy Server',
    apis: apiStatus
  });
});

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle React routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GameHub server running on port ${PORT}`);
  console.log(`📦 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔞 Adult Content: ${process.env.VITE_ADULT_CONTENT_ENABLED === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔗 Media proxy: http://localhost:${PORT}/api/proxy-media`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

export default app;