# Equatorial Imports

A premium e-commerce website for Equatorial Imports, a coffee importing business based in Seychelles. Built with Next.js 15 and featuring stunning 3D coffee bean animations.

## 🌟 Features

- **Premium Coffee Catalog** - Two curated brands: Daniel's Blend and Viaggio Espresso
- **3D Interactive Animations** - GLB coffee bean models with Three.js/React Three Fiber
- **Complete Shopping Cart** - Add, remove, and manage coffee orders
- **Responsive Design** - Tailored for all devices with custom coffee-themed UI
- **Contact & Checkout** - Working contact form and order processing
- **SEO Optimized** - Metadata, sitemap, and search engine ready

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.4 with App Router and Turbopack
- **Frontend**: React 19 with TypeScript 5
- **Styling**: Tailwind CSS 3 with custom coffee/cream/seychelles themes
- **3D Graphics**: Three.js with React Three Fiber and Drei
- **Animations**: Framer Motion 12.18.1
- **State Management**: React Context with useReducer pattern
- **Testing**: Jest with React Testing Library + Playwright E2E

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/focus-incorporate/equatorial-imports-website.git
cd equatorial-imports-website

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint

# Testing
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── about/          # About page
│   ├── api/            # API routes (contact form)
│   ├── coffee/         # Coffee catalog page
│   ├── contact/        # Contact page
│   └── layout.tsx      # Root layout with CartProvider
├── components/
│   ├── 3d/             # Three.js components
│   │   ├── FallingBeans.tsx        # Main 3D GLB animation
│   │   ├── FallingBeansClient.tsx  # SSR-safe wrapper
│   │   └── SimpleFallingBeans.tsx  # Geometric fallback
│   ├── CartDrawer.tsx  # Shopping cart sidebar
│   ├── CheckoutModal.tsx # Order processing modal
│   ├── Navbar.tsx      # Navigation with cart counter
│   └── ProductCard.tsx # Product display component
├── data/
│   └── products.ts     # Product catalog (10 coffee varieties)
├── lib/
│   └── CartContext.tsx # Global cart state management
└── types/
    └── index.ts        # TypeScript interfaces
```

## 🎨 Design System

### Color Themes
- **Coffee**: 50-950 scale (light to dark brown)
- **Cream**: Warm beige/yellow tones
- **Seychelles**: Teal/turquoise accents

### Custom Components
- 3D GLB coffee bean animations (2.5x scale)
- Glassmorphism effects
- Coffee-themed gradients and shadows
- Interactive hover animations

## 🌐 3D Assets

The website features premium GLB coffee bean models:
- `Falling coffee beans.glb` (2.7MB)
- `coffee beans falling mid-air.glb` (3.8MB)

Located in `/public/images/` with optimized loading and error handling.

## 🧪 Testing

### Unit Tests
```bash
npm test                # Run all tests
npm run test:coverage   # Coverage reports
```

### E2E Tests  
```bash
npx playwright test     # Run E2E tests
```

Includes automated 3D scene testing with Puppeteer for GLB model verification.

## 📱 Deployment

The application is configured for static deployment:

```bash
npm run build          # Generates optimized production build
npm start              # Serves production build locally
```

Compatible with Vercel, Netlify, and other static hosting platforms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary to Equatorial Imports.

## 📞 Contact

For business inquiries: [Contact Equatorial Imports](http://localhost:3000/contact)

---

Built with ☕ in Seychelles | Powered by Next.js 15