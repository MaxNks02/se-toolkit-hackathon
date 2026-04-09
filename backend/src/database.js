const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'events.db');
const fs = require('fs');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT,
    language TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    creator_id INTEGER REFERENCES users(id),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_name TEXT,
    event_date DATETIME NOT NULL,
    end_date DATETIME,
    max_participants INTEGER DEFAULT 0,
    category TEXT DEFAULT 'other',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
  CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
  CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
  CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
`);

module.exports = db;
