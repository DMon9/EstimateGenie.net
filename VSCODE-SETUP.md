# Estimate Genie - VSCode Setup Instructions

## Installation

1. **Extract the project files**
   - Extract the `estimate-genie-project.tar.gz` file to your desired location
   - Open the extracted folder in VSCode

2. **Install Node.js**
   - Make sure you have Node.js 18+ installed
   - Check version: `node --version`

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   - Get your API key from: https://ai.google.dev/

5. **Run the development server**
   ```bash
   npm run dev
   ```
   - The app will open at `http://localhost:5173` (Vite's default port)

6. **Build for production**
   ```bash
   npm run build
   ```
   - Built files will be in the `dist` folder

## Project Structure

```
/
├── components/          # React components
├── services/           # API and business logic
├── utils/             # Utility functions
├── App.tsx            # Main app component
├── index.tsx          # Entry point
├── types.ts           # TypeScript definitions
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies
```

## Features

- **AI-Powered Estimates**: Upload project images for cost analysis
- **Timeline Generation**: Phased project schedules
- **Material Lists**: Automatic material identification
- **PDF Export**: Downloadable quotes
- **Visualization**: Charts and design suggestions

## Security Note

This app makes client-side API calls to Google Gemini. The API key will be exposed in the browser bundle. For production use:
- Add HTTP referrer restrictions to your API key in Google Cloud Console
- Consider implementing a backend proxy to secure the API key

## Tech Stack

- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Google Gemini API
- Recharts for visualizations
- jsPDF for PDF generation

## Support

For issues or questions about the original project, visit the GitHub repository.
