import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { emailRoutes } from './routes/email';
import { stripeRoutes } from './routes/stripe';

export interface Env {
  DB: any;
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  RESEND_API_KEY: string;
  STRIPE_SECRET_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: ['https://400b8f2b.estimate-genie.pages.dev', 'https://estimate-genie.pages.dev', 'https://estimategenie.net'],
  credentials: true
}));

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Cloudflare Workers API is running' });
});

app.route('/api/auth', authRoutes);
app.route('/api/email', emailRoutes);
app.route('/api/stripe', stripeRoutes);

export default app;
