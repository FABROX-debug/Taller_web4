// ============================================================
// Modelos del ORM, sus relaciones e inicialización de la BD
// ============================================================
import { sequelize } from '../config/database.js'
import { Event } from './Event.js'
import { Student } from './Student.js'
import { Inscription } from './Inscription.js'
import { Review } from './Review.js'
import { seedEvents } from '../data/seedEvents.js'

// ── Relaciones ───────────────────────────────────────────────────────────────
Event.hasMany(Inscription, { foreignKey: 'eventId', onDelete: 'CASCADE' })
Student.hasMany(Inscription, { foreignKey: 'studentEmail', onDelete: 'CASCADE' })
Event.hasMany(Review, { foreignKey: 'eventId', onDelete: 'CASCADE' })

// Crea las tablas si no existen y carga los eventos de ejemplo la primera vez
export async function initDb() {
  await sequelize.sync()
  if ((await Event.count()) === 0) {
    await Event.bulkCreate(seedEvents)
    console.log(`BD inicializada con ${seedEvents.length} eventos de ejemplo`)
  }
}

export { Event, Student, Inscription, Review }
