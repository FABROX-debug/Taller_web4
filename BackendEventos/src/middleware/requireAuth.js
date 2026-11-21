// ============================================================
// Middleware de autenticación con Firebase
// ============================================================
// El frontend inicia sesión en Firebase y recibe un ID Token (JWT firmado por Google).
// En cada petición protegida lo envía en la cabecera:  Authorization: Bearer <token>
// Aquí verificamos ese token. El backend NUNCA ve contraseñas.
import { firebaseAuth } from '../config/firebase.js'

const ALLOWED_DOMAINS = ['@unmsm.edu.pe', '@universidad.edu.pe']

// Deja pasar solo peticiones con un token válido de Firebase.
// Si es válido, deja los datos del usuario en req.user = { uid, email, name }
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Debes iniciar sesión' })

  try {
    const decoded = await firebaseAuth.verifyIdToken(token) // firma, expiración y proyecto
    const email = (decoded.email || '').toLowerCase()
    if (!ALLOWED_DOMAINS.some((d) => email.endsWith(d))) {
      return res.status(403).json({ error: 'Solo se permiten correos institucionales' })
    }
    req.user = { uid: decoded.uid, email, name: decoded.name }
    next()
  } catch {
    res.status(401).json({ error: 'Sesión inválida o expirada, vuelve a iniciar sesión' })
  }
}
