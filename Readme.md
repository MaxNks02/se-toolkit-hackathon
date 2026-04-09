# Innopolis Events

A platform for discovering and creating events in Innopolis, integrated with Telegram as a Mini App.

## Live

- **Web App**: https://955bec982e62cf.lhr.life
- **Telegram Bot**: https://t.me/your_bot (send /start)

## Features

- **Interactive Map** — Leaflet map centered on Innopolis showing all upcoming events
- **Event Creation** — Tap anywhere on the map to create an event with title, description, date, category, and participant limit
- **Event Registration** — Register/unregister for events, see participant lists and capacity
- **User Profiles** — Telegram-synced profiles with stats (events created, events joined)
- **My Events** — View events you've created
- **Signed Events** — View events you've registered for
- **Bilingual** — Full Russian/English support with language toggle
- **Telegram Bot** — Reply keyboard with WebApp buttons for Map, Profile, My Events, Signed Events, and Language selector
- **Categories** — Education, Sport, Culture, Tech, Social, Food, Music, Gaming, Other
- **Search & Filter** — Search events by name, filter by category

## Tech Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS + Leaflet.js + Pinia + vue-i18n
- **Backend**: Node.js + Express + better-sqlite3
- **Bot**: grammy (Telegram Bot Framework)
- **Auth**: Telegram WebApp initData validation
- **Deploy**: Docker + nginx + SSH tunnel (localhost.run)

## Telegram Bot

Buttons:
- 🗺 **Open Map** — Opens the map with all events
- 👤 **Profile** — View your profile and stats
- 📋 **My Events** — Events you created
- ✅ **Signed Events** — Events you registered for
- 🌐 **Language** — Switch between Russian and English

## Running Locally

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit with your bot token
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Deployment

```bash
docker compose up -d --build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Telegram Bot API token |
| `WEBAPP_URL` | Public HTTPS URL of the frontend |
| `PORT` | Backend port (default: 3000) |
| `NODE_ENV` | Environment (production/development) |
