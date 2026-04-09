import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'

const routes = [
  { path: '/', name: 'map', component: MapView },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  { path: '/my-events', name: 'my-events', component: () => import('../views/MyEventsView.vue') },
  { path: '/signed-events', name: 'signed-events', component: () => import('../views/SignedEventsView.vue') },
  { path: '/event/:id', name: 'event-detail', component: () => import('../views/EventDetailView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
