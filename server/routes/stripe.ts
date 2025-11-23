import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('CRITICAL: STRIPE_SECRET_KEY is not set!');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

router.post('/create-payment-intent', authenticateToken, async (req: AuthRequest, res: Response) => {
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
        userId: req.userId?.toString(),
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

router.post('/confirm-upgrade', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Verify the tier from payment intent metadata (trusted source)
    const tier = paymentIntent.metadata.tier;
    const paymentUserId = paymentIntent.metadata.userId;

    // Validate tier
    if (!tier || !['pro', 'business'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier in payment metadata' });
    }

    // Verify the payment belongs to this user
    if (paymentUserId !== req.userId?.toString()) {
      return res.status(403).json({ error: 'Payment does not belong to this user' });
    }
      
    // Update user tier in database
    const db = (await import('../db')).default;
    db.prepare('UPDATE users SET tier = ? WHERE id = ?').run(tier, req.userId);
    
    // Return updated user data
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
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
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    });
  }
});

export default router;
