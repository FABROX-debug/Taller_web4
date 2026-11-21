// Cliente HTTP del backend de eventos (BackendEventos, Node.js + Express)
import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }

  // Si hay sesión, adjunta el ID Token de Firebase para que el backend sepa quién es
  if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) {
    const error = new Error(data.error || 'Error en el servidor')
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  getCategories: () => request('/categories'),
  getEvents:     () => request('/events'),
  getEvent:      (id) => request(`/events/${id}`),
  createEvent:   (event) => request('/events', { method: 'POST', body: JSON.stringify(event) }),

  getReviews:    (eventId) => request(`/events/${eventId}/reviews`),
  addReview:     (eventId, review) =>
    request(`/events/${eventId}/reviews`, { method: 'POST', body: JSON.stringify(review) }),

  // Perfil e inscripciones del usuario que inició sesión
  getMe:         () => request('/me'),
  saveMe:        (profile) => request('/me', { method: 'PUT', body: JSON.stringify(profile) }),

  getInscriptions:   () => request('/me/inscriptions'),
  addInscription:    (eventId) =>
    request('/me/inscriptions', { method: 'POST', body: JSON.stringify({ eventId }) }),
  removeInscription: (eventId) => request(`/me/inscriptions/${eventId}`, { method: 'DELETE' }),
}
