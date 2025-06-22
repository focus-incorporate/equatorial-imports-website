# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Equatorial Imports is a comprehensive Next.js 15 e-commerce system for a premium coffee importing business in Seychelles. The project includes both a customer-facing website and a complete admin management system with POS (Point of Sale) functionality.

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

### Frontend
- **Next.js 15.3.4** with App Router and Turbopack
- **React 19** with TypeScript 5
- **Tailwind CSS 3** with custom coffee-themed design system
- **Three.js** with React Three Fiber for 3D GLB model animations
- **Framer Motion 12.18.1** for animations
- **Context API** with useReducer for cart state management

### Backend & Database
- **Prisma ORM** with SQLite database for development
- **NextAuth.js** for authentication and session management
- **bcryptjs** for password hashing
- **Database migrations** with automatic seeding
- **Real-time inventory management**

### Admin System
- **Complete POS (Point of Sale) system** with transaction processing
- **Inventory management** with stock tracking and low-stock alerts
- **Customer management** with loyalty points system
- **Order management** with status tracking and fulfillment
- **Analytics dashboard** with sales reporting and insights
- **Invoice generation** for orders and POS transactions
- **User management** with role-based access control

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
- **Database-driven product catalog** with real-time stock synchronization
- **Dynamic product API** (`/api/products`) serving website and admin systems
- **Two brands**: Daniel's Blend (capsules) and Viaggio Espresso (beans/capsules)
- **Centralized TypeScript types** in `src/types/index.ts`
- **Automatic database seeding** with sample data for development

## Important File Locations

**Core Files:**
- `src/app/layout.tsx` - Root layout with CartProvider and fonts
- `src/lib/CartContext.tsx` - Global cart state management
- `src/lib/database.ts` - Database connection and seeding functions
- `src/lib/auth.ts` - Authentication configuration with NextAuth.js
- `src/types/index.ts` - TypeScript interfaces and types
- `prisma/schema.prisma` - Database schema with all models and relationships

**Website Components:**
- `src/components/3d/FallingBeans.tsx` - Enhanced GLB coffee bean animation (2.5x scale, constrained to hero section)
- `src/components/3d/FallingBeansClient.tsx` - SSR-safe wrapper for 3D components
- `src/components/3d/SimpleFallingBeans.tsx` - Geometric fallback for 3D models
- `src/components/CartDrawer.tsx` - Shopping cart sidebar
- `src/components/ProductCard.tsx` - Product display with add-to-cart
- `src/components/Navbar.tsx` - Navigation with cart counter

**Admin Components:**
- `src/components/admin/layout/AdminLayout.tsx` - Admin panel layout wrapper
- `src/components/admin/layout/AdminSidebar.tsx` - Navigation sidebar with all admin links
- `src/components/admin/pos/POSInterface.tsx` - Complete POS system interface
- `src/components/admin/pos/Receipt.tsx` - Professional receipt component with print functionality
- `src/components/admin/pos/RefundModal.tsx` - Full and partial refund processing
- `src/components/admin/dashboard/POSTransactions.tsx` - Recent transactions widget for dashboard

**Admin Pages:**
- `src/app/(admin)/admin/dashboard/page.tsx` - Main admin dashboard with analytics
- `src/app/(admin)/admin/pos/page.tsx` - Point of Sale system
- `src/app/(admin)/admin/pos-transactions/page.tsx` - POS transaction management with refunds
- `src/app/(admin)/admin/invoices/page.tsx` - Unified invoice listing (orders + POS)
- `src/app/(admin)/admin/invoice/[id]/page.tsx` - Individual invoice view/print
- `src/app/(admin)/admin/products/page.tsx` - Product inventory management
- `src/app/(admin)/admin/orders/page.tsx` - Online order management
- `src/app/(admin)/admin/customers/page.tsx` - Customer management
- `src/app/(admin)/admin/analytics/page.tsx` - Sales analytics and reporting

