import { Hono } from 'hono';
import type { Env } from '../index';
import Stripe from 'stripe';
import { authenticateToken } from './auth';

export const stripeRoutes = new Hono<{ Bindings: Env }>();

const getStripe = (apiKey: string) => {
  return new Stripe(apiKey, {
    apiVersion: '2025-11-17.clover',
  });
};

stripeRoutes.post('/create-payment-intent', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userId = await authenticateToken(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 403);
    }

    const { tier } = await c.req.json();

    if (!tier || !['pro', 'business'].includes(tier)) {
      return c.json({ error: 'Valid tier (pro or business) is required' }, 400);
    }

    const amount = tier === 'pro' ? 2900 : 9900;
    const stripe = getStripe(c.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tier,
        userId: userId.toString(),
      },
    });

    return c.json({ 
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return c.json({ error: 'Failed to create payment intent', details: error.message }, 500);
  }
});

stripeRoutes.post('/confirm-upgrade', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userId = await authenticateToken(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 403);
    }

    const { paymentIntentId } = await c.req.json();

    if (!paymentIntentId) {
      return c.json({ error: 'Payment intent ID is required' }, 400);
    }

    const stripe = getStripe(c.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return c.json({ error: 'Payment not completed' }, 400);
    }

    const tier = paymentIntent.metadata.tier;
    const paymentUserId = paymentIntent.metadata.userId;

    if (!tier || !['pro', 'business'].includes(tier)) {
      return c.json({ error: 'Invalid tier in payment metadata' }, 400);
    }

    if (paymentUserId !== userId.toString()) {
      return c.json({ error: 'Payment does not belong to this user' }, 403);
    }
      
    await c.env.DB.prepare('UPDATE users SET tier = ? WHERE id = ?').bind(tier, userId).run();
    
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      joinedDate: user.joined_date,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      pdfDownloads: user.pdf_downloads
    };

    return c.json({ 
      success: true, 
      user: userData,
      message: 'Payment successful and tier upgraded'
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return c.json({ error: 'Failed to confirm payment', details: error.message }, 500);
  }
});
