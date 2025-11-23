# Cloudflare Deployment - Quick Start

Follow these steps to deploy Estimate Genie to Cloudflare:

## 1. Login to Cloudflare

```bash
npm run cf:login
```

## 2. Create Database

```bash
npm run d1:create
```

**Important**: Copy the `database_id` from the output and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "estimate-genie-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

## 3. Run Migration

```bash
npm run d1:migrate
```

## 4. Set Secrets

```bash
wrangler secret put JWT_SECRET
# Enter your JWT secret

wrangler secret put GEMINI_API_KEY  
# Enter your Gemini API key

wrangler secret put RESEND_API_KEY
# Enter your Resend API key

wrangler secret put STRIPE_SECRET_KEY
# Enter your Stripe secret key (sk_test_...)
```

## 5. Deploy Workers Backend

```bash
npm run deploy:workers
```

**Save the Workers URL** (e.g., `https://estimate-genie-api.YOUR-SUBDOMAIN.workers.dev`)

## 6. Configure Frontend

Create `.env.production` file:

```env
VITE_API_URL=https://estimate-genie-api.YOUR-SUBDOMAIN.workers.dev
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RIEWqENa3zBKoIjQbfwhkNr3v48thZR85jxY8t7uARH5HYJUpWIoSNC8ZVfwZCtgJHdTqryaR5AJU6JKmF0stqW00b91VZKYq
```

## 7. Build Frontend

```bash
npm run build
```

## 8. Deploy to Cloudflare Pages

### Via Cloudflare Dashboard (Recommended):
1. Go to https://dash.cloudflare.com → Pages
2. Create new project → Connect to Git
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
4. Add environment variables from step 6
5. Deploy!

### Or via CLI:
```bash
npm run deploy:pages
```

## Done! 🎉

Your app is now live on Cloudflare:
- **Backend API**: `https://estimate-genie-api.YOUR-SUBDOMAIN.workers.dev`
- **Frontend**: `https://estimate-genie.pages.dev`

## Test Your Deployment

1. Visit your Pages URL
2. Register a new account
3. Upload a test image
4. Check email delivery
5. Test payment with card: `4242 4242 4242 4242`

## Troubleshooting

If something doesn't work:

1. **Check Workers logs**: `wrangler tail`
2. **View D1 data**: `npm run d1:query -- --command="SELECT * FROM users"`
3. **Verify secrets**: Make sure all 4 secrets are set
4. **Check CORS**: Ensure Pages URL is allowed in Workers

For detailed troubleshooting, see `CLOUDFLARE_DEPLOYMENT.md`.
