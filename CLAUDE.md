# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Game Hub is a React + TypeScript + Vite application that serves as a game discovery platform. It integrates with the RAWG API to display game information, including details, screenshots, and trailers. The application features a modern component-based architecture with state management, routing, and responsive design.

## Development Commands

- `npm run dev` - Start Vite development server on port 3500
- `npm run dev:server` - Start Express proxy server on port 3501  
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview production build locally
- `npm start` - Start Express server for production (includes static file serving)

## Architecture Overview

### Frontend Architecture
- **Component Structure**: Organized by feature domains (game/, genre/, navbar/, utils/)
- **State Management**: Zustand for global state, TanStack Query for server state
- **Routing**: React Router v6 with nested routes (/games, /games/:id)
- **Styling**: Chakra UI with custom theme (dark mode default) + Bootstrap
- **API Integration**: Axios-based API client with RAWG API integration

### Backend Architecture
- **Express Proxy Server**: Handles CORS issues for external media downloads
- **Media Proxy Endpoint**: `/api/proxy-media` routes external image/video requests
- **Static File Serving**: Serves production build in deployment
- **Security**: Domain whitelist for allowed external media sources

### Key Architectural Patterns
- **Custom Hooks**: Reusable data fetching hooks (useGames, useGenres, etc.)
- **Generic API Client**: Centralized HTTP client with consistent error handling
- **Component Composition**: Container/presentational component pattern
- **State Normalization**: Centralized game query state management

## Technology Stack

- **React 18** - UI framework with concurrent features
- **TypeScript** - Type safety and development experience
- **Vite** - Build tool and development server (port 3500)
- **Chakra UI** - Component library with theming
- **TanStack Query** - Server state management and caching
- **Zustand** - Client state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Bootstrap** - Additional CSS framework
- **Framer Motion** - Animation library

## Project Structure

```
src/
├── components/           # Feature-organized components
│   ├── game/            # Game-related components
│   ├── genre/           # Genre-related components
│   ├── navbar/          # Navigation components
│   └── utils/           # Reusable utility components
├── hooks/               # Custom React hooks
│   ├── base/            # Base hook implementations
│   └── [domain]/        # Domain-specific hooks
├── models/              # TypeScript interfaces and types
│   ├── queries/         # Query parameter types
│   └── responses/       # API response types
├── pages/               # Route components
├── services/            # API clients and utilities
├── constants/           # Application constants
├── data/               # Static data
├── store.ts            # Zustand store configuration
├── theme.ts            # Chakra UI theme configuration
└── routes.tsx          # React Router configuration
```

## State Management

### Global State (Zustand)
- **GameQueryStore**: Manages filtering, sorting, and search parameters
- **GameTrailerStore**: Handles trailer-specific state

### Server State (TanStack Query)
- Automatic caching and background updates
- Optimistic updates and error handling
- DevTools integration for debugging

## API Integration

- **Base URL**: `https://api.rawg.io/api/`
- **Authentication**: API key in query params via environment variables
- **Endpoints**: Games, genres, platforms, screenshots, trailers
- **Pagination**: Infinite scroll implementation
- **Error Handling**: Consistent error boundaries and fallbacks

### Environment Setup

**Required Environment Variables:**
- `VITE_RAWG_API_KEY` - Your RAWG API key (get yours at https://rawg.io/apidocs)

**Setup Instructions:**
1. Copy `.env.example` to `.env.local`
2. Replace `your_rawg_api_key_here` with your actual RAWG API key
3. The application will automatically load the API key from environment variables

**File Priority:** `.env.local` > `.env` > defaults

## Development Notes

- **Port Configuration**: Development server runs on port 3500
- **Color Mode**: Dark mode is the default theme
- **Development Tools**: React Query DevTools and Zustand DevTools enabled
- **Image Optimization**: Custom image URL service for responsive images
- **SEO**: Dynamic page titles and metadata