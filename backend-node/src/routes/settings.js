import express from 'express'
import db from '../db/database.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Get settings
router.get('/', verifyToken, (req, res) => {
  db.get(
    `SELECT * FROM settings LIMIT 1`,
    (err, settings) => {
      if (err) {
        return res.status(500).json({ detail: 'Database error' })
      }
      
      // Return default settings if none exist
      res.json(settings || {
        smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtp_port: parseInt(process.env.SMTP_PORT) || 587,
        smtp_user: process.env.SMTP_USER || '',
        smtp_password: '***',
        dkim_domain: '',
        dkim_selector: ''
      })
    }
  )
})

// Update settings
router.post('/', verifyToken, (req, res) => {
  const { smtp_host, smtp_port, smtp_user, smtp_password, dkim_domain, dkim_selector } = req.body

  db.run(
    `INSERT OR REPLACE INTO settings (id, smtp_host, smtp_port, smtp_user, smtp_password, dkim_domain, dkim_selector, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [smtp_host, smtp_port, smtp_user, smtp_password, dkim_domain, dkim_selector],
    (err) => {
      if (err) {
        return res.status(500).json({ detail: 'Failed to update settings' })
      }
      res.json({ message: 'Settings updated successfully' })
    }
  )
})

export default router
