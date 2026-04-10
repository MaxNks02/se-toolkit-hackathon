const { Bot, Keyboard, InlineKeyboard } = require('grammy');
const db = require('./database');
const { t } = require('./i18n');
const fs = require('fs');
const path = require('path');

function createBot(token, webAppUrl) {
  const bot = new Bot(token);

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

  function getMainKeyboard(lang, url) {
    return new Keyboard()
      .webApp(t(lang, 'open_map'), url)
      .row()
      .webApp(t(lang, 'my_events'), `${url}/my-events`)
      .webApp(t(lang, 'signed_events'), `${url}/signed-events`)
      .row()
      .webApp(t(lang, 'profile'), `${url}/profile`)
      .text(`🌐 ${t(lang, 'language')}`)
      .resized()
      .persistent();
  }

  bot.command('start', async (ctx) => {
    const tgUser = ctx.from;

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
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(lang, url),
    });
  });

  // Language button
  bot.hears(/🌐/, async (ctx) => {
    const lang = getUserLang(ctx.from.id);
    const keyboard = new InlineKeyboard()
      .text(lang === 'en' ? '🇬🇧 English  ✓' : '🇬🇧 English', 'lang_en')
      .text(lang === 'ru' ? '🇷🇺 Русский  ✓' : '🇷🇺 Русский', 'lang_ru');
    await ctx.reply(t(lang, 'choose_language'), {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  });

  bot.callbackQuery('lang_en', async (ctx) => {
    db.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').run('en', String(ctx.from.id));
    await ctx.answerCallbackQuery({ text: t('en', 'lang_changed') });
    await ctx.deleteMessage();
    const url = getWebAppUrl();
    await ctx.reply(t('en', 'welcome'), {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard('en', url),
    });
  });

  bot.callbackQuery('lang_ru', async (ctx) => {
    db.prepare('UPDATE users SET language = ? WHERE telegram_id = ?').run('ru', String(ctx.from.id));
    await ctx.answerCallbackQuery({ text: t('ru', 'lang_changed') });
    await ctx.deleteMessage();
    const url = getWebAppUrl();
    await ctx.reply(t('ru', 'welcome'), {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard('ru', url),
    });
  });

  return bot;
}

module.exports = { createBot };
