// ============================================================
// Punto de entrada del backend (Node.js + Express)
// ============================================================
import express from 'express'
import cors from 'cors'
import { initDb } from './models/index.js'
import eventsRoutes from './routes/events.routes.js'
import meRoutes from './routes/me.routes.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())          // permite llamadas desde el frontend (http://localhost:5173)
app.use(express.json())  // parsea el body JSON de las peticiones

// Rutas (las consultas del ORM son Promesas → handlers async/await;
// Express 5 captura automáticamente sus errores)
app.use('/api', eventsRoutes)   // eventos, categorías y reseñas
app.use('/api/me', meRoutes)    // perfil e inscripciones del usuario con sesión 🔐

// Manejador de errores (por ejemplo, fallos de la BD)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// Primero prepara la BD y luego empieza a escuchar
await initDb()
app.listen(PORT, () => {
  console.log(`Backend de eventos escuchando en http://localhost:${PORT}`)
})
