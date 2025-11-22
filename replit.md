# Estimate Genie

## Overview
Estimate Genie is an AI-powered construction/project estimation application built with React, TypeScript, and Vite. It uses Google's Gemini API to analyze project images and generate detailed cost estimates, timelines, and material breakdowns.

## Project State
- **Status**: Successfully imported and configured for Replit environment
- **Last Updated**: November 22, 2025
- **Framework**: React 19.2.0 with TypeScript and Vite 6.2.0
- **Port**: 5000 (frontend webview)
- **Deployment**: Configured for autoscale deployment

## Recent Changes
- November 22, 2025: Initial GitHub import and Replit environment setup
  - Updated Vite config to use port 5000 with proper HMR configuration
  - Configured workflow for frontend development server
  - Set up GEMINI_API_KEY secret for AI functionality
  - Configured deployment with build and preview commands

## Tech Stack
- **Frontend**: React 19.2.0, TypeScript 5.8.2, Vite 6.2.0
- **AI/ML**: Google Gemini API (@google/genai)
- **Charting**: Recharts 3.4.1
- **PDF Generation**: jsPDF 2.5.1, html2canvas 1.4.1
- **Icons**: Lucide React 0.554.0

## Project Architecture

### Directory Structure
```
/
├── components/          # React components
│   ├── AuthModal.tsx
│   ├── NotificationToast.tsx
│   ├── PaymentModal.tsx
│   ├── PricingModal.tsx
│   ├── ProjectInput.tsx
│   ├── QuoteDisplay.tsx
│   ├── UserProfile.tsx
│   └── Visualizer.tsx
├── services/           # API and business logic
│   ├── emailService.ts
│   └── geminiService.ts
├── utils/             # Utility functions
│   └── fileUtils.ts
├── App.tsx            # Main application component
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite configuration
```

### Key Features
1. **Image-based Analysis**: Upload project sketches/images for AI analysis
2. **Cost Estimation**: AI-generated cost breakdowns with min/max ranges
3. **Timeline Generation**: Project phases with tasks and durations
4. **Material Lists**: Automatic material identification and suggestions
5. **Design Suggestions**: AI-powered design style recommendations
6. **PDF Export**: Generate downloadable quote PDFs
7. **Email Integration**: Send estimates via email (simulated)
8. **Data Visualization**: Charts and graphs for cost breakdowns

### Environment Variables
- **GEMINI_API_KEY**: Required Replit secret for Google Gemini API access
  - Automatically mapped to `VITE_GEMINI_API_KEY` via `.env.local` for Vite to expose to the client
  - The app uses `import.meta.env.VITE_GEMINI_API_KEY` to access the key at runtime
  - **Security Note**: This is a client-side application that makes direct API calls to Google Gemini from the browser. The API key is exposed in the built bundle when using VITE_ prefixed environment variables. This is suitable for personal/development use with API key restrictions (e.g., HTTP referrer restrictions) but NOT recommended for production apps with sensitive keys. For production, consider implementing a backend proxy to keep API keys secure.

## Development

### Running Locally
The app automatically starts via the configured workflow:
- Command: `npm run dev`
- Port: 5000
- View: Webview

### Manual Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment
Configured for Replit autoscale deployment:
- Build: `npm run build`
- Run: `npx vite preview --port 5000 --host 0.0.0.0`

## User Preferences
None specified yet.

## Notes
- The email service is currently simulated (console logs only)
- No backend server required - frontend-only application
- Uses Gemini API for all AI functionality
- PDF generation happens client-side
