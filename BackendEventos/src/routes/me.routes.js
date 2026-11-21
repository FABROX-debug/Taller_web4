// ============================================================
// Rutas del usuario autenticado: perfil e inscripciones
// ============================================================
// Todas requieren sesión (requireAuth) y usan req.user.email del token de Firebase.
import { Router } from 'express'
import { Event, Student, Inscription } from '../models/index.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

const today = () => new Date().toISOString().split('T')[0]

// Lista de IDs de eventos en los que está inscrito un estudiante
const inscribedIds = async (email) =>
  (await Inscription.findAll({ where: { studentEmail: email } })).map((i) => i.eventId)

// ── Perfil ───────────────────────────────────────────────────────────────────

// GET /api/me → perfil del estudiante (404 si aún no lo completa)
router.get('/', async (req, res) => {
  const student = await Student.findByPk(req.user.email)
  if (!student) return res.status(404).json({ error: 'Perfil no encontrado' })
  res.json(student)
})

// PUT /api/me  body: { name, phone } → crea o actualiza el perfil
router.put('/', async (req, res) => {
  const name = String(req.body.name || req.user.name || '').trim()
  const phone = String(req.body.phone || '').trim()

  if (name.length < 3) return res.status(400).json({ error: 'Nombre inválido (mín. 3 caracteres)' })
  if (!/^\d{7,15}$/.test(phone.replace(/[\s\-+()]/g, ''))) {
    return res.status(400).json({ error: 'Teléfono inválido' })
  }

  const [student] = await Student.upsert({ email: req.user.email, uid: req.user.uid, name, phone })
  res.json(student)
})

// ── Inscripciones ────────────────────────────────────────────────────────────

// GET /api/me/inscriptions → IDs de eventos inscritos
router.get('/inscriptions', async (req, res) => {
  res.json(await inscribedIds(req.user.email))
})

// POST /api/me/inscriptions  body: { eventId } → inscribe
router.post('/inscriptions', async (req, res) => {
  const email = req.user.email
  const event = await Event.findByPk(req.body.eventId)

  if (!(await Student.findByPk(email))) return res.status(404).json({ error: 'Completa tu perfil antes de inscribirte' })
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' })
  if (event.date < today()) return res.status(400).json({ error: 'El evento ya se realizó' })

  const already = await Inscription.findOne({ where: { studentEmail: email, eventId: event.id } })
  if (!already) {
    // Cupo: inscritos previos + inscripciones guardadas en la BD
    const taken = event.enrolled + (await Inscription.count({ where: { eventId: event.id } }))
    if (taken >= event.capacity) return res.status(409).json({ error: 'No hay cupos disponibles' })
    await Inscription.create({ studentEmail: email, eventId: event.id })
  }
  res.status(201).json(await inscribedIds(email))
})

// DELETE /api/me/inscriptions/:eventId → cancela inscripción
router.delete('/inscriptions/:eventId', async (req, res) => {
  const email = req.user.email
  await Inscription.destroy({ where: { studentEmail: email, eventId: Number(req.params.eventId) } })
  res.json(await inscribedIds(email))
})

export default router
