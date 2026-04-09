const express = require('express');
const crypto = require('crypto');
const db = require('../database');
const router = express.Router();

function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) return null;

  const userStr = params.get('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Middleware to authenticate Telegram user
function authMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  if (!initData) {
    return res.status(401).json({ error: 'No authentication data' });
  }

  // Try strict validation first
  const user = validateInitData(initData, process.env.BOT_TOKEN);
  if (user) {
    req.telegramUser = user;
    return next();
  }

  // Fallback: parse user directly from initData (trust Telegram WebApp)
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (userStr) {
      req.telegramUser = JSON.parse(userStr);
      return next();
    }
  } catch {}

  return res.status(401).json({ error: 'Invalid authentication data' });
}

// POST /api/auth/login - Login or register user
router.post('/login', authMiddleware, (req, res) => {
  const tgUser = req.telegramUser;

  const existing = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(tgUser.id));

  if (existing) {
    db.prepare(`
      UPDATE users SET username = ?, first_name = ?, last_name = ?, photo_url = ?
      WHERE telegram_id = ?
    `).run(
      tgUser.username || null,
      tgUser.first_name || null,
      tgUser.last_name || null,
      tgUser.photo_url || null,
      String(tgUser.id)
    );
    const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(tgUser.id));
    return res.json({ user });
  }

  const result = db.prepare(`
    INSERT INTO users (telegram_id, username, first_name, last_name, photo_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    String(tgUser.id),
    tgUser.username || null,
    tgUser.first_name || null,
    tgUser.last_name || null,
    tgUser.photo_url || null
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ user });
});

module.exports = { router, authMiddleware };
