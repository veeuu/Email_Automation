import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/database.js';
import authRoutes from './routes/auth.js';
import templatesRoutes from './routes/templates.js';
import campaignsRoutes from './routes/campaigns.js';
import subscribersRoutes from './routes/subscribers.js';
import analyticsRoutes from './routes/analytics.js';
import trackingRoutes from './routes/tracking.js';
import workflowsRoutes from './routes/workflows.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: [
    'https://proplusdata.co',
    'https://www.proplusdata.co',
    'http://localhost:3000',
    'http://localhost:8000'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/templates', templatesRoutes);
app.use('/campaigns', campaignsRoutes);
app.use('/subscribers', subscribersRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/tracking', trackingRoutes);
app.use('/workflows', workflowsRoutes);
app.use('/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

export default app;
