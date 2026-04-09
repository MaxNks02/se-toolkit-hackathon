<template>
  <div class="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30" @click.self="$emit('close')">
    <div class="bg-white w-full max-w-lg rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up">
      <div class="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between z-10">
        <h2 class="text-base font-bold text-gray-900">{{ editing ? $t('event.edit') : $t('event.create') }}</h2>
        <button @click="$emit('close')" class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 text-sm">&times;</button>
      </div>

      <form @submit.prevent="submit" class="p-5 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.title') }} *</label>
          <input v-model="form.title" required class="input-field" :placeholder="$t('event.title')" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.description') }}</label>
          <textarea v-model="form.description" rows="3" class="input-field resize-none" :placeholder="$t('event.description')"></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.category') }}</label>
          <select v-model="form.category" class="input-field">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ $t(`event.categories.${cat}`) }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.location') }}</label>
          <input v-model="form.location_name" class="input-field" :placeholder="$t('event.location')" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.date') }} *</label>
            <input v-model="form.event_date" type="datetime-local" required class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.endDate') }}</label>
            <input v-model="form.end_date" type="datetime-local" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{{ $t('event.maxParticipants') }}</label>
          <input v-model.number="form.max_participants" type="number" min="0" class="input-field" placeholder="0" />
        </div>

        <div class="text-xs text-gray-400 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
          {{ form.latitude.toFixed(5) }}, {{ form.longitude.toFixed(5) }}
        </div>

        <button type="submit" :disabled="submitting" class="w-full py-3 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 transition-all disabled:opacity-50 text-sm">
          {{ submitting ? $t('common.loading') : (editing ? $t('common.save') : $t('event.create')) }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useEventsStore } from '../stores/events'

const props = defineProps({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  editing: { type: Object, default: null },
})
const emit = defineEmits(['close', 'created', 'updated'])
const eventsStore = useEventsStore()
const submitting = ref(false)
const categories = ['education', 'sport', 'culture', 'tech', 'social', 'food', 'music', 'gaming', 'other']

const form = reactive({
  title: props.editing?.title || '',
  description: props.editing?.description || '',
  category: props.editing?.category || 'other',
  location_name: props.editing?.location_name || '',
  event_date: props.editing?.event_date ? props.editing.event_date.slice(0, 16) : '',
  end_date: props.editing?.end_date ? props.editing.end_date.slice(0, 16) : '',
  max_participants: props.editing?.max_participants || 0,
  latitude: props.lat,
  longitude: props.lng,
})

async function submit() {
  submitting.value = true
  try {
    if (props.editing) {
      const event = await eventsStore.updateEvent(props.editing.id, form)
      emit('updated', event)
    } else {
      const event = await eventsStore.createEvent(form)
      emit('created', event)
    }
    emit('close')
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: #f9fafb;
  color: #1a1a2e;
  font-family: inherit;
}
.input-field:focus {
  border-color: #6366f1;
  background: white;
}
.animate-slide-up {
  animation: slideUp 0.25s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
