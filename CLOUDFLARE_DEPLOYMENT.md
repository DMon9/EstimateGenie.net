# Cloudflare Deployment Guide

This guide will help you deploy Estimate Genie to Cloudflare using Workers (backend) and Pages (frontend).

## Prerequisites

1. Cloudflare account (sign up at https://cloudflare.com)
2. Wrangler CLI installed (already done: `npm install -g wrangler`)
3. Your Cloudflare API token

## Step 1: Authenticate with Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 2: Create Cloudflare D1 Database

```bash
wrangler d1 create estimate-genie-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "estimate-genie-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

## Step 3: Run Database Migration

```bash
wrangler d1 execute estimate-genie-db --file=./migrations/0001_initial_schema.sql
```

## Step 4: Set Environment Secrets

Set your secrets in Cloudflare Workers:

```bash
wrangler secret put JWT_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put STRIPE_SECRET_KEY
```

You'll be prompted to enter each secret value.

## Step 5: Deploy the Workers Backend

```bash
npm run deploy:workers
```

This will deploy your backend API to Cloudflare Workers. Note the deployed URL (e.g., `https://estimate-genie-api.YOUR-SUBDOMAIN.workers.dev`).

## Step 6: Update Frontend API URL

Update your frontend environment variables to point to the Workers API:

1. Create `.env.production`:
```env
VITE_API_URL=https://estimate-genie-api.YOUR-SUBDOMAIN.workers.dev
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 7: Build Frontend

```bash
npm run build
```

## Step 8: Deploy Frontend to Cloudflare Pages

### Option A: Automatic Git Integration (Recommended)

1. Go to Cloudflare Dashboard → Pages
2. Connect your Git repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Set environment variables in Pages settings:
   - `VITE_API_URL`
   - `VITE_GEMINI_API_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
5. Deploy!

### Option B: Manual Deployment with Wrangler

```bash
npx wrangler pages deploy dist --project-name=estimate-genie
```

## Step 9: Verify Deployment

1. Visit your Cloudflare Pages URL (e.g., `https://estimate-genie.pages.dev`)
2. Test user registration
3. Test AI analysis
4. Test email sending
5. Test Stripe payment with test card: `4242 4242 4242 4242`

## Environment Variables Summary

### Workers (Backend) - Set via `wrangler secret put`:
- `JWT_SECRET` - Secret key for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key (backend use only)
- `RESEND_API_KEY` - Resend email API key
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_test_...)

### Pages (Frontend) - Set in Cloudflare Pages settings:
- `VITE_API_URL` - Your Workers API URL
- `VITE_GEMINI_API_KEY` - Google Gemini API key (client-side use)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_test_...)

## Database Management

### View data:
```bash
wrangler d1 execute estimate-genie-db --command="SELECT * FROM users"
```

### Run custom queries:
```bash
wrangler d1 execute estimate-genie-db --command="YOUR SQL QUERY"
```

### Create new migration:
1. Create file in `migrations/` directory (e.g., `0002_add_feature.sql`)
2. Run: `wrangler d1 execute estimate-genie-db --file=./migrations/0002_add_feature.sql`

## Monitoring and Logs

View real-time logs:
```bash
wrangler tail
```

View analytics in Cloudflare Dashboard:
- Workers → Analytics
- Pages → Analytics

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your Workers API allows requests from your Pages domain.

### Database Not Found
Make sure you've created the D1 database and updated the database_id in wrangler.toml.

### Authentication Failing
Verify JWT_SECRET is set correctly in Workers secrets.

### Payment Failing
Check that STRIPE_SECRET_KEY (Workers) and VITE_STRIPE_PUBLISHABLE_KEY (Pages) are both set correctly and match (test vs live).

## Production Checklist

Before going live:
- [ ] Update all test API keys to live keys
- [ ] Set up custom domain in Cloudflare Pages
- [ ] Configure Stripe webhooks to point to your Workers URL
- [ ] Test all features thoroughly
- [ ] Set up monitoring and alerts
- [ ] Review D1 database backups
- [ ] Enable Cloudflare WAF rules for security
