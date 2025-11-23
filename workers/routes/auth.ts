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

    const existingUser = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return c.json({ error: 'User already exists with this email' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const joinedDate = new Date().toLocaleDateString();

    const result = await c.env.DB.prepare(
      'INSERT INTO users (name, email, password, tier, joined_date, pdf_downloads) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(name, email, hashedPassword, 'free', joinedDate, 0).run();

    const userId = result.meta.last_row_id;
    const token = generateToken(userId, c.env.JWT_SECRET);

    const user = {
      id: userId,
      name,
      email,
      tier: 'free',
      joinedDate,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      pdfDownloads: 0
    };

    return c.json({ user, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
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
      pdfDownloads: user.pdf_downloads
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
      pdfDownloads: user.pdf_downloads
    };

    return c.json(userData);
  } catch (error: any) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user data' }, 500);
  }
});
