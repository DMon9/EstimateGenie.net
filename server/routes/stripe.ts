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
    const { paymentIntentId, userId, tier } = req.body;

    if (!paymentIntentId || !tier) {
      return res.status(400).json({ error: 'Payment intent ID and tier are required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // In a real app, you'd update the user's tier in the database here
      // For now, we'll just confirm the payment was successful
      res.json({ 
        success: true, 
        tier,
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
