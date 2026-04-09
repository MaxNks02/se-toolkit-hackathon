const translations = {
  en: {
    welcome: "Welcome to Innopolis Events! Discover and create events in Innopolis.",
    open_map: "Open Map",
    profile: "Profile",
    my_events: "My Events",
    signed_events: "Signed Events",
    language: "Language",
    lang_changed: "Language changed to English",
    choose_language: "Choose your language:",
    event_created: "Event created successfully!",
    registered: "You have registered for this event!",
    unregistered: "You have unregistered from this event.",
    no_events: "No events found.",
  },
  ru: {
    welcome: "Добро пожаловать в Innopolis Events! Открывайте и создавайте мероприятия в Иннополисе.",
    open_map: "Открыть карту",
    profile: "Профиль",
    my_events: "Мои мероприятия",
    signed_events: "Записи",
    language: "Язык",
    lang_changed: "Язык изменён на русский",
    choose_language: "Выберите язык:",
    event_created: "Мероприятие успешно создано!",
    registered: "Вы записались на мероприятие!",
    unregistered: "Вы отписались от мероприятия.",
    no_events: "Мероприятия не найдены.",
  }
};

function t(lang, key) {
  return (translations[lang] || translations.en)[key] || translations.en[key] || key;
}

module.exports = { translations, t };
