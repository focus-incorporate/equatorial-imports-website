# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Equatorial Imports is a Next.js 15 e-commerce website for a premium coffee importing business in Seychelles. The main application is located in `equatorial-imports-website/`.

## Development Commands

All commands should be run from the `equatorial-imports-website/` directory:

```bash
# Start development server with Turbopack
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Run tests in watch mode
npm test:watch
```

## Architecture & Technology Stack

- **Next.js 15.3.4** with App Router and Turbopack
- **React 19** with TypeScript 5
- **Tailwind CSS 3** with custom coffee-themed design system
- **Three.js** with React Three Fiber for 3D GLB model animations
- **Framer Motion 12.18.1** for animations
- **Context API** with useReducer for cart state management

## Key Architectural Patterns

### State Management
- Global cart state via React Context (`src/lib/CartContext.tsx`)
- useReducer pattern for complex cart operations
- Type-safe actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART

### Component Architecture
- Functional components with hooks
- Client components marked with `'use client'`
- Server components for static pages (about, contact)
- Reusable UI components in `src/components/`

### Data Layer
- Static product catalog in `src/data/products.ts`
- Two brands: Daniel's Blend (capsules) and Viaggio Espresso (beans/capsules)
- Centralized TypeScript types in `src/types/index.ts`

## Important File Locations

**Core Files:**
- `src/app/layout.tsx` - Root layout with CartProvider and fonts
- `src/lib/CartContext.tsx` - Global cart state management
- `src/data/products.ts` - Product catalog (10 coffee products)
- `src/types/index.ts` - TypeScript interfaces and types

**Components:**
- `src/components/3d/FallingBeans.tsx` - Enhanced GLB coffee bean animation (2.5x scale, constrained to hero section)
- `src/components/3d/FallingBeansClient.tsx` - SSR-safe wrapper for 3D components
- `src/components/3d/SimpleFallingBeans.tsx` - Geometric fallback for 3D models
- `src/components/CartDrawer.tsx` - Shopping cart sidebar
- `src/components/ProductCard.tsx` - Product display with add-to-cart
- `src/components/Navbar.tsx` - Navigation with cart counter

**Styling:**
- `tailwind.config.js` - Custom coffee/cream/seychelles color themes
- `src/app/globals.css` - Global styles and utility classes

## Custom Design System

### Color Palette
- **Coffee theme**: 50-950 scale (light to dark brown)
- **Cream theme**: Warm beige/yellow tones  
- **Seychelles theme**: Teal/turquoise colors

### Custom Animations
- `float` - Hero element animations
- `bean-fall` - 3D coffee bean effects
- `pulse-slow` - Emphasis animations

### Utility Classes
- `.text-gradient` - Coffee-themed text gradients
- `.glass-effect` - Glassmorphism styling
- `.coffee-shadow` - Themed drop shadows
- `.hover-lift` - Interactive hover effects

## Production Features

- **Complete checkout flow** with customer information collection
- **Working contact form** with API route and validation
- **SEO optimized** with metadata, sitemap, and robots.txt
- **Error handling** with custom 404 and error pages
- **Loading states** and accessibility improvements
- **Testing framework** with Jest and React Testing Library
- **Form validation** throughout the application

## Configuration Notes

- **Images unoptimized** (`next.config.ts`) for static deployment
- **No Docker configuration** - standard Node.js deployment
- **API routes** for contact form and order processing
- **Cash-on-delivery only** payment method
- **Order storage** in localStorage (production would use database)

## Development Workflow

1. **Linting**: Use `npm run lint` before commits
2. **Build verification**: Run `npm run build` to check production build
3. **Component patterns**: Follow existing functional component patterns
4. **State management**: Use CartContext for cart operations
5. **Styling**: Use Tailwind classes and custom design tokens
6. **3D components**: Use React Three Fiber patterns from FallingBeans with GLB model loading

## 3D GLB Models

### Implementation Details
- **GLB Files**: Located in `/public/images/` directory
  - `Falling coffee beans.glb` (2.7MB)
  - `coffee beans falling mid-air.glb` (3.8MB)
- **Positioning**: Constrained to hero section with `absolute inset-0`
- **Scale**: Enhanced 2.5x scale for better visibility
- **Lighting**: Multi-light setup with coffee-themed colors
- **Performance**: Preloaded models with proper disposal and error handling

### Testing 3D Components
- Use Puppeteer for automated 3D scene testing
- Verify WebGL context initialization
- Monitor GLB loading status (HTTP 200 responses)
- Screenshot capture for visual verification

## Email System Status

**Current Status:** ⚠️ Development/Testing Mode
- Resend API integrated with test credentials  
- Email sending configured but requires domain verification for production
- See `DEPLOYMENT_CHECKLIST.md` for complete pre-deployment requirements

**Production Requirements:**
- Domain verification for `equatorialimports.sc`
- DNS records configuration (SPF/DKIM)  
- Business email addresses setup
- 3-5 days lead time for DNS propagation

## MCP Tools Integration

This project works with the following MCP servers for enhanced development:
- **Context7** (port 8080) - Documentation and context management
- **Playwright** (port 8080) - Testing and automation workflows  
- **Sequential Thinking** (port 8081) - Structured analysis workflows