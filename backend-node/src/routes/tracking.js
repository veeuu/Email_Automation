import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// Track email opens
router.get('/pixel', (req, res) => {
  const { subscriber_id, campaign_id } = req.query;

  if (!subscriber_id || !campaign_id) {
    // Return 1x1 transparent pixel
    const pixel = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
      0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x0a,
      0x00, 0x01, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
      0x01, 0x00, 0x3b
    ]);
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(pixel);
  }

  // Record open event
  db.run(
    `INSERT INTO events (id, subscriber_id, campaign_id, event_type, created_at)
     VALUES (?, ?, ?, 'open', datetime('now'))`,
    [uuidv4(), subscriber_id, campaign_id],
    (err) => {
      if (err) {
        console.error('Error recording open:', err);
      }

      // Return 1x1 transparent GIF pixel
      const pixel = Buffer.from([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
        0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
        0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x0a,
        0x00, 0x01, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
        0x01, 0x00, 0x3b
      ]);
      res.set('Content-Type', 'image/gif');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(pixel);
    }
  );
});

// Track link clicks
router.get('/click', (req, res) => {
  const { subscriber_id, campaign_id, url } = req.query;

  if (!subscriber_id || !campaign_id || !url) {
    return res.status(400).json({ detail: 'Missing required parameters' });
  }

  // Record click event
  db.run(
    `INSERT INTO events (id, subscriber_id, campaign_id, event_type, event_data, created_at)
     VALUES (?, ?, ?, 'click', ?, datetime('now'))`,
    [uuidv4(), subscriber_id, campaign_id, JSON.stringify({ url })],
    (err) => {
      if (err) {
        console.error('Error recording click:', err);
      }

      // Redirect to actual URL
      res.redirect(decodeURIComponent(url));
    }
  );
});

// Track unsubscribes
router.get('/unsubscribe', (req, res) => {
  const { campaign_id, subscriber_id } = req.query;

  if (!subscriber_id) {
    return res.status(400).json({ detail: 'Missing subscriber_id' });
  }

  // Record unsubscribe event
  db.run(
    `INSERT INTO events (id, subscriber_id, campaign_id, event_type, created_at)
     VALUES (?, ?, ?, 'unsubscribe', datetime('now'))`,
    [uuidv4(), subscriber_id, campaign_id || null],
    (err) => {
      if (err) {
        console.error('Error recording unsubscribe:', err);
      }

      // Update subscriber status
      db.run(
        `UPDATE subscribers SET status = 'unsubscribed' WHERE id = ?`,
        [subscriber_id],
        (err) => {
          if (err) {
            console.error('Error updating subscriber:', err);
          }

          res.json({ message: 'Successfully unsubscribed' });
        }
      );
    }
  );
});

export default router;
