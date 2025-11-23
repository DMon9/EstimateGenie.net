import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { tier } = req.body;

    if (!tier || !['pro', 'business'].includes(tier)) {
      return res.status(400).json({ error: 'Valid tier (pro or business) is required' });
    }

    const amount = tier === 'pro' ? 2900 : 9900; // $29.00 or $99.00 in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tier,
      },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

router.post('/confirm-upgrade', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, tier } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!paymentIntentId || !tier) {
      return res.status(400).json({ error: 'Payment intent ID and tier are required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Verify JWT and get user ID
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      // Update user tier in database
      const db = (await import('../db')).default;
      db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, decoded.userId);
      
      // Return updated user data
      const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        joinedDate: user.joined_date,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        pdfDownloads: user.pdf_downloads
      };

      res.json({ 
        success: true, 
        user: userData,
        message: 'Payment successful and tier upgraded'
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    });
  }
});

export default router;
