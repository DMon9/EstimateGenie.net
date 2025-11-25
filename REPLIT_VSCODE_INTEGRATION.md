# Replit + VS Code Integration Guide

This guide explains how to work with EstimateGenie using both Replit and VS Code, maintaining synchronization between both environments.

## Architecture Overview

```
GitHub Repository
       ↓
    ↙   ↘
VS Code    Replit
(Local)    (Cloud)
   ↓         ↓
   └─────────┘
   (git sync)
```

## Setup: VS Code (Your Primary Development Environment)

### Prerequisites

- VS Code installed locally
- Node.js 18+ installed
- Git installed and configured

### Step 1: Clone the Repository

```bash
git clone https://github.com/DMon9/EstimateGenie.net.git
cd EstimateGenie.net
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

Create `.env.local` file with development keys:

```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3001
```

Create `.env` for backend secrets:

```env
JWT_SECRET=your-jwt-secret-dev
GEMINI_API_KEY=your_gemini_key_here
RESEND_API_KEY=your_resend_key_here
STRIPE_SECRET_KEY=sk_test_...
```

### Step 4: Start Development Environment

```bash
# Terminal 1: Frontend (port 5000)
npm run dev

# Terminal 2: Backend (port 3001)
npm run dev:server

# Or run both together
npm run dev:all
```

Access your app at: `http://localhost:5000`

### Step 5: Recommended VS Code Extensions

Install these extensions for optimal development:

1. **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
2. **TypeScript Vue Plugin** - Vue.volar
3. **Prettier - Code formatter** - esbenp.prettier-vscode
4. **ESLint** - dbaeumer.vscode-eslint
5. **Thunder Client** - rangav.vscode-thunder-client (for API testing)
6. **REST Client** - humao.rest-client
7. **SQLite** - alexcvzz.vscode-sqlite (for database inspection)
8. **GitLens** - eamodio.gitlens

## Setup: Replit (Backup/Cloud Development)

### Step 1: Import Project to Replit

