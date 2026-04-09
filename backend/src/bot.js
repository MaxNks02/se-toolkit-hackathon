const { Bot, InlineKeyboard } = require('grammy');
const db = require('./database');
const { t } = require('./i18n');
const fs = require('fs');
const path = require('path');

function createBot(token, webAppUrl) {
  const bot = new Bot(token);

  // Read current URL from .env file (tunnel manager updates this)
  function getWebAppUrl() {
    try {
      const envPath = path.join(__dirname, '..', '.env');
      const env = fs.readFileSync(envPath, 'utf8');
      const match = env.match(/WEBAPP_URL=(.*)/);
      return match ? match[1].trim() : webAppUrl;
    } catch {
      return webAppUrl;
    }
  }

  function getUserLang(telegramId) {
    const user = db.prepare('SELECT language FROM users WHERE telegram_id = ?').get(String(telegramId));
    return user?.language || 'en';
  }

  function getMainMenu(lang, url) {
    return new InlineKeyboard()
      .webApp(t(lang, 'open_map'), url).row()
      .webApp(t(lang, 'profile'), `${url}/profile`)
      .webApp(t(lang, 'my_events'), `${url}/my-events`).row()
      .webApp(t(lang, 'signed_events'), `${url}/signed-events`)
      .text(`🌐 ${t(lang, 'language')}`, 'change_lang');
  }

  bot.command('start', async (ctx) => {
    const tgUser = ctx.from;

    // Upsert user
    const existing = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(String(tgUser.id));
    if (!existing) {
      db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, last_name, photo_url)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        String(tgUser.id),
        tgUser.username || null,
        tgUser.first_name || null,
        tgUser.last_name || null,
        null
      );
    }

    const lang = getUserLang(tgUser.id);
    const url = getWebAppUrl();
    await ctx.reply(t(lang, 'welcome'), {
      reply_markup: getMainMenu(lang, url),
    });
  });

  // Any text message -> resend menu with fresh URL
  bot.on('message:text', async (ctx) => {
    const lang = getUserLang(ctx.from.id);
    const url = getWebAppUrl();
    await ctx.reply(t(lang, 'welcome'), {
      reply_markup: getMainMenu(lang, url),
    });
  });

  bot.callbackQuery('change_lang', async (ctx) => {
    const lang = getUserLang(ctx.from.id);
    const keyboard = new InlineKeyboard()
      .text('🇬🇧 English', 'lang_en')
      .text('🇷🇺 Русский', 'lang_ru');
    await ctx.answerCallbackQuery();
    await ctx.reply(t(lang, 'choose_language'), { reply_markup: keyboard });
  });

  bot.callbackQuery('lang_en', async (ctx) => {
    db.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').run('en', String(ctx.from.id));
    await ctx.answerCallbackQuery({ text: t('en', 'lang_changed') });
    await ctx.deleteMessage();
    const url = getWebAppUrl();
    await ctx.reply(t('en', 'welcome'), { reply_markup: getMainMenu('en', url) });
  });

  bot.callbackQuery('lang_ru', async (ctx) => {
    db.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').run('ru', String(ctx.from.id));
    await ctx.answerCallbackQuery({ text: t('ru', 'lang_changed') });
    await ctx.deleteMessage();
    const url = getWebAppUrl();
    await ctx.reply(t('ru', 'welcome'), { reply_markup: getMainMenu('ru', url) });
  });

  return bot;
}

module.exports = { createBot };
