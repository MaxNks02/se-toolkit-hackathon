<template>
  <div class="pb-20" :style="{ background: 'var(--tg-secondary)', minHeight: '100dvh' }">
    <div class="tg-section-header pt-4">{{ $t('signedEvents.title') }}</div>

    <!-- Guest -->
    <div v-if="!userStore.isLoggedIn" class="tg-section">
      <div class="py-12 text-center text-[13px]" :style="{ color: 'var(--tg-hint)' }">Open via Telegram bot</div>
    </div>

    <!-- Loading -->
    <div v-else-if="eventsStore.loading" class="flex items-center justify-center py-20">
      <div class="w-6 h-6 border-2 rounded-full animate-spin" :style="{ borderColor: 'var(--tg-separator)', borderTopColor: 'var(--tg-btn)' }"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="eventsStore.signedEvents.length === 0" class="tg-section">
      <div class="py-12 text-center">
        <p class="text-[15px] font-medium" :style="{ color: 'var(--tg-hint)' }">{{ $t('signedEvents.empty') }}</p>
        <p class="text-[13px] mt-1" :style="{ color: 'var(--tg-hint)' }">{{ $t('signedEvents.browseMap') }}</p>
        <button @click="$router.push('/')" class="tg-button tg-button-primary mt-4 mx-auto" style="width: auto; padding: 10px 24px; font-size: 15px;">
          {{ $t('nav.map') }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-else class="tg-section">
      <template v-for="(event, i) in eventsStore.signedEvents" :key="event.id">
        <div v-if="i > 0" :style="{ borderTop: '0.5px solid var(--tg-separator)', marginLeft: '16px' }"></div>
        <EventCard :event="event" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEventsStore } from '../stores/events'
import { useUserStore } from '../stores/user'
import EventCard from '../components/EventCard.vue'
const eventsStore = useEventsStore()
const userStore = useUserStore()
onMounted(() => { if (userStore.isLoggedIn) eventsStore.fetchSignedEvents() })
</script>
