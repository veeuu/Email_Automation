import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}
