import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

function createAccessToken(userId) {
  return jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: '30m' });
}

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ detail: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const isPasswordValid = await verifyPassword(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const accessToken = createAccessToken(user.id);
    res.json({ access_token: accessToken, token_type: 'bearer' });
  });
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  const userId = req.user.sub;

  db.get('SELECT id, email, full_name, role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ detail: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }

    res.json(user);
  });
});

export default router;
