import express from 'express';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get overall analytics
router.get('/', verifyToken, (req, res) => {
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM send_logs WHERE status = 'sent') as totalSent,
      (SELECT COUNT(*) FROM events WHERE event_type = 'open') as totalOpened,
      (SELECT COUNT(*) FROM events WHERE event_type = 'click') as totalClicked,
      (SELECT COUNT(*) FROM events WHERE event_type = 'unsubscribe') as totalUnsubscribed`,
    (err, result) => {
      if (err) {
        return res.status(500).json({ detail: 'Database error'});
      }

      res.json({
        totalSent: result?.totalSent || 0,
        totalOpened: result?.totalOpened || 0,
        totalClicked: result?.totalClicked || 0,
        totalUnsubscribed: result?.totalUnsubscribed || 0
      });
    }
  );
});

export default router;
