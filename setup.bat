@echo off
REM EstimateGenie Development Environment Setup Script (Windows)
REM This script helps set up the project for local development with VS Code and Replit sync

setlocal enabledelayedexpansion

echo.
echo 🚀 EstimateGenie Development Environment Setup
echo ==============================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check Git
where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    exit /b 1
)

echo ✅ Git found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Environment Setup
echo ====================
echo.

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local (frontend environment)
    (
        echo # Frontend Environment Variables
        echo VITE_API_URL=http://localhost:3001
        echo VITE_GEMINI_API_KEY=your_gemini_key_here
        echo VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
    ) > .env.local
    echo ✅ Created .env.local
    echo    ⚠️  Please update VITE_GEMINI_API_KEY and VITE_STRIPE_PUBLISHABLE_KEY in .env.local
) else (
    echo ✅ .env.local already exists
)

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env (backend secrets^)
    (
        echo # Backend Secrets ^(NEVER commit this file!^)
        echo JWT_SECRET=your-jwt-secret-development
        echo GEMINI_API_KEY=your_gemini_key_here
        echo RESEND_API_KEY=your_resend_key_here
        echo STRIPE_SECRET_KEY=sk_test_your_key_here
    ) > .env
    echo ✅ Created .env
    echo    ⚠️  Please update all secret keys in .env
) else (
    echo ✅ .env already exists
)

echo.
echo 📚 VS Code Setup
echo ================
echo.
echo 1. Open the workspace file in VS Code:
echo    File → Open Workspace from File → EstimateGenie.code-workspace
echo.
echo 2. Install recommended extensions:
echo    VS Code will prompt you to install recommended extensions
echo    Or manually install from the Extensions tab
echo.

echo.
echo 🎯 Quick Start Commands
echo =======================
echo.
echo Start development servers:
echo   npm run dev:all          # Start both frontend and backend
echo   npm run dev              # Frontend only (port 5000^)
echo   npm run dev:server       # Backend only (port 3001^)
echo.
echo Build for production:
echo   npm run build            # Build frontend bundle
echo.
echo Deploy to production:
echo   npm run deploy:workers   # Deploy backend to Cloudflare
echo   npm run deploy:pages     # Deploy frontend to Cloudflare Pages
echo.

echo.
echo 🔗 Testing URLs
echo ===============
echo.
echo Frontend: http://localhost:5000
echo Backend:  http://localhost:3001
echo API:      http://localhost:3001/api
echo.

echo.
echo 📖 Documentation
echo ===============
echo.
echo Learn more about the project:
echo   - REPLIT_VSCODE_INTEGRATION.md  - Integration guide
echo   - CLOUDFLARE_DEPLOYMENT.md      - Deployment guide
echo   - VSCODE-SETUP.md               - VS Code setup
echo   - replit.md                     - Project overview
echo.

echo.
echo ✨ Setup Complete!
echo.
echo Next steps:
echo 1. Update .env and .env.local with your API keys
echo 2. Run: npm run dev:all
echo 3. Open http://localhost:5000 in your browser
echo 4. Start coding! 🎉
echo.

pause
