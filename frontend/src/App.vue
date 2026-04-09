<template>
  <div class="app-container">
    <template v-if="userStore.ready">
      <router-view />
      <NavBar />
    </template>
    <div v-else class="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div class="text-center p-8">
        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <svg class="w-7 h-7 text-indigo-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h1 class="text-lg font-bold text-gray-900 mb-1">Innopolis Events</h1>
        <p class="text-sm text-gray-400">{{ $t('common.loading') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from './stores/user'
import NavBar from './components/NavBar.vue'

const userStore = useUserStore()
const { locale } = useI18n()

onMounted(async () => {
  await userStore.login()
  if (userStore.user?.language) {
    locale.value = userStore.user.language
  }
})

watch(() => userStore.user?.language, (lang) => {
  if (lang) locale.value = lang
})
</script>

<style>
.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
