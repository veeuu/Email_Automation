import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db/database.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// List workflows
router.get('/', verifyToken, (req, res) => {
  db.all(
    `SELECT id, name, trigger, status, created_at FROM workflows ORDER BY created_at DESC`,
    (err, workflows) => {
      if (err) {
        return res.status(500).json({ detail: 'Database error' })
      }
      res.json(workflows || [])
    }
  )
})

// Create workflow
router.post('/', verifyToken, (req, res) => {
  const { name, trigger, actions } = req.body

  if (!name || !trigger) {
    return res.status(400).json({ detail: 'Missing required fields' })
  }

  const id = uuidv4()
  const now = new Date().toISOString()

  db.run(
    `INSERT INTO workflows (id, name, trigger, actions, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, trigger, actions || '', 'active', now, now],
    (err) => {
      if (err) {
        return res.status(500).json({ detail: 'Failed to create workflow' })
      }
      res.status(201).json({ id, name, trigger, status: 'active', created_at: now })
    }
  )
})

export default router
