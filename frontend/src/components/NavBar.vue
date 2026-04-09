<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t" :style="{ background: 'var(--tg-section)', borderColor: 'var(--tg-separator)' }">
    <div class="flex items-center justify-around max-w-lg mx-auto" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 py-2 px-4 transition-all"
        :style="{ color: isActive(item.to) ? 'var(--tg-btn)' : 'var(--tg-hint)' }"
      >
        <svg v-html="item.svg" class="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive(item.to) ? 2.2 : 1.6"></svg>
        <span class="text-[10px] font-medium">{{ $t(item.label) }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const navItems = [
  { to: '/', label: 'nav.map', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>' },
  { to: '/my-events', label: 'nav.myEvents', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>' },
  { to: '/signed-events', label: 'nav.signedEvents', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { to: '/profile', label: 'nav.profile', svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>' },
]
function isActive(to) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>