**API Routes:**
- `src/app/api/products/route.ts` - Dynamic product API for website
- `src/app/api/orders/route.ts` - Order creation and management
- `src/app/api/admin/pos/transaction/route.ts` - POS transaction processing
- `src/app/api/admin/pos/refund/[transactionId]/route.ts` - Refund processing
- `src/app/api/admin/pos/receipt/[transactionId]/route.ts` - Receipt data and print status
- `src/app/api/admin/pos/transactions/route.ts` - POS transaction listing
- `src/app/api/admin/invoice/[id]/route.ts` - Invoice data for orders and POS
- `src/app/api/admin/analytics/route.ts` - Sales analytics data

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

### Website Features
- **Complete checkout flow** with customer information collection
- **Real-time inventory** with stock synchronization
- **Working contact form** with API route and validation
- **SEO optimized** with metadata, sitemap, and robots.txt
- **Error handling** with custom 404 and error pages
- **Loading states** and accessibility improvements
- **Form validation** throughout the application

### Admin System Features
- **Complete POS system** with transaction processing, receipt printing, and refunds
- **Inventory management** with automatic stock updates and low-stock alerts
- **Order management** with status tracking and customer communication
- **Customer database** with loyalty points and purchase history
- **Analytics dashboard** with sales insights and performance metrics
- **Invoice generation** for both online orders and POS transactions
- **User authentication** with role-based access control (admin, manager, staff)
- **Database migrations** with automatic seeding for development

### Business Operations
- **Multi-channel sales** (online orders + in-store POS)
- **Unified inventory** across all sales channels
- **Professional receipts** and invoices with company branding
- **Refund processing** with inventory restoration
- **Sales analytics** combining online and POS data
- **Customer loyalty program** with points tracking

## Configuration Notes

- **Images unoptimized** (`next.config.ts`) for static deployment
- **SQLite database** for development (easily migrated to PostgreSQL/MySQL for production)
- **API routes** for all business operations (orders, POS, inventory, analytics)
- **Authentication fallbacks** for development/testing environments
- **Database seeding** automatically creates sample data on first run
- **Real-time stock management** across all sales channels

## Development Workflow

1. **Linting**: Use `npm run lint` before commits
2. **Build verification**: Run `npm run build` to check production build
3. **Database setup**: Database automatically seeds on first API call
4. **Component patterns**: Follow existing functional component patterns
5. **State management**: Use CartContext for cart operations, Prisma for data persistence
6. **Styling**: Use Tailwind classes and custom design tokens
7. **Authentication**: APIs include fallback authentication for development
8. **3D components**: Use React Three Fiber patterns from FallingBeans with GLB model loading

## Database Schema

The system uses Prisma ORM with the following key models:

- **Users**: Admin accounts with role-based permissions (admin, manager, staff)
- **Products**: Inventory with real-time stock tracking
- **Customers**: Customer database with loyalty points
- **Orders**: Online orders with items and status tracking
- **POSTransactions**: In-store sales with payment processing
- **Invoices**: Unified invoicing for orders and POS sales
- **InventoryTransactions**: Stock movement tracking
- **ActivityLogs**: Audit trail for all system actions

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

## Admin System Access

**Default Admin Account:**
- Email: `admin@equatorialimports.sc`
- Password: `admin123`
- Role: Admin (full system access)

**Access URL:** `/admin/login`

**Key Admin Features:**
- **Dashboard**: Overview of sales, orders, and inventory
- **POS System**: Complete point-of-sale with receipt printing and refunds
- **Product Management**: Inventory control with stock tracking
- **Order Management**: Process and fulfill customer orders
- **Customer Database**: Manage customers and loyalty points
- **Analytics**: Sales reports and business insights
- **Invoice System**: Professional invoices for all transactions

## Email System Status

**Current Status:** ⚠️ Development/Testing Mode
- Resend API integrated with test credentials  
- Email sending configured but requires domain verification for production
- Order confirmation emails working for admin address

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