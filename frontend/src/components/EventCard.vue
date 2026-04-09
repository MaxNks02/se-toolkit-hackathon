<template>
  <button class="w-full text-left tg-cell flex-col items-stretch gap-0 py-3" @click="$router.push(`/event/${event.id}`)">
    <div class="flex items-center justify-between w-full">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] font-medium px-1.5 py-px rounded" :style="catStyle">
            {{ catEmoji }} {{ $t(`event.categories.${event.category || 'other'}`) }}
          </span>
        </div>
        <h3 class="text-[15px] font-semibold leading-snug truncate">{{ event.title }}</h3>
        <div class="flex items-center gap-3 mt-1.5 text-[13px]" :style="{ color: 'var(--tg-hint)' }">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {{ formatDate(event.event_date) }}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {{ event.participant_count || 0 }}{{ event.max_participants > 0 ? '/' + event.max_participants : '' }}
          </span>
        </div>
        <div v-if="event.location_name" class="mt-1 text-[12px] truncate" :style="{ color: 'var(--tg-hint)' }">
          {{ event.location_name }}
        </div>
      </div>
      <svg class="w-4 h-4 shrink-0 ml-2" :style="{ color: 'var(--tg-hint)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ event: Object })
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
const catInfo = computed(() => cats[props.event.category] || cats.other)
const catStyle = computed(() => ({ background: catInfo.value.bg, color: catInfo.value.color }))
const catEmoji = computed(() => catInfo.value.emoji)
function formatDate(d) { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
</script>
