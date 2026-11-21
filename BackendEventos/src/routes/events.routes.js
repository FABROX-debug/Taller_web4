// ============================================================
// Rutas de eventos, categorías y reseñas
// ============================================================
import { Router } from 'express'
import { Event, Student, Review } from '../models/index.js'
import { CATEGORIES } from '../data/categories.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
const today = () => new Date().toISOString().split('T')[0]

// GET /api/categories → lista de categorías
router.get('/categories', (req, res) => {
  res.json(CATEGORIES)
})

// GET /api/events → todos los eventos (ordenados por fecha)
router.get('/events', async (req, res) => {
  res.json(await Event.findAll({ order: [['date', 'ASC'], ['time', 'ASC']] }))
})

// GET /api/events/:id → un evento
router.get('/events/:id', async (req, res) => {
  const event = await Event.findByPk(req.params.id)
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' })
  res.json(event)
})

// POST /api/events 🔐 → publica un evento nuevo
router.post('/events', requireAuth, async (req, res) => {
  const { title, description, date, time, speaker, speakerBio, category, location } = req.body
  const cost = Number(req.body.cost) || 0
  const capacity = Number(req.body.capacity)

  if (!title || !description || !date || !time || !speaker || !location) {
    return res.status(400).json({ error: 'Completa todos los campos obligatorios' })
  }
  if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Categoría inválida' })
  if (date < today()) return res.status(400).json({ error: 'La fecha no puede ser pasada' })
  if (!(capacity > 0)) return res.status(400).json({ error: 'La capacidad debe ser mayor a 0' })
  if (cost < 0) return res.status(400).json({ error: 'El costo no puede ser negativo' })

  const event = await Event.create({
    title, description, date, time, speaker, speakerBio, category, location,
    cost, capacity, isFree: cost === 0, enrolled: 0, agenda: null,
  })
  res.status(201).json(event)
})

// GET /api/events/:id/reviews → reseñas del evento (más recientes primero)
router.get('/events/:id/reviews', async (req, res) => {
  const reviews = await Review.findAll({
    where: { eventId: req.params.id },
    order: [['createdAt', 'DESC']],
  })
  res.json(reviews)
})

// POST /api/events/:id/reviews 🔐  body: { rating, comment } → agrega reseña
router.post('/events/:id/reviews', requireAuth, async (req, res) => {
  const rating = Number(req.body.rating)
  const comment = String(req.body.comment || '').trim()

  const event = await Event.findByPk(req.params.id)
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' })
  const student = await Student.findByPk(req.user.email)
  if (!student) return res.status(404).json({ error: 'Completa tu perfil antes de reseñar' })
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'La calificación va de 1 a 5' })
  if (comment.length < 3) return res.status(400).json({ error: 'Escribe un comentario' })

  const review = await Review.create({
    eventId: event.id, studentEmail: student.email, studentName: student.name, rating, comment,
  })
  res.status(201).json(review)
})

export default router
