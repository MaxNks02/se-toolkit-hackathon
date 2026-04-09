const express = require('express');
const db = require('../database');
const { authMiddleware } = require('./auth');
const router = express.Router();

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const eventsCreated = db.prepare('SELECT COUNT(*) as count FROM events WHERE creator_id = ?').get(user.id);
  const eventsJoined = db.prepare('SELECT COUNT(*) as count FROM event_registrations WHERE user_id = ?').get(user.id);

  res.json({
    user,
    stats: {
      events_created: eventsCreated.count,
      events_joined: eventsJoined.count
    }
  });
});

// PUT /api/users/me/language - Update language preference
router.put('/me/language', authMiddleware, (req, res) => {
  const { language } = req.body;
  if (!['en', 'ru'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language. Supported: en, ru' });
  }

  db.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').run(language, String(req.telegramUser.id));
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  res.json({ user });
});

// GET /api/users/me/events - Get user's created events
router.get('/me/events', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const events = db.prepare(`
    SELECT e.*,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as participant_count
    FROM events e
    WHERE e.creator_id = ?
    ORDER BY e.event_date ASC
  `).all(user.id);

  res.json({ events });
});

// GET /api/users/me/registrations - Get events user is registered for
router.get('/me/registrations', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(String(req.telegramUser.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const events = db.prepare(`
    SELECT e.*, er.registered_at,
      u.username as creator_username, u.first_name as creator_first_name,
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as participant_count
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    LEFT JOIN users u ON e.creator_id = u.id
    WHERE er.user_id = ?
    ORDER BY e.event_date ASC
  `).all(user.id);

  res.json({ events });
});

module.exports = router;
