import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './user'

const API = '/api'

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const myEvents = ref([])
  const signedEvents = ref([])
  const currentEvent = ref(null)
  const loading = ref(false)

  function getHeaders() {
    const userStore = useUserStore()
    return userStore.getHeaders()
  }

  async function fetchEvents(params = {}) {
    try {
      loading.value = true
      const { data } = await axios.get(`${API}/events`, { params })
      events.value = data.events
    } catch (e) {
      console.error('Fetch events failed:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchEvent(id) {
    try {
      loading.value = true
      const { data } = await axios.get(`${API}/events/${id}`)
      currentEvent.value = { ...data.event, participants: data.participants }
      return currentEvent.value
    } catch (e) {
      console.error('Fetch event failed:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createEvent(eventData) {
    try {
      const { data } = await axios.post(`${API}/events`, eventData, { headers: getHeaders() })
      events.value.push(data.event)
      return data.event
    } catch (e) {
      console.error('Create event failed:', e)
      throw e
    }
  }

  async function updateEvent(id, eventData) {
    try {
      const { data } = await axios.put(`${API}/events/${id}`, eventData, { headers: getHeaders() })
      const idx = events.value.findIndex(e => e.id === id)
      if (idx !== -1) events.value[idx] = data.event
      return data.event
    } catch (e) {
      console.error('Update event failed:', e)
      throw e
    }
  }

  async function deleteEvent(id) {
    try {
      await axios.delete(`${API}/events/${id}`, { headers: getHeaders() })
      events.value = events.value.filter(e => e.id !== id)
    } catch (e) {
      console.error('Delete event failed:', e)
      throw e
    }
  }

  async function registerForEvent(id) {
    try {
      await axios.post(`${API}/events/${id}/register`, {}, { headers: getHeaders() })
      return true
    } catch (e) {
      console.error('Register failed:', e)
      return false
    }
  }

  async function unregisterFromEvent(id) {
    try {
      await axios.delete(`${API}/events/${id}/register`, { headers: getHeaders() })
      return true
    } catch (e) {
      console.error('Unregister failed:', e)
      return false
    }
  }

  async function checkRegistration(id) {
    try {
      const { data } = await axios.get(`${API}/events/${id}/check-registration`, { headers: getHeaders() })
      return data.registered
    } catch (e) {
      return false
    }
  }

  async function fetchMyEvents() {
    try {
      loading.value = true
      const { data } = await axios.get(`${API}/users/me/events`, { headers: getHeaders() })
      myEvents.value = data.events
    } catch (e) {
      console.error('Fetch my events failed:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchSignedEvents() {
    try {
      loading.value = true
      const { data } = await axios.get(`${API}/users/me/registrations`, { headers: getHeaders() })
      signedEvents.value = data.events
    } catch (e) {
      console.error('Fetch signed events failed:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    events, myEvents, signedEvents, currentEvent, loading,
    fetchEvents, fetchEvent, createEvent, updateEvent, deleteEvent,
    registerForEvent, unregisterFromEvent, checkRegistration,
    fetchMyEvents, fetchSignedEvents
  }
})
