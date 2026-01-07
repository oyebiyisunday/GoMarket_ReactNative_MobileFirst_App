# GoMarket

> A multi-sided marketplace and business management platform built with React Native and Expo

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000. svg)](https://expo.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

GoMarket is a comprehensive marketplace platform that enables businesses to manage products, inventory, sales, staff, and analytics, while providing customers with a seamless shopping experience across partner stores.  Built with a single codebase that runs on Web, iOS, and Android. 

## ✨ Key Features

### For Businesses
- 📦 Product management and lifecycle tracking
- 📊 Inventory and supply chain monitoring
- 👥 Staff management and role-based access control
- 💰 Sales tracking and end-of-day reports
- 📈 Real-time analytics and performance dashboards

### For Customers
- 🏪 Partner store discovery
- 🔍 Unified product search across catalogs
- 🛒 Shopping cart and seamless checkout
- 📱 Order tracking and status updates

## 🏗️ Architecture

```
├── Frontend/          # Expo app (React Native + TypeScript)
│   ├── app/          # Expo Router file-based routing
│   ├── components/   # Shared UI components
│   ├── store/        # Redux state management
│   └── services/     # API integration
├── backend/          # Express API (TypeScript)
│   ├── src/
│   │   ├── routes/   # REST API endpoints
│   │   ├── middleware/
│   │   └── db/       # Database queries
│   └── migrations/   # SQL schema migrations
├── docs/             # Technical documentation
└── scripts/          # Development automation
```

## 🚀 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Expo + React Native + TypeScript | Single codebase for Web, iOS, Android with type safety |
| **Navigation** | Expo Router | File-based routing with segmented layouts |
| **State Management** | Redux Toolkit | Predictable state with easy slice composition |
| **Backend** | Express + TypeScript | Reliable, type-safe REST API |
| **Database** | PostgreSQL (Supabase) | Managed Postgres with backups and operational tooling |
| **DB Client** | `pg` (direct SQL) | Full control over queries, managed migrations |
| **Hosting** | Railway (API) + Vercel (Web) | Scalable deployment with CDN distribution |

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL database (Supabase recommended)
- iOS Simulator (Mac only) or Android Studio (optional)

## 🛠️ Installation

### Clone the repository

```bash
git clone https://github.com/oyebiyisunday/GoMarket_ReactNative_MobileFirst_App. git
cd GoMarket_ReactNative_MobileFirst_App
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp Frontend/.env.example Frontend/.env. local

# Configure your environment variables
# Edit Frontend/.env.local with your API endpoint
EXPO_PUBLIC_API_BASE=http://localhost:4000/api
```

### Backend Setup

```bash
# Install backend dependencies (if backend/ is included)
npm install --prefix backend

# Copy environment template
cp backend/.env.example backend/.env

# Configure your environment variables
# Edit backend/.env
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

### Database Setup

```bash
# Run migrations (if backend is included)
cd backend
npm run migrate

# Or apply SQL migrations manually to your Postgres instance
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

## 🎯 Quick Start

### Development Mode

**Option 1: Frontend Only (Current Repo)**

```bash
# Start web development server
npm start
# or
npm run frontend:web

# Start iOS simulator
npm run frontend:ios

# Start Android emulator
npm run frontend:android
```

**Option 2: Full Stack (with Backend)**

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd Frontend
npm run web
```

**Option 3: Automated (Windows)**

```bash
# Start both backend and frontend
.\scripts\start-all.ps1 -BackendPort 4000
```

### Production Build

```bash
# Build web app
npm run frontend:build

# Build native apps
cd Frontend
eas build --platform ios
eas build --platform android
```

## 📱 Platform Support

| Platform | Status | Command |
|----------|--------|---------|
| Web | ✅ Production | `npm run frontend:web` |
| iOS | ✅ Production | `npm run frontend:ios` |
| Android | ✅ Production | `npm run frontend:android` |

## 🔐 Authentication

GoMarket uses JWT-based authentication with role-based access control:

- **Business accounts**: Access to inventory, staff, and analytics dashboards
- **Customer accounts**: Access to shopping, orders, and store discovery
- Token persistence with secure storage
- Automatic route guarding based on user roles


## 🧪 Testing

```bash
# Run frontend tests
npm run frontend:test

# Run backend tests (if included)
npm run backend:test

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Frontend (Vercel)

```bash
# Deploy to Vercel
cd Frontend
vercel --prod
```

### Backend (Railway)

```bash
# Deploy to Railway
cd backend
railway up
```

For detailed deployment instructions, see [docs/deployment-ops.md](docs/deployment-ops.md).

## 🗺️ Roadmap

- [ ] Push notifications for order updates
- [ ] Multi-language support
- [ ] Advanced analytics dashboards
- [ ] Payment gateway integrations
- [ ] Vendor onboarding automation
- [ ] Real-time inventory sync

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sunday Oyebiyi** - [@oyebiyisunday](https://github.com/oyebiyisunday)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Database powered by [Supabase](https://supabase.com/)
- Hosted on [Railway](https://railway.app/) and [Vercel](https://vercel.com/)

## 📞 Support

For support, email oyebiyisunday@gmail.com or reach out via my LinkedIn (Sunday Oyebiyi) 

---

**Note**: This repository currently contains only the frontend application under `Frontend/`. The `backend/` directory is referenced in documentation but not included in this snapshot. Root npm scripts now target the frontend exclusively (`npm start` runs `npm run frontend:web`).
