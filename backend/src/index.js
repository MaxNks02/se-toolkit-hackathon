require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createBot } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://csrn-market.com';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const { router: authRouter } = require('./routes/auth');
const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Start Telegram bot
if (process.env.BOT_TOKEN) {
  const bot = createBot(process.env.BOT_TOKEN, WEBAPP_URL);
  bot.start({
    onStart: () => console.log('Telegram bot started'),
  });
} else {
  console.warn('BOT_TOKEN not set, Telegram bot not started');
}
