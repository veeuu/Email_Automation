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
router.post('/:id/start', verifyToken, async (req, res) => {
  const campaignId = req.params.id;
  const now = new Date().toISOString();

  // Get campaign and template
  db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId], (err, campaign) => {
    if (err || !campaign) {
      return res.status(404).json({ detail: 'Campaign not found' });
    }

    db.get('SELECT * FROM templates WHERE id = ?', [campaign.template_id], (err, template) => {
      if (err || !template) {
        return res.status(404).json({ detail: 'Template not found' });
      }

      // Update campaign status
      db.run(
        'UPDATE campaigns SET status = ?, updated_at = ? WHERE id = ?',
        ['sending', now, campaignId],
        function(err) {
          if (err) {
            return res.status(500).json({ detail: 'Failed to start campaign' });
          }

          // Get all active subscribers
          db.all('SELECT id, email FROM subscribers WHERE status = ?', ['active'], (err, subscribers) => {
            if (err || !subscribers || subscribers.length === 0) {
              return res.json({ status: 'sending', message: 'No active subscribers to send to' });
            }

            // Send emails asynchronously (don't wait for completion)
            sendCampaignEmails(campaignId, campaign, template, subscribers).catch(err => {
              console.error('Error sending campaign emails:', err);
            });
            
            res.json({ status: 'sending', message: `Sending to ${subscribers.length} subscribers` });
          });
        }
      );
    });
  });
});

// Helper function to send campaign emails
async function sendCampaignEmails(campaignId, campaign, template, subscribers) {
  const { sendEmail } = await import('../services/emailService.js');
  
  for (const subscriber of subscribers) {
    const sendLogId = uuidv4();
    const now = new Date().toISOString();

    try {
      // Send email with tracking
      const result = await sendEmail(
        subscriber.email,
        template.subject,
        template.html,
        template.text_content,
        campaignId,
        subscriber.id
      );

      // Create send log entry
      db.run(
        `INSERT INTO send_logs (id, campaign_id, subscriber_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sendLogId, campaignId, subscriber.id, result.status, now, now],
        (err) => {
          if (err) {
            console.error('Error creating send log:', err);
          } else {
            console.log(`Email sent to ${subscriber.email} - Status: ${result.status}`);
          }
        }
      );
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.email}:`, error);
      
      // Log failed attempt
      db.run(
        `INSERT INTO send_logs (id, campaign_id, subscriber_id, status, last_error, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sendLogId, campaignId, subscriber.id, 'failed', error.message, now, now]
      );
    }

    // Respect send rate
    await new Promise(resolve => setTimeout(resolve, (1000 / campaign.send_rate)));
  }
}

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
