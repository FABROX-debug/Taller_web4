// ============================================================
// Conexión con Firebase Authentication (proveedor de identidad)
// ============================================================
// Los valores vienen del archivo .env (ver .env.example).
// No son secretos: identifican al proyecto, la seguridad la da Firebase.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
auth.languageCode = 'es' // correos de Firebase (p. ej. recuperar contraseña) en español

// Traduce los códigos de error de Firebase a mensajes para el usuario
export function authErrorMessage(err) {
  const messages = {
    'auth/email-already-in-use':   'Ya existe una cuenta con ese correo. Inicia sesión.',
    'auth/invalid-credential':     'Correo o contraseña incorrectos.',
    'auth/invalid-email':          'El correo no es válido.',
    'auth/weak-password':          'La contraseña es demasiado débil.',
    'auth/password-does-not-meet-requirements': 'La contraseña no cumple la política de seguridad.',
    'auth/too-many-requests':      'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    'auth/network-request-failed': 'Sin conexión con Firebase. Revisa tu internet.',
  }
  return messages[err?.code] || err?.message || 'Ocurrió un error inesperado.'
}
