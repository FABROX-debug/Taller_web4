// ============================================================
// Conexión con Firebase (proveedor de identidad) — lado servidor
// ============================================================
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const projectId = process.env.FIREBASE_PROJECT_ID
if (!projectId) {
  console.warn('⚠ Falta FIREBASE_PROJECT_ID en BackendEventos/.env — las rutas protegidas fallarán')
}

// Para verificar tokens basta el ID del proyecto (no se necesita clave privada):
// firebase-admin descarga las claves públicas de Google y valida la firma.
initializeApp({ projectId })

export const firebaseAuth = getAuth()
