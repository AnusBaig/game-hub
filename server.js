import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

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
    "media-src 'self' https://www.youtube.com https://youtube.com https://*.googlevideo.com https://media.rawg.io https://videos.rawg.io https://video.rawg.io blob: data:; " +
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
      'cdn.rawg.io'
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

    // Fetch the media from external source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GameHub/1.0 (Media Proxy)',
        'Accept': 'image/*,video/*,*/*',
      },
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

    // Set appropriate headers
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    if (contentLength) {
      res.set('Content-Length', contentLength);
    }

    // Stream the response
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const apiStatus = {
    youtube: !!(process.env.VITE_YOUTUBE_API_KEY && process.env.VITE_YOUTUBE_API_KEY !== 'your_youtube_api_key_here'),
    igdb: !!(process.env.VITE_IGDB_CLIENT_ID && process.env.VITE_IGDB_CLIENT_ID !== 'your_twitch_client_id_here'),
    steam: true, // Steam doesn't require API key for basic endpoints
    rawg: !!(process.env.VITE_RAWG_API_KEY && process.env.VITE_RAWG_API_KEY !== 'your_rawg_api_key_here')
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
  app.get('*', (req, res) => {
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
  console.log(`🔗 Media proxy: http://localhost:${PORT}/api/proxy-media`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

export default app;