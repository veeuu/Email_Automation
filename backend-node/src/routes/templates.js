import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// List templates
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM templates', (err, templates) => {
    if (err) {
      return res.status(500).json({ detail: 'Database error' });
    }
    res.json(templates || []);
  });
});

// Create template
router.post('/', verifyToken, (req, res) => {
  const { name, subject, html, text_content } = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO templates (id, name, subject, html, text_content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, subject, html, text_content || null, now, now],
    function(err) {
      if (err) {
        return res.status(500).json({ detail: 'Failed to create template' });
      }

      db.get('SELECT * FROM templates WHERE id = ?', [id], (err, template) => {
        if (err) {
          return res.status(500).json({ detail: 'Database error' });
        }
        res.status(201).json(template);
      });
    }
  );
});

// Get template
router.get('/:id', verifyToken, (req, res) => {
  db.get('SELECT * FROM templates WHERE id = ?', [req.params.id], (err, template) => {
    if (err) {
      return res.status(500).json({ detail: 'Database error' });
    }
    if (!template) {
      return res.status(404).json({ detail: 'Template not found' });
    }
    res.json(template);
  });
});

// Delete template
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM templates WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ detail: 'Failed to delete template' });
    }
    res.json({ status: 'deleted' });
  });
});

export default router;
