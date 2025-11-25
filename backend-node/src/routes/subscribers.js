import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import csv from 'csv-parse/sync';
import db from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// List subscribers
router.get('/', verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.page_size) || 50;
  const offset = (page - 1) * pageSize;

  db.get('SELECT COUNT(*) as total FROM subscribers', (err, countResult) => {
    if (err) {
      return res.status(500).json({ detail: 'Database error' });
    }

    db.all(
      'SELECT * FROM subscribers LIMIT ? OFFSET ?',
      [pageSize, offset],
      (err, items) => {
        if (err) {
          return res.status(500).json({ detail: 'Database error' });
        }

        res.json({
          items: items || [],
          total: countResult.total,
          page,
          page_size: pageSize
        });
      }
    );
  });
});

// Bulk import
router.post('/bulk_import', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: 'No file provided' });
  }

  try {
    const csvContent = req.file.buffer.toString('utf-8');
    const records = csv.parse(csvContent, { columns: true });

    let imported = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    records.forEach(record => {
      if (!record.email) {
        skipped++;
        return;
      }

      const id = uuidv4();
      db.run(
        `INSERT OR IGNORE INTO subscribers (id, email, name, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, record.email, record.name || null, record.status || 'active', now, now],
        function(err) {
          if (!err && this.changes > 0) {
            imported++;
          } else {
            skipped++;
          }
        }
      );
    });

    res.json({
      import_id: uuidv4(),
      total_rows: records.length,
      imported,
      skipped,
      errors: []
    });
  } catch (err) {
    res.status(400).json({ detail: err.message });
  }
});

// Delete subscriber
router.delete('/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM subscribers WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ detail: 'Failed to delete subscriber' });
    }
    res.json({ status: 'deleted' });
  });
});

export default router;
