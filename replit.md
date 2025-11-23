# Estimate Genie

## Overview
Estimate Genie is an AI-powered construction/project estimation application built with React, TypeScript, Vite, and Express. It uses Google's Gemini API to analyze project images and generate detailed cost estimates, timelines, and material breakdowns, with real integrations for authentication, email, and payment processing.

## Project State
- **Status**: Full-stack application with real API integrations
- **Last Updated**: November 23, 2025
- **Framework**: React 19.2.0 with TypeScript, Vite 6.2.0, Express backend
- **Ports**: Frontend 5000, Backend 3001
- **Deployment**: Configured for autoscale deployment

## Recent Changes
- November 23, 2025: **Converted from mock services to real integrations**
  - Added Express backend (port 3001) with JWT authentication
  - Integrated Resend for real email delivery
  - Integrated Stripe for payment processing
  - Created SQLite database for user management
  - Implemented authentication state persistence with JWT tokens
  - Fixed security issue: separated Stripe secret key (backend) from publishable key (frontend)
  - Added payment confirmation flow that persists tier upgrades to database
  - Configured Vite proxy to route /api requests to backend

- November 22, 2025: Initial GitHub import and Replit environment setup
  - Updated Vite config to use port 5000 with proper HMR configuration
  - Configured workflow for frontend development server
  - Set up GEMINI_API_KEY secret for AI functionality
  - Configured deployment with build and preview commands

## Tech Stack
### Frontend
- **Framework**: React 19.2.0, TypeScript 5.8.2, Vite 6.2.0
- **AI/ML**: Google Gemini API (@google/genai)
- **Payment**: Stripe.js (@stripe/stripe-js, @stripe/react-stripe-js)
- **Charting**: Recharts 3.4.1
- **PDF Generation**: jsPDF 2.5.1, html2canvas 1.4.1
- **Icons**: Lucide React 0.554.0

### Backend
- **Runtime**: Node.js with TypeScript (tsx)
- **Framework**: Express 5.1.0
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken) with bcrypt password hashing
- **Email**: Resend API
- **Payment**: Stripe API

## Project Architecture

### Directory Structure
```
/
├── components/          # React components
│   ├── AuthModal.tsx    # Login/register with real API
│   ├── PaymentModal.tsx # Stripe payment integration
│   └── ...
├── services/           # Frontend API services
│   ├── emailService.ts  # Resend email integration
│   └── geminiService.ts # Google Gemini AI
├── server/             # Express backend (NEW)
│   ├── index.ts        # Main server file
│   ├── db.ts           # SQLite database setup
│   ├── middleware/
│   │   └── auth.ts     # JWT authentication middleware
│   └── routes/
│       ├── auth.ts     # Login/register endpoints
│       ├── email.ts    # Email sending endpoint
│       └── stripe.ts   # Payment processing endpoints
├── App.tsx            # Main application with auth persistence
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite config with /api proxy
```

### Key Features
1. **User Authentication**: JWT-based auth with SQLite user storage
2. **Image-based Analysis**: Upload project images for AI analysis
3. **Cost Estimation**: AI-generated cost breakdowns with min/max ranges
4. **Timeline Generation**: Project phases with tasks and durations
5. **Material Lists**: Automatic material identification
6. **Real Email Integration**: Send estimates via Resend API
7. **Payment Processing**: Stripe integration for Pro/Business upgrades
8. **PDF Export**: Client-side PDF generation with tier limits
9. **Data Visualization**: Charts and graphs for cost breakdowns

### API Endpoints
- **POST /api/auth/register** - Create new user account
- **POST /api/auth/login** - Login and receive JWT token
- **GET /api/auth/user** - Get authenticated user data (requires JWT)
- **POST /api/email/send-quote** - Send quote via Resend
- **POST /api/stripe/create-payment-intent** - Create Stripe payment
- **POST /api/stripe/confirm-upgrade** - Confirm payment and upgrade tier (requires JWT)

### Database Schema
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  tier TEXT DEFAULT 'free',  -- 'free', 'pro', 'business'
  joined_date TEXT NOT NULL,
  pdf_downloads INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Environment Variables & Secrets
**Required Secrets** (stored in Replit Secrets):
- **GEMINI_API_KEY**: Google Gemini API key for AI analysis
- **JWT_SECRET**: Secret key for signing JWT tokens
- **RESEND_API_KEY**: Resend API key for email delivery
- **STRIPE_SECRET_KEY**: Stripe secret key (backend only - never exposed to client)

**Environment Variables**:
- **VITE_GEMINI_API_KEY**: Mapped from GEMINI_API_KEY via .env.local (client-side)
- **VITE_STRIPE_PUBLISHABLE_KEY**: Stripe publishable key (client-side, safe to expose)

**Security Notes**:
- Stripe has two keys: secret key (backend only) and publishable key (frontend safe)
- JWT tokens stored in localStorage and included in Authorization headers
- Passwords hashed with bcrypt (10 rounds) before storage
- User authentication state persists across page refreshes via JWT

## Development

### Running Locally
The app automatically starts both frontend and backend via workflow:
- Command: `npm run dev:all`
- Frontend Port: 5000 (webview)
- Backend Port: 3001 (proxied via Vite)

### Manual Commands
```bash
npm install            # Install dependencies
npm run dev:all        # Start both frontend and backend
npm run dev            # Frontend only
npm run dev:server     # Backend only
npm run build          # Build for production
npm run preview        # Preview production build
```

### Database Management
Database file: `users.db` (created automatically on first run)
- Location: Project root directory
- Schema auto-creates on server startup
- No migrations needed for current schema

## Deployment
Configured for Replit autoscale deployment:
- Build: `npm run build`
- Run: `npx vite preview --port 5000 --host 0.0.0.0`
- Note: Backend deployment config needs to be added separately

## User Preferences
None specified yet.

## Notes
- Frontend and backend run concurrently in development
- Vite proxy routes `/api/*` requests to backend (localhost:3001)
- Email sending requires valid Resend API key
- Stripe requires both secret key (backend) and publishable key (frontend)
- Test Stripe card: 4242 4242 4242 4242 (any future expiry, any CVC)
- PDF generation happens client-side
- Authentication persists across page refreshes via JWT tokens
