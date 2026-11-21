import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { api } from '../services/api'

// ── Contexto global de la aplicación ─────────────────────────────────────────
// Gestiona: sesión (Firebase Auth) + perfil del estudiante + inscripciones.
// - Firebase guarda las cuentas y contraseñas (proveedor de identidad).
// - El backend guarda el perfil (nombre, teléfono) y las inscripciones.

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)           // usuario de Firebase | null
  const [student, setStudent] = useState(null)     // perfil del backend: { name, email, phone } | null
  const [authReady, setAuthReady] = useState(false)
  const [inscriptions, setInscriptions] = useState([])

  // Estado del modal de login / registro / perfil
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('login') // 'login' | 'register' | 'profile'
  const [pendingEventId, setPendingEventId] = useState(null)

  // Durante el registro el perfil lo crea register(); el listener no debe pisarlo
  const registering = useRef(false)

  // Carga perfil e inscripciones del usuario que tiene sesión. Devuelve el perfil o null.
  const loadUserData = async () => {
    try {
      const profile = await api.getMe()
      setStudent(profile)
      setInscriptions(await api.getInscriptions())
      return profile
    } catch (err) {
      if (err.status !== 404) console.error(err)
      setStudent(null) // con sesión pero sin perfil → se pedirá completarlo
      setInscriptions([])
      return null
    }
  }

  // Firebase avisa cada vez que cambia la sesión (login, logout, recarga de página)
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (!fbUser) {
        setStudent(null)
        setInscriptions([])
      } else if (!registering.current) {
        await loadUserData()
      }
      setAuthReady(true)
    })
  }, [])

  // ── Modal ───────────────────────────────────────────────────────────────────
  const openModal = (eventId = null, mode = null) => {
    setPendingEventId(eventId)
    setModalMode(mode || (auth.currentUser ? 'profile' : 'login'))
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setPendingEventId(null)
  }

  // Tras iniciar sesión o registrarse: inscribe en el evento pendiente (si había)
  const finishAuthFlow = async () => {
    if (pendingEventId !== null) {
      setInscriptions(await api.addInscription(pendingEventId))
    }
    closeModal()
  }

  // ── Autenticación (Firebase) ────────────────────────────────────────────────

  // Registro: crea la cuenta en Firebase y luego el perfil en el backend
  const register = async ({ name, email, phone, password }) => {
    registering.current = true
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(fbUser, { displayName: name })
      try {
        setStudent(await api.saveMe({ name, phone }))
      } catch (err) {
        setModalMode('profile') // la cuenta ya existe: solo falta guardar el perfil
        throw err
      }
      setInscriptions([])
    } finally {
      registering.current = false
    }
    await finishAuthFlow()
  }

  // Login: Firebase verifica la contraseña; luego cargamos los datos del backend
  const login = async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password)
    if (!(await loadUserData())) {
      setModalMode('profile') // tiene cuenta pero no perfil → completar datos
      return
    }
    await finishAuthFlow()
  }

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const logout = () => signOut(auth) // el listener limpia el estado

  // Crear o editar el perfil (nombre y teléfono)
  const saveProfile = async ({ name, phone }) => {
    setStudent(await api.saveMe({ name, phone }))
    await finishAuthFlow()
  }

  // ── Inscripciones ───────────────────────────────────────────────────────────
  const inscribe = async (eventId) => {
    // Sin sesión (o sin perfil) → abre el modal y deja el evento pendiente
    if (!user || !student) {
      openModal(eventId)
      return
    }
    try {
      setInscriptions(await api.addInscription(eventId))
    } catch (err) {
      alert(err.message)
    }
  }

  const cancelInscription = async (eventId) => {
    try {
      setInscriptions(await api.removeInscription(eventId))
    } catch (err) {
      alert(err.message)
    }
  }

  const isInscribed = (eventId) => inscriptions.includes(eventId)

  return (
    <AppContext.Provider
      value={{
        user, student, authReady,
        register, login, logout, resetPassword, saveProfile,
        inscriptions, inscribe, cancelInscription, isInscribed,
        modalOpen, modalMode, setModalMode, pendingEventId, openModal, closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// Hook personalizado — evita importar useContext + AppContext en cada componente
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
