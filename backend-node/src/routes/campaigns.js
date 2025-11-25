import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';
import { sendTestEmail } from '../services/emailService.js';

const router = express.Router();

// List campaigns
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM campaigns', (err, campaigns) => {
    if (err) {
      return res.status(500).json({ detail: 'Database error' });
    }
    res.json(campaigns || []);
  });
});

// Create campaign
router.post('/', verifyToken, (req, res) => {
  const { name, template_id, send_rate } = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO campaigns (id, name, template_id, send_rate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, template_id, send_rate || 10, now, now],
    function(err) {
      if (err) {
        return res.status(500).json({ detail: 'Failed to create campaign' });
      }

      db.get('SELECT * FROM campaigns WHERE id = ?', [id], (err, campaign) => {
        if (err) {
          return res.status(500).json({ detail: 'Database error' });
        }
        res.status(201).json(campaign);
      });
    }
  );
});

// Start campaign
router.post('/:id/start', verifyToken, (req, res) => {
  const now = new Date().toISOString();

  db.run(
    'UPDATE campaigns SET status = ?, updated_at = ? WHERE id = ?',
    ['sending', now, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ detail: 'Failed to start campaign' });
      }
      res.json({ status: 'sending' });
    }
  );
});

// Pause campaign
router.post('/:id/pause', verifyToken, (req, res) => {
  const now = new Date().toISOString();

  db.run(
    'UPDATE campaigns SET status = ?, updated_at = ? WHERE id = ?',
    ['paused', now, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ detail: 'Failed to pause campaign' });
      }
      res.json({ status: 'paused' });
    }
  );
});

// Send test email
router.post('/:id/send_test', verifyToken, (req, res) => {
  const { test_email } = req.body;
  const campaignId = req.params.id;

  db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId], (err, campaign) => {
    if (err || !campaign) {
      return res.status(404).json({ detail: 'Campaign not found' });
    }

    db.get('SELECT * FROM templates WHERE id = ?', [campaign.template_id], (err, template) => {
      if (err || !template) {
        return res.status(404).json({ detail: 'Template not found' });
      }

      sendTestEmail(test_email, template).then(result => {
        res.json(result);
      }).catch(err => {
        res.status(500).json({ detail: err.message });
      });
    });
  });
});

// Delete campaign
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ detail: 'Failed to delete campaign' });
    }
    res.json({ status: 'deleted' });
  });
});

export default router;
