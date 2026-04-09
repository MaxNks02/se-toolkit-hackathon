<template>
  <div class="pb-20" :style="{ background: 'var(--tg-secondary)' }">
    <!-- Guest -->
    <div v-if="!userStore.isLoggedIn" class="flex flex-col items-center justify-center h-[80vh] px-8 text-center">
      <div class="w-20 h-20 rounded-full flex items-center justify-center mb-4" :style="{ background: 'var(--tg-separator)' }">
        <svg class="w-10 h-10" :style="{ color: 'var(--tg-hint)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <p class="text-[15px] font-medium" :style="{ color: 'var(--tg-hint)' }">Open via Telegram bot</p>
    </div>

    <!-- Logged in -->
    <template v-else-if="userStore.user">
      <!-- Avatar header -->
      <div class="flex flex-col items-center pt-8 pb-5 px-4">
        <div class="w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl font-semibold mb-3"
          :style="{ background: 'var(--tg-btn)', color: 'var(--tg-btn-text)' }">
          {{ initials }}
        </div>
        <h1 class="text-[22px] font-semibold">{{ userStore.user.first_name }} {{ userStore.user.last_name || '' }}</h1>
        <p v-if="userStore.user.username" class="text-[15px] mt-0.5" :style="{ color: 'var(--tg-hint)' }">@{{ userStore.user.username }}</p>
      </div>

      <!-- Stats -->
      <div class="flex gap-0 mx-4 rounded-xl overflow-hidden mb-4" :style="{ background: 'var(--tg-section)' }">
        <div class="flex-1 text-center py-3 px-2">
          <div class="text-[22px] font-bold" :style="{ color: 'var(--tg-btn)' }">{{ userStore.stats.events_created }}</div>
          <div class="text-[11px] mt-0.5" :style="{ color: 'var(--tg-hint)' }">{{ $t('profile.eventsCreated') }}</div>
        </div>
        <div class="w-px self-stretch my-3" :style="{ background: 'var(--tg-separator)' }"></div>
        <div class="flex-1 text-center py-3 px-2">
          <div class="text-[22px] font-bold" style="color: #34c759">{{ userStore.stats.events_joined }}</div>
          <div class="text-[11px] mt-0.5" :style="{ color: 'var(--tg-hint)' }">{{ $t('profile.eventsJoined') }}</div>
        </div>
      </div>

      <!-- Info section -->
      <div class="tg-section-header">Info</div>
      <div class="tg-section">
        <div class="tg-cell justify-between">
          <span class="text-[15px]">{{ $t('profile.memberSince') }}</span>
          <span class="text-[15px]" :style="{ color: 'var(--tg-hint)' }">{{ formatDate(userStore.user.created_at) }}</span>
        </div>
      </div>

      <!-- Language section -->
      <div class="tg-section-header mt-3">{{ $t('profile.language') }}</div>
      <div class="tg-section">
        <button @click="changeLang('en')" class="tg-cell justify-between w-full text-left">
          <span class="text-[15px]">English</span>
          <svg v-if="userStore.user.language === 'en'" class="w-5 h-5" :style="{ color: 'var(--tg-btn)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </button>
        <button @click="changeLang('ru')" class="tg-cell justify-between w-full text-left" style="margin-left: 0; border-top: 0.5px solid var(--tg-separator)">
          <span class="text-[15px]">Русский</span>
          <svg v-if="userStore.user.language === 'ru'" class="w-5 h-5" :style="{ color: 'var(--tg-btn)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const { locale } = useI18n()

const initials = computed(() => {
  const u = userStore.user
  if (!u) return '?'
  return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || '?'
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

async function changeLang(lang) {
  await userStore.setLanguage(lang)
  locale.value = lang
}

onMounted(() => userStore.fetchProfile())
</script>
