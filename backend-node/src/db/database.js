import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../email_marketing.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Templates table
    db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        html TEXT NOT NULL,
        text_content TEXT,
        version INTEGER DEFAULT 1,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subscribers table
    db.run(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'active',
        tags TEXT,
        custom_fields TEXT,
        last_activity DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Campaigns table
    db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        template_id TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        schedule_at DATETIME,
        send_rate INTEGER DEFAULT 10,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates(id)
      )
    `);

    // Send logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS send_logs (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        subscriber_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
      )
    `);

    // Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        subscriber_id TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subscriber_id) REFERENCES subscribers(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
      )
    `);

    console.log('Database tables initialized');
  });
}

export default db;
