<template>
  <div class="pb-24" :style="{ background: 'var(--tg-secondary)' }">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="w-6 h-6 border-2 rounded-full animate-spin" :style="{ borderColor: 'var(--tg-separator)', borderTopColor: 'var(--tg-btn)' }"></div>
    </div>

    <template v-else-if="event">
      <!-- Map header -->
      <div class="h-44 relative">
        <div ref="detailMap" class="w-full h-full"></div>
        <button @click="$router.back()" class="absolute top-3 left-3 z-[500] w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
          :style="{ background: 'var(--tg-section)', color: 'var(--tg-text)' }">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      </div>

      <!-- Content -->
      <div class="px-4 -mt-4 relative z-10">
        <!-- Title card -->
        <div class="rounded-2xl p-4 shadow-sm" :style="{ background: 'var(--tg-section)' }">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium px-2 py-0.5 rounded-full" :style="catStyle">
              {{ catEmoji }} {{ $t(`event.categories.${event.category || 'other'}`) }}
            </span>
          </div>
          <h1 class="text-[20px] font-bold leading-tight mb-2">{{ event.title }}</h1>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-[13px]" :style="{ color: 'var(--tg-hint)' }">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {{ formatDate(event.event_date) }}
            </div>
            <div v-if="event.location_name" class="flex items-center gap-2 text-[13px]" :style="{ color: 'var(--tg-hint)' }">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ event.location_name }}
            </div>
            <div class="flex items-center gap-2 text-[13px]" :style="{ color: 'var(--tg-hint)' }">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              {{ event.creator_first_name || event.creator_username || 'Unknown' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="event.description" class="mt-3">
        <div class="tg-section-header">{{ $t('event.description') }}</div>
        <div class="tg-section px-4 py-3">
          <p class="text-[15px] whitespace-pre-wrap leading-relaxed">{{ event.description }}</p>
        </div>
      </div>

      <!-- Participants -->
      <div class="mt-3">
        <div class="tg-section-header">{{ $t('event.participants') }} · {{ event.participant_count || 0 }}{{ event.max_participants > 0 ? ' / ' + event.max_participants : '' }}</div>
        <div class="tg-section">
          <div v-if="event.max_participants > 0" class="px-4 pt-3 pb-1">
            <div class="w-full rounded-full h-1" :style="{ background: 'var(--tg-separator)' }">
              <div class="h-1 rounded-full transition-all" :style="{ width: progressWidth, background: isFull ? '#ff3b30' : 'var(--tg-btn)' }"></div>
            </div>
          </div>
          <div v-if="event.participants?.length" class="px-4 py-3 flex flex-wrap gap-2">
            <div v-for="p in event.participants" :key="p.id" class="flex items-center gap-1.5 text-[13px]">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                :style="{ background: 'var(--tg-btn)', color: 'var(--tg-btn-text)' }">
                {{ (p.first_name?.[0] || '?').toUpperCase() }}
              </div>
              <span>{{ p.first_name || p.username || 'User' }}</span>
            </div>
          </div>
          <div v-else class="px-4 py-4 text-center text-[13px]" :style="{ color: 'var(--tg-hint)' }">
            No participants yet
          </div>
        </div>
      </div>

      <!-- Action button -->
      <div class="fixed bottom-14 left-0 right-0 px-4 py-2" :style="{ background: 'var(--tg-secondary)' }">
        <button
          v-if="userStore.isLoggedIn"
          @click="toggleRegistration"
          :disabled="actionLoading || (isFull && !isRegistered)"
          class="tg-button"
          :class="isRegistered ? 'tg-button-danger' : 'tg-button-primary'"
          :style="!isRegistered && !isFull ? {} : undefined"
        >
          {{ actionLoading ? '...' : isFull && !isRegistered ? $t('event.full') : isRegistered ? $t('event.unregister') : $t('event.register') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '../stores/events'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const userStore = useUserStore()

const event = ref(null)
const loading = ref(true)
const isRegistered = ref(false)
const actionLoading = ref(false)
const detailMap = ref(null)

const cats = {
  education: { bg: '#007aff20', color: '#007aff', emoji: '\uD83D\uDCDA' },
  sport: { bg: '#34c75920', color: '#34c759', emoji: '\u26BD' },
  culture: { bg: '#af52de20', color: '#af52de', emoji: '\uD83C\uDFA8' },
  tech: { bg: '#5856d620', color: '#5856d6', emoji: '\uD83D\uDCBB' },
  social: { bg: '#ff2d5520', color: '#ff2d55', emoji: '\uD83E\uDD1D' },
  food: { bg: '#ff950020', color: '#ff9500', emoji: '\uD83C\uDF54' },
  music: { bg: '#ff2d5520', color: '#ff2d55', emoji: '\uD83C\uDFB5' },
  gaming: { bg: '#5ac8fa20', color: '#5ac8fa', emoji: '\uD83C\uDFAE' },
  other: { bg: '#8e8e9320', color: '#8e8e93', emoji: '\uD83D\uDCCC' },
}
const catInfo = computed(() => cats[event.value?.category] || cats.other)
const catStyle = computed(() => ({ background: catInfo.value.bg, color: catInfo.value.color }))
const catEmoji = computed(() => catInfo.value.emoji)
const isFull = computed(() => event.value?.max_participants > 0 && (event.value.participant_count || 0) >= event.value.max_participants)
const progressWidth = computed(() => {
  if (!event.value?.max_participants) return '0%'
  return Math.min(100, ((event.value.participant_count || 0) / event.value.max_participants) * 100) + '%'
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

async function loadEvent() {
  loading.value = true
  const data = await eventsStore.fetchEvent(route.params.id)
  if (data) {
    event.value = data
    isRegistered.value = await eventsStore.checkRegistration(data.id)
    await nextTick()
    initMiniMap()
  }
  loading.value = false
}

function initMiniMap() {
  if (!detailMap.value || !event.value || !window.L) return
  const m = window.L.map(detailMap.value, {
    center: [event.value.latitude, event.value.longitude],
    zoom: 17, zoomControl: false, dragging: false, scrollWheelZoom: false, attributionControl: false,
  })
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m)
  window.L.marker([event.value.latitude, event.value.longitude]).addTo(m)
}

async function toggleRegistration() {
  actionLoading.value = true
  if (isRegistered.value) {
    await eventsStore.unregisterFromEvent(event.value.id)
    isRegistered.value = false
  } else {
    const ok = await eventsStore.registerForEvent(event.value.id)
    if (ok) isRegistered.value = true
  }
  await eventsStore.fetchEvent(event.value.id)
  event.value = eventsStore.currentEvent
  actionLoading.value = false
}

onMounted(loadEvent)
</script>
