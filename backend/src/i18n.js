const translations = {
  en: {
    welcome: [
      "🗺 <b>Innopolis Events</b>",
      "",
      "Discover what's happening on campus!",
      "Create events, join meetups, and never miss out.",
      "",
      "👇 <i>Choose an option below</i>"
    ].join('\n'),
    open_map: "🗺 Open Map",
    profile: "👤 Profile",
    my_events: "📋 My Events",
    signed_events: "✅ Signed Up",
    language: "Language",
    lang_changed: "✅ Language changed to English",
    choose_language: "🌐 <b>Choose your language</b>",
    help: [
      "📖 <b>How to use</b>",
      "",
      "🗺 <b>Open Map</b> — browse events on the Innopolis map",
      "📋 <b>My Events</b> — events you created",
      "✅ <b>Signed Up</b> — events you registered for",
      "👤 <b>Profile</b> — your stats and language",
      "",
      "Tap the map to create a new event!"
    ].join('\n'),
  },
  ru: {
    welcome: [
      "🗺 <b>Innopolis Events</b>",
      "",
      "Узнайте, что происходит в кампусе!",
      "Создавайте события и присоединяйтесь к другим.",
      "",
      "👇 <i>Выберите действие</i>"
    ].join('\n'),
    open_map: "🗺 Открыть карту",
    profile: "👤 Профиль",
    my_events: "📋 Мои события",
    signed_events: "✅ Записи",
    language: "Язык",
    lang_changed: "✅ Язык изменён на русский",
    choose_language: "🌐 <b>Выберите язык</b>",
    help: [
      "📖 <b>Как пользоваться</b>",
      "",
      "🗺 <b>Карта</b> — все события на карте Иннополиса",
      "📋 <b>Мои события</b> — события, которые вы создали",
      "✅ <b>Записи</b> — события, на которые вы записались",
      "👤 <b>Профиль</b> — статистика и язык",
      "",
      "Нажмите на карту, чтобы создать событие!"
    ].join('\n'),
  }
};

function t(lang, key) {
  return (translations[lang] || translations.en)[key] || translations.en[key] || key;
}

module.exports = { translations, t };
