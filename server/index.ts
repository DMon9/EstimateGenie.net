import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import emailRoutes from './routes/email';
import stripeRoutes from './routes/stripe';

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'RESEND_API_KEY', 'STRIPE_SECRET_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('CRITICAL: Missing required environment variables:', missingVars.join(', '));
  console.error('Server cannot start without these variables. Please configure them in Replit Secrets.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
