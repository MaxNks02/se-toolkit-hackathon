<template>
  <div class="map-page flex flex-col" style="height: calc(100dvh - 56px)">
    <!-- Search & Filter -->
    <div class="shrink-0 px-3 pt-3 pb-2 space-y-2 bg-white z-10">
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          class="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-sm outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all"
          :placeholder="$t('map.search')"
        />
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <div class="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        <button
          v-for="cat in allCategories"
          :key="cat"
          @click="selectedCategory = cat"
          class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
          :class="selectedCategory === cat
            ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-200'
            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'"
        >
          {{ categoryEmoji[cat] }} {{ $t(`event.categories.${cat}`) }}
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div class="flex-1 relative">
      <div ref="mapContainer" class="absolute inset-0"></div>
      <!-- Guest alert -->
      <div v-if="showGuestAlert" class="absolute top-4 left-1/2 -translate-x-1/2 z-[500]">
        <div class="bg-red-500 text-white rounded-xl px-4 py-2.5 shadow-lg text-xs font-medium">
          Open via Telegram bot to create events
        </div>
      </div>

      <!-- Floating hint -->
      <div v-if="!showEventForm && userStore.isLoggedIn" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400]">
        <div class="bg-white rounded-full px-4 py-2 shadow-lg shadow-gray-200/50 text-xs text-gray-500 font-medium flex items-center gap-1.5 border border-gray-100">
          <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ $t('map.tapToCreate') }}
        </div>
      </div>
    </div>

    <EventForm
      v-if="showEventForm"
      :lat="newEventLat"
      :lng="newEventLng"
      @close="showEventForm = false"
      @created="onEventCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '../stores/events'
import { useUserStore } from '../stores/user'
import EventForm from '../components/EventForm.vue'

const router = useRouter()
const eventsStore = useEventsStore()
const userStore = useUserStore()

const mapContainer = ref(null)
let map = null
let markersLayer = null

const searchQuery = ref('')
const selectedCategory = ref('all')
const showEventForm = ref(false)
const newEventLat = ref(55.7525)
const newEventLng = ref(48.7444)
const showGuestAlert = ref(false)

const allCategories = ['all', 'education', 'sport', 'culture', 'tech', 'social', 'food', 'music', 'gaming', 'other']

const categoryEmoji = {
  all: '',
  education: '\uD83D\uDCDA',
  sport: '\u26BD',
  culture: '\uD83C\uDFA8',
  tech: '\uD83D\uDCBB',
  social: '\uD83E\uDD1D',
  food: '\uD83C\uDF54',
  music: '\uD83C\uDFB5',
  gaming: '\uD83C\uDFAE',
  other: '\uD83D\uDCCC',
}

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadEvents(), 300)
}

async function loadEvents() {
  const params = {}
  if (selectedCategory.value !== 'all') params.category = selectedCategory.value
  if (searchQuery.value) params.search = searchQuery.value
  await eventsStore.fetchEvents(params)
  updateMarkers()
}

function createMarkerIcon(category) {
  const emoji = categoryEmoji[category] || '\uD83D\uDCCC'
  return window.L.divIcon({
    html: `<div class="marker-pin"><span>${emoji}</span></div>`,
    className: 'custom-marker',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  })
}

function updateMarkers() {
  if (!markersLayer || !map) return
  markersLayer.clearLayers()

  for (const event of eventsStore.events) {
    const marker = window.L.marker([event.latitude, event.longitude], {
      icon: createMarkerIcon(event.category),
    })

    const date = new Date(event.event_date).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
    const count = event.participant_count || 0
    const max = event.max_participants > 0 ? `/${event.max_participants}` : ''

    marker.bindPopup(`
      <div style="padding:14px 16px;min-width:200px;font-family:Inter,sans-serif">
        <div style="font-weight:700;font-size:15px;color:#1a1a2e;margin-bottom:6px;line-height:1.3">${escapeHtml(event.title)}</div>
        <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px">
          <div style="font-size:12px;color:#6b7280;display:flex;align-items:center;gap:4px">
            <span style="opacity:0.7">\uD83D\uDCC5</span> ${date}
          </div>
          ${event.location_name ? `<div style="font-size:12px;color:#6b7280;display:flex;align-items:center;gap:4px"><span style="opacity:0.7">\uD83D\uDCCD</span> ${escapeHtml(event.location_name)}</div>` : ''}
          <div style="font-size:12px;color:#6b7280;display:flex;align-items:center;gap:4px">
            <span style="opacity:0.7">\uD83D\uDC65</span> ${count}${max} joined
          </div>
        </div>
        <button onclick="window.__openEvent(${event.id})" style="width:100%;padding:8px 12px;border-radius:10px;background:#6366f1;color:white;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif">
          View Details
        </button>
      </div>
    `, { closeButton: false, maxWidth: 280 })

    marker.addTo(markersLayer)
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function onEventCreated() {
  showEventForm.value = false
  loadEvents()
}

onMounted(async () => {
  await nextTick()

  window.__openEvent = (id) => router.push(`/event/${id}`)

  map = window.L.map(mapContainer.value, {
    center: [55.7525, 48.7444],
    zoom: 16,
    zoomControl: false,
  })

  window.L.control.zoom({ position: 'topright' }).addTo(map)

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  markersLayer = window.L.layerGroup().addTo(map)

  map.on('click', (e) => {
    if (!userStore.isLoggedIn) {
      showGuestAlert.value = true
      setTimeout(() => showGuestAlert.value = false, 3000)
      return
    }
    newEventLat.value = e.latlng.lat
    newEventLng.value = e.latlng.lng
    showEventForm.value = true
  })

  await loadEvents()
})

watch(selectedCategory, () => loadEvents())
</script>

<style>
.marker-pin {
  width: 36px;
  height: 36px;
  border-radius: 50% 50% 50% 0;
  background: white;
  border: 2px solid #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-45deg);
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.marker-pin span {
  transform: rotate(45deg);
  font-size: 16px;
}
</style>
