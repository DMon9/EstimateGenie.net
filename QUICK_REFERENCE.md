# EstimateGenie - Quick Reference

## 🚀 Getting Started

### First Time Setup

```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh
./setup.sh
```

### Daily Development

```bash
npm run dev:all
# Frontend: http://localhost:5000
# Backend: http://localhost:3001
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Frontend environment variables |
| `.env` | Backend secrets (NEVER commit) |
| `EstimateGenie.code-workspace` | VS Code workspace file |
| `REPLIT_VSCODE_INTEGRATION.md` | Setup guide |
| `.replit` | Replit configuration |

## 🔧 Environment Variables

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:3001
VITE_GEMINI_API_KEY=your_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env)

```
JWT_SECRET=your-secret
GEMINI_API_KEY=your_key
RESEND_API_KEY=your_key
STRIPE_SECRET_KEY=sk_test_...
```

## 🧪 Testing

### Test Account

- Email: <test@example.com>
- Password: password123

### Test Stripe

- Card: 4242 4242 4242 4242
- Exp: Any future date
- CVC: Any 3 digits

## 📝 npm Commands

```bash
npm run dev              # Frontend only
npm run dev:server      # Backend only
npm run dev:all         # Both (recommended)
npm run build           # Production build
npm run preview         # Preview build
npm run deploy:workers  # Deploy backend
npm run deploy:pages    # Deploy frontend
```

## 🌐 Live URLs

- **Dev Frontend**: <http://localhost:5000>
- **Dev Backend**: <http://localhost:3001>
- **Production**: <https://976ea7ff.estimate-genie.pages.dev>

## 🐛 Common Issues

### Port already in use

```bash
# Kill process on port 5000 (macOS/Linux)
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or change port
npm run dev -- --port 5001
```

### Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database issues

```bash
rm users.db
npm run dev:server
```

## 📚 Documentation

- `REPLIT_VSCODE_INTEGRATION.md` - Complete setup guide
- `CLOUDFLARE_DEPLOYMENT.md` - Deployment guide
- `replit.md` - Project architecture
- `README.md` - Project overview

## 🔐 Security Checklist

- ✅ Never commit .env files
- ✅ Keep API keys confidential
- ✅ Use environment variables for secrets
- ✅ Review .gitignore before committing
- ✅ Rotate secrets regularly in production

## 🎯 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
git add .
git commit -m "feat: description"

# Push
git push origin feature/your-feature

# Create PR on GitHub
```

## 💡 Pro Tips

1. Use VS Code workspace: `File → Open Workspace from File → EstimateGenie.code-workspace`
2. Install recommended extensions when prompted
3. Use Thunder Client extension for API testing
4. Check SQLite database with SQLite extension
5. Use GitLens for commit history

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend won't load | `npm install && npm run dev` |
| Backend won't connect | Check .env has all secrets |
| Port in use | Kill process or change port |
| Database locked | Delete users.db, restart backend |
| Git conflicts | Pull latest, resolve conflicts, commit |

## 📊 Architecture Overview

```
GitHub (Source)
    ↓
    ├→ VS Code (Local Dev) ← Recommended
    │   ├ Frontend: port 5000
    │   └ Backend: port 3001
    │
    └→ Replit (Cloud Dev)
        ├ Frontend: online
        └ Backend: online
        
    ↓ (Deploy)
    
    Cloudflare
    ├ Workers (Backend API)
    ├ Pages (Frontend)
    └ D1 (Database)
```

## 📞 Need Help?

1. Check `REPLIT_VSCODE_INTEGRATION.md` for detailed setup
2. Review error messages in browser console
3. Check terminal output for backend errors
4. Verify all environment variables are set
5. Try clearing cache: `npm cache clean --force`

---

**Last Updated**: November 25, 2025
