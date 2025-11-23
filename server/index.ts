import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import emailRoutes from './routes/email';
import stripeRoutes from './routes/stripe';

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
