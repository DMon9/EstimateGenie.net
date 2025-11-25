# EstimateGenie - AI-Powered Project Estimation

A full-stack web application that uses AI to analyze project images and generate detailed cost estimates, timelines, and material breakdowns. Built with React, TypeScript, Express, and deployed on Cloudflare.

## 🌐 Live Deployment

- **Frontend**: https://976ea7ff.estimate-genie.pages.dev
- **Backend API**: https://estimate-genie-api.thesportsdugout.workers.dev
- **Production Domain**: https://estimategenie.net

## ⚡ Quick Start

### Option 1: Local Development with VS Code (Recommended)

**Prerequisites**: Node.js 18+, Git

```bash
# Clone the repository
git clone https://github.com/DMon9/EstimateGenie.net.git
cd EstimateGenie.net

# Run setup script (Windows or macOS/Linux)
# Windows:
setup.bat

# macOS/Linux:
chmod +x setup.sh
./setup.sh

# Start development servers
npm run dev:all
```

Access at: **http://localhost:5000**

### Option 2: Cloud Development with Replit

1. Go to [Replit.com](https://replit.com)
2. Click "Create" → "Import from GitHub"
3. Paste: `https://github.com/DMon9/EstimateGenie.net.git`
4. Add secrets in Replit (JWT_SECRET, API keys)
5. Click "Run" to start

## 📚 Documentation

- **[Replit + VS Code Integration](./REPLIT_VSCODE_INTEGRATION.md)** ⭐ START HERE - Complete setup guide for dual environment
- **[Cloudflare Deployment](./CLOUDFLARE_DEPLOYMENT.md)** - Production deployment
- **[VS Code Setup](./VSCODE-SETUP.md)** - IDE configuration
- **[Project Architecture](./replit.md)** - Technical overview

## 🚀 Features

- ✨ **AI-Powered Analysis** - Upload images for intelligent cost estimates
- 📊 **Detailed Breakdowns** - Cost ranges, materials, timelines, suggestions
- 👤 **User Authentication** - Secure JWT with persistent sessions
- 💳 **Payment Processing** - Stripe integration for tier upgrades
- 📧 **Email Integration** - Send estimates via Resend
- 📄 **PDF Export** - Download quotes (3 free/month for Free tier)
- 📈 **Visualization** - Interactive charts and graphs
- 🔐 **Secure** - Encrypted passwords, API key protection, CORS

## 🛠 Tech Stack

### Frontend
- React 19.2.0 + TypeScript
- Vite 6.2.0 (lightning-fast builds)
- TailwindCSS styling
- Recharts for visualization
- Stripe.js payments

### Backend
- Express 5.1.0 + TypeScript
- SQLite (dev) / Cloudflare D1 (prod)
- JWT + bcrypt authentication
- Resend email service

### Deployment
- Cloudflare Pages (Frontend)
- Cloudflare Workers (Backend)
- Cloudflare D1 (Database)

## 🎯 Development

### Quick Commands

```bash
npm run dev:all      # Start frontend + backend
npm run dev          # Frontend only (port 5000)
npm run dev:server   # Backend only (port 3001)
npm run build        # Production build
npm run deploy:workers   # Deploy backend
npm run deploy:pages     # Deploy frontend
```

### Environment Setup

**Frontend (.env.local)**:
```env
VITE_API_URL=http://localhost:3001
VITE_GEMINI_API_KEY=your_gemini_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend (.env)**:
```env
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=your_resend_key
STRIPE_SECRET_KEY=sk_test_...
```

### Test Account

```
Email: test@example.com
Password: password123
```

### Test Stripe Card

```
Number: 4242 4242 4242 4242
Exp: Any future date (MM/YY)
CVC: Any 3 digits
```

## 📊 Subscription Tiers

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Quote Breakdowns | 3/month | Unlimited | Unlimited |
| PDF Downloads | 3/month | Unlimited | Unlimited |
| Core Features | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |
| Price | Free | $29/mo | $99/mo |

## 🔐 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens valid for 7 days
- Environment variables for all secrets
- CORS protection enabled
- API key separation (public vs private)
- No sensitive data in version control

## 📦 Project Structure

```
EstimateGenie.net/
├── components/          # React components
│   ├── AuthModal.tsx
│   ├── PaymentModal.tsx
│   └── ...
├── services/           # API clients
│   ├── emailService.ts
│   ├── geminiService.ts
│   └── ...
├── server/             # Express backend
│   ├── routes/
│   ├── middleware/
│   ├── db.ts
│   └── index.ts
├── workers/            # Cloudflare Workers
│   ├── routes/
│   └── index.ts
├── migrations/         # Database migrations
├── App.tsx            # Main React app
├── vite.config.ts     # Vite config
└── wrangler.toml      # Cloudflare config
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
# Creates optimized bundle in dist/
```

### Deploy to Cloudflare

```bash
# Deploy backend (Workers)
npm run deploy:workers

# Deploy frontend (Pages)
npm run deploy:pages
```

### Set Production Secrets

In Cloudflare Dashboard:

**Workers Secrets**:
- JWT_SECRET
- GEMINI_API_KEY
- RESEND_API_KEY
- STRIPE_SECRET_KEY

**Pages Environment**:
- VITE_API_URL
- VITE_GEMINI_API_KEY
- VITE_STRIPE_PUBLISHABLE_KEY

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 🆘 Troubleshooting

**Frontend doesn't load?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend connection failed?**
- Ensure .env has all required secrets
- Check that backend is running on port 3001
- Verify VITE_API_URL in .env.local

**Database errors?**
```bash
rm users.db
npm run dev:server
```

## 📝 License

Proprietary - All rights reserved

## 👥 Author

- **GitHub**: [@DMon9](https://github.com/DMon9)
- **Website**: https://estimategenie.net

---

**Last Updated**: November 25, 2025

Built with ❤️ for construction professionals | Powered by AI 🤖
