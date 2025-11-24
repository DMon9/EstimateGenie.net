import { Hono } from 'hono';
import type { Env } from '../index';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export const authRoutes = new Hono<{ Bindings: Env }>();

export const generateToken = (userId: number, secret: string): string => {
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const authenticateToken = async (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
};

authRoutes.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Please enter a valid email address' }, 400);
    }

    // Validate password strength
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Validate name
    if (name.trim().length < 2) {
      return c.json({ error: 'Name must be at least 2 characters long' }, 400);
    }

    const existingUser = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase().trim()).first();
    if (existingUser) {
      return c.json({ error: 'User already exists with this email' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const joinedDate = new Date().toLocaleDateString();

    const result = await c.env.DB.prepare(
      'INSERT INTO users (name, email, password, tier, joined_date, pdf_downloads, quote_breakdowns) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(name.trim(), email.toLowerCase().trim(), hashedPassword, 'free', joinedDate, 0, 0).run();

    const userId = result.meta.last_row_id;
    const token = generateToken(userId, c.env.JWT_SECRET);

    const user = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      tier: 'free',
      joinedDate,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      pdfDownloads: 0,
      quoteBreakdowns: 0
    };

    return c.json({ user, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed. Please try again.' }, 500);
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password as string);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = generateToken(user.id as number, c.env.JWT_SECRET);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      joinedDate: user.joined_date,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      pdfDownloads: user.pdf_downloads,
      quoteBreakdowns: user.quote_breakdowns || 0
    };

    return c.json({ user: userData, token });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

authRoutes.get('/user', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return c.json({ error: 'Access token required' }, 401);
    }

    const userId = await authenticateToken(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 403);
    }

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      joinedDate: user.joined_date,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      pdfDownloads: user.pdf_downloads,
      quoteBreakdowns: user.quote_breakdowns || 0
    };

    return c.json(userData);
  } catch (error: any) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user data' }, 500);
  }
});

// Route to increment quote breakdown usage
authRoutes.post('/increment-quote', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return c.json({ error: 'Access token required' }, 401);
    }

    const userId = await authenticateToken(token, c.env.JWT_SECRET);
    if (!userId) {
      return c.json({ error: 'Invalid or expired token' }, 403);
    }

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if user has reached their limit
    const currentBreakdowns = user.quote_breakdowns || 0;
    
    if (user.tier === 'free' && currentBreakdowns >= 3) {
      return c.json({ error: 'You have reached your free quote limit. Upgrade to Pro for unlimited quotes.' }, 403);
    }

    // Increment the count
    await c.env.DB.prepare('UPDATE users SET quote_breakdowns = quote_breakdowns + 1 WHERE id = ?').bind(userId).run();

    const newCount = currentBreakdowns + 1;
    const remaining = user.tier === 'free' ? 3 - newCount : -1;

    return c.json({ 
      success: true, 
      quoteBreakdowns: newCount,
      remaining: remaining
    });
  } catch (error: any) {
    console.error('Increment quote error:', error);
    return c.json({ error: 'Failed to track quote usage' }, 500);
  }
});