1. Go to [Replit.com](https://replit.com)
2. Click "Create" → "Import from GitHub"
3. Paste: `https://github.com/DMon9/EstimateGenie.net.git`
4. Click "Import"

### Step 2: Configure Replit Secrets

In Replit, go to **Secrets** (lock icon) and add:

```
JWT_SECRET = your-jwt-secret
GEMINI_API_KEY = your_gemini_key_here
RESEND_API_KEY = your_resend_key_here
STRIPE_SECRET_KEY = sk_test_...
```

### Step 3: Start Replit Dev Server

Click "Run" to start the development server automatically.

Replit will run:

- Frontend on: `https://[replit-name].repl.co` (or custom domain)
- Backend proxied through Vite

## Workflow: Local Development (Recommended)

### Daily Development Loop

1. **Make changes in VS Code**

   ```bash
   # Edit files, test locally
   npm run dev:all
   ```

2. **Test the changes**
   - Frontend: <http://localhost:5000>
   - Backend: <http://localhost:3001>
   - API calls proxied through Vite

3. **Commit to Git**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin main
   ```

4. **Replit auto-updates** (if connected to GitHub)
   - Replit pulls latest changes automatically
   - Or manually pull with: `git pull origin main`

### Local Testing Checklist

- [ ] Frontend loads at <http://localhost:5000>
- [ ] Backend API responds at <http://localhost:3001>
- [ ] Can create account and log in
- [ ] Can upload image for analysis
- [ ] Email sending works
- [ ] Stripe test payment works with `4242 4242 4242 4242`
- [ ] PDF generation works
- [ ] Database stores user data properly

## Workflow: Using Both Environments

### When to Use VS Code (Local)

✅ **Best for:**

- Active development and debugging
- Testing complex features
- Database inspection with SQLite extension
- Performance profiling
- Working offline

### When to Use Replit

✅ **Best for:**

- Sharing work with team members (live URL)
- Running on consistent cloud environment
- Testing on mobile/different devices
- Quick hotfixes
- Demo/presentation environment

## Database Synchronization

### Local Database (users.db)

Located at project root. Created automatically on first backend start.

**Inspect with VS Code:**

1. Install "SQLite" extension
2. Open Command Palette → "SQLite: Open Database"
3. Select `users.db`
4. Browse tables and data

### Cloud Database (D1)

Cloudflare D1 database for production (estimate-genie-db).

**Query from terminal:**

```bash
wrangler d1 execute estimate-genie-db --command="SELECT * FROM users"
```

## File Synchronization

### What Gets Synced to Git

✅ **Synced:**

- Source code (`components/`, `services/`, `server/`, etc.)
- Configuration files (`vite.config.ts`, `tsconfig.json`, etc.)
- Migrations (`migrations/`)
- Documentation (`.md` files)

❌ **NOT Synced:**

- `node_modules/` (reinstalled on each environment)
- `.env` files (keep secrets locally)
- `users.db` (local dev database)
- Build output (`dist/`)
- `.wrangler/` directory

### .gitignore (Pre-configured)

Already configured to exclude sensitive files. Ensure these are present:

```
node_modules/
dist/
.env
.env.local
.env.*.local
users.db
.wrangler/
```

## API Testing

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create collection "EstimateGenie"
3. Add requests:

**POST Register**

```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**POST Login**

```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**GET User (requires token)**

```
GET http://localhost:3001/api/auth/user
Authorization: Bearer YOUR_JWT_TOKEN
```

### Using REST Client Extension

Create `requests.rest` file:

```rest
### Variables
@baseUrl = http://localhost:3001
@token = your_jwt_token_here

### Register
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get User
GET {{baseUrl}}/api/auth/user
Authorization: Bearer {{token}}
```

Right-click and select "Send Request"

## Deployment Strategy

### Development Branch

```bash
git checkout -b develop
# Make changes
git push origin develop
# Test in Replit
```

### Production Deployment

```bash
# Build locally
npm run build

# Deploy to Cloudflare
npm run deploy:workers   # Backend
npm run deploy:pages     # Frontend

# Tag release
git tag v1.0.0
git push --tags
```

## Troubleshooting

### Issue: "Cannot find module" error

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev:all
```

### Issue: Port already in use

**Solution:**

```bash
# Find process on port 5000
lsof -i :5000
# Kill it
kill -9 PID

# Or use different ports
npm run dev -- --port 5001
npm run dev:server -- --port 3002
```

### Issue: Environment variables not loading

**Solution:**

- Ensure `.env.local` is in root directory
- Restart dev servers after creating `.env.local`
- Check file permissions

### Issue: Database locks up

**Solution:**

```bash
# Delete and recreate
rm users.db
npm run dev:server
```

### Issue: Replit not syncing with GitHub

**Solution:**

- Go to Replit project settings
- Reconnect GitHub repository
- Or manually: `git pull origin main` in Replit console

## Git Workflow Best Practices

### Commit Messages

```bash
# Feature
git commit -m "feat: add quote limit tracking for free users"

# Bug fix
git commit -m "fix: resolve account creation validation error"

# Documentation
git commit -m "docs: update replit integration guide"

# Deployment
git commit -m "chore: deploy new version to production"
```

### Branch Strategy

```bash
# Main branch = Production
# Develop branch = Testing
# Feature branches = Development

git checkout -b feature/feature-name
# Make changes
git push origin feature/feature-name
# Create Pull Request on GitHub
# After review and tests pass, merge to main
```

## Performance Optimization

### Local Development

- Frontend build: ~30 seconds
- Backend startup: ~2 seconds
- Hot reload: ~3 seconds

### Replit

- May be slightly slower due to cloud resources
- Good for testing real-world latency
- Perfect for mobile testing

## Monitoring

### Local Logs

```bash
# Frontend logs
npm run dev
# Output: ✅ Connected to backend at http://localhost:3001

# Backend logs
npm run dev:server
# Output: Server listening on port 3001
```

### Replit Logs

View in Replit console, or:

```bash
# In Replit console
tail -f logs/server.log
```

## Advanced: Remote Debugging

### VS Code Remote SSH (Optional)

Connect VS Code directly to Replit for remote debugging:

1. Install "Remote - SSH" extension in VS Code
2. Configure SSH to Replit
3. Open Replit folder in VS Code
4. Debug directly on cloud instance

This enables true cloud development while using VS Code interface.

## Support & Troubleshooting

For issues:

1. Check error messages in dev console
2. Review `.env` file configuration
3. Verify all dependencies with `npm list`
4. Clear cache: `npm cache clean --force`
5. Reinstall: `rm -rf node_modules && npm install`

## Summary

✅ **VS Code for Local Development** - Recommended primary environment
✅ **Replit for Cloud Testing** - Testing and sharing
✅ **Git for Synchronization** - Keep everything in sync
✅ **Cloudflare Workers** - Production deployment
✅ **Teamwork Ready** - Replit URLs easy to share with team

You now have a complete setup for professional development! 🚀
