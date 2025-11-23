import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const joinedDate = new Date().toLocaleDateString();

    const result = db.prepare(
      'INSERT INTO users (name, email, password, tier, joined_date, pdf_downloads) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, email, hashedPassword, 'free', joinedDate, 0);

    const userId = result.lastInsertRowid as number;
    const token = generateToken(userId);

    const user = {
      id: userId,
      name,
      email,
      tier: 'free',
      joinedDate,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      pdfDownloads: 0
    };

    res.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      joinedDate: user.joined_date,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      pdfDownloads: user.pdf_downloads
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/user', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

export default router;
