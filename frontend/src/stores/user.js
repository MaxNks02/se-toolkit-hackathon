import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API = '/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const stats = ref({ events_created: 0, events_joined: 0 })
  const loading = ref(false)
  const initData = ref('')
  const ready = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  function getHeaders() {
    return { 'X-Telegram-Init-Data': initData.value }
  }

  async function login() {
    const tg = window.Telegram?.WebApp
    if (tg && tg.initData) {
      initData.value = tg.initData
      tg.ready()
      tg.expand()
      // Set CSS vars from Telegram theme
      const p = tg.themeParams || {}
      const root = document.documentElement.style
      if (p.bg_color) root.setProperty('--tg-theme-bg-color', p.bg_color)
      if (p.text_color) root.setProperty('--tg-theme-text-color', p.text_color)
      if (p.hint_color) root.setProperty('--tg-theme-hint-color', p.hint_color)
      if (p.link_color) root.setProperty('--tg-theme-link-color', p.link_color)
      if (p.button_color) root.setProperty('--tg-theme-button-color', p.button_color)
      if (p.button_text_color) root.setProperty('--tg-theme-button-text-color', p.button_text_color)
      if (p.secondary_bg_color) root.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color)
      if (p.section_bg_color) root.setProperty('--tg-theme-section-bg-color', p.section_bg_color)
      if (p.header_bg_color) root.setProperty('--tg-theme-header-bg-color', p.header_bg_color)
      if (p.section_header_text_color) root.setProperty('--tg-theme-section-header-text-color', p.section_header_text_color)
      if (p.section_separator_color) root.setProperty('--tg-theme-section-separator-color', p.section_separator_color)
    }

    if (!initData.value) {
      ready.value = true
      return
    }

    try {
      loading.value = true
      const { data } = await axios.post(`${API}/auth/login`, {}, { headers: getHeaders() })
      user.value = data.user
    } catch (e) {
      console.error('Login failed:', e)
    } finally {
      loading.value = false
      ready.value = true
    }
  }

  async function fetchProfile() {
    if (!initData.value) return
    try {
      const { data } = await axios.get(`${API}/users/me`, { headers: getHeaders() })
      user.value = data.user
      stats.value = data.stats
    } catch (e) {
      console.error('Fetch profile failed:', e)
    }
  }

  async function setLanguage(lang) {
    if (!initData.value) return
    try {
      const { data } = await axios.put(`${API}/users/me/language`, { language: lang }, { headers: getHeaders() })
      user.value = data.user
    } catch (e) {
      console.error('Set language failed:', e)
    }
  }

  return { user, stats, loading, initData, isLoggedIn, ready, login, fetchProfile, setLanguage, getHeaders }
})
