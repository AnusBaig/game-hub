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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'GameHub Media Proxy Server'
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