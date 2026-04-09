const express = require('express');
const db = require('../database');
const { authMiddleware } = require('./auth');
const router = express.Router();

// GET /api/events - Get all upcoming events
router.get('/', (req, res) => {
  const { category, search, lat, lng, radius } = req.query;
  let query = `
    SELECT e.*, u.username as creator_username, u.first_name as creator_first_name,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as participant_count
    FROM events e
    LEFT JOIN users u ON e.creator_id = u.id
    WHERE e.event_date >= datetime('now')
  `;
  const params = [];

  if (category && category !== 'all') {
    query += ' AND e.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.location_name LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY e.event_date ASC';

  const events = db.prepare(query).all(...params);
  res.json({ events });
});

// GET /api/events/:id - Get single event
router.get('/:id', (req, res) => {
  const event = db.prepare(`
    SELECT e.*, u.username as creator_username, u.first_name as creator_first_name,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as participant_count
    FROM events e
    LEFT JOIN users u ON e.creator_id = u.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found' });

  const participants = db.prepare(`
    SELECT u.id, u.username, u.first_name, u.last_name, u.photo_url
    FROM event_registrations er
    JOIN users u ON er.user_id = u.id
    WHERE er.event_id = ?
  `).all(req.params.id);

  res.json({ event, participants });
});

// POST /api/events - Create event
router.post('/', authMiddleware, (req, res) => {
  const { title, description, latitude, longitude, location_name, event_date, end_date, max_participants, category } = req.body;

  if (!title || !latitude || !longitude || !event_date) {
    return res.status(400).json({ error: 'Missing required fields: title, latitude, longitude, event_date' });
  }

  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(401).json({ error: 'User not found' });

  const result = db.prepare(`
    INSERT INTO events (title, description, creator_id, latitude, longitude, location_name, event_date, end_date, max_participants, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || null,
    user.id,
    latitude,
    longitude,
    location_name || null,
    event_date,
    end_date || null,
    max_participants || 0,
    category || 'other'
  );

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.json({ event });
});

// PUT /api/events/:id - Update event
router.put('/:id', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(401).json({ error: 'User not found' });

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.creator_id !== user.id) return res.status(403).json({ error: 'Not authorized' });

  const { title, description, latitude, longitude, location_name, event_date, end_date, max_participants, category } = req.body;

  db.prepare(`
    UPDATE events SET title = ?, description = ?, latitude = ?, longitude = ?, location_name = ?,
    event_date = ?, end_date = ?, max_participants = ?, category = ?
    WHERE id = ?
  `).run(
    title || event.title,
    description !== undefined ? description : event.description,
    latitude || event.latitude,
    longitude || event.longitude,
    location_name !== undefined ? location_name : event.location_name,
    event_date || event.event_date,
    end_date !== undefined ? end_date : event.end_date,
    max_participants !== undefined ? max_participants : event.max_participants,
    category || event.category,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json({ event: updated });
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(401).json({ error: 'User not found' });

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.creator_id !== user.id) return res.status(403).json({ error: 'Not authorized' });

  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(401).json({ error: 'User not found' });

  const event = db.prepare(`
    SELECT *, (SELECT COUNT(*) FROM event_registrations WHERE event_id = events.id) as participant_count
    FROM events WHERE id = ?
  `).get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (event.max_participants > 0 && event.participant_count >= event.max_participants) {
    return res.status(400).json({ error: 'Event is full' });
  }

  try {
    db.prepare('INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)').run(req.params.id, user.id);
    res.json({ success: true });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Already registered' });
    }
    throw e;
  }
});

// DELETE /api/events/:id/register - Unregister from event
router.delete('/:id/register', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(401).json({ error: 'User not found' });

  db.prepare('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?').run(req.params.id, user.id);
  res.json({ success: true });
});

// GET /api/events/:id/check-registration - Check if user registered
router.get('/:id/check-registration', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.json({ registered: false });

  const reg = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?').get(req.params.id, user.id);
  res.json({ registered: !!reg });
});

module.exports = router;
