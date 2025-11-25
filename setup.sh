#!/bin/bash
# EstimateGenie Development Environment Setup Script
# This script helps set up the project for local development with VS Code and Replit sync

set -e

echo "🚀 EstimateGenie Development Environment Setup"
echo "=============================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Environment Setup"
echo "===================="
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local (frontend environment)"
    cat > .env.local << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
EOF
    echo "✅ Created .env.local"
    echo "   ⚠️  Please update VITE_GEMINI_API_KEY and VITE_STRIPE_PUBLISHABLE_KEY in .env.local"
else
    echo "✅ .env.local already exists"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env (backend secrets)"
    cat > .env << 'EOF'
# Backend Secrets (NEVER commit this file!)
JWT_SECRET=your-jwt-secret-development
GEMINI_API_KEY=your_gemini_key_here
RESEND_API_KEY=your_resend_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
EOF
    echo "✅ Created .env"
    echo "   ⚠️  Please update all secret keys in .env"
else
    echo "✅ .env already exists"
fi

echo ""
echo "📚 VS Code Setup"
echo "================"
echo ""
echo "1. Open the workspace file in VS Code:"
echo "   File → Open Workspace from File → EstimateGenie.code-workspace"
echo ""
echo "2. Install recommended extensions:"
echo "   VS Code will prompt you to install recommended extensions"
echo "   Or manually install from the Extensions tab"
echo ""

echo ""
echo "🎯 Quick Start Commands"
echo "======================="
echo ""
echo "Start development servers:"
echo "  npm run dev:all          # Start both frontend and backend"
echo "  npm run dev              # Frontend only (port 5000)"
echo "  npm run dev:server       # Backend only (port 3001)"
echo ""
echo "Build for production:"
echo "  npm run build            # Build frontend bundle"
echo ""
echo "Deploy to production:"
echo "  npm run deploy:workers   # Deploy backend to Cloudflare"
echo "  npm run deploy:pages     # Deploy frontend to Cloudflare Pages"
echo ""

echo ""
echo "🔗 Testing URLs"
echo "==============="
echo ""
echo "Frontend: http://localhost:5000"
echo "Backend:  http://localhost:3001"
echo "API:      http://localhost:3001/api"
echo ""

echo ""
echo "📖 Documentation"
echo "==============="
echo ""
echo "Learn more about the project:"
echo "  - REPLIT_VSCODE_INTEGRATION.md  - Integration guide"
echo "  - CLOUDFLARE_DEPLOYMENT.md      - Deployment guide"
echo "  - VSCODE-SETUP.md               - VS Code setup"
echo "  - replit.md                     - Project overview"
echo ""

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env and .env.local with your API keys"
echo "2. Run: npm run dev:all"
echo "3. Open http://localhost:5000 in your browser"
echo "4. Start coding! 🎉"
echo ""
