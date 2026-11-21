import { useState, useEffect } from 'react'
import { validatePassword } from 'firebase/auth'
import { useApp } from '../context/AppContext'
import { auth, authErrorMessage } from '../services/firebase'

const ALLOWED_DOMAINS = ['@unmsm.edu.pe', '@universidad.edu.pe']

// Requisitos de la política de contraseñas configurada en Firebase.
// validatePassword() descarga la política del proyecto y dice cuáles se cumplen.
const RULES = [
  ['meetsMinPasswordLength',            (p) => `Al menos ${p.minPasswordLength} caracteres`],
  ['containsUppercaseLetter',           () => 'Una letra mayúscula'],
  ['containsLowercaseLetter',           () => 'Una letra minúscula'],
  ['containsNumericCharacter',          () => 'Un número'],
  ['containsNonAlphanumericCharacter',  () => 'Un símbolo (ej: ! @ # $ %)'],
]

// Modal de autenticación: 'login' | 'register' | 'profile'
function StudentModal() {
  const {
    user, student, modalOpen, modalMode, setModalMode, pendingEventId, closeModal,
    login, register, resetPassword, saveProfile,
  } = useApp()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState(null)

  // Pre-rellena el formulario al abrir
  useEffect(() => {
    if (modalOpen) {
      setForm({
        name:  student?.name  || user?.displayName || '',
        email: student?.email || user?.email || '',
        phone: student?.phone || '',
        password: '',
      })
      setErrors({})
      setMessage('')
      setPasswordStatus(null)
    }
  }, [modalOpen, student, user])

  // Valida la contraseña contra la política de Firebase mientras se escribe
  useEffect(() => {
    if (modalMode !== 'register' || !form.password) return setPasswordStatus(null)
    let active = true
    validatePassword(auth, form.password)
      .then((status) => active && setPasswordStatus(status))
      .catch(() => active && setPasswordStatus(null))
    return () => { active = false }
  }, [form.password, modalMode])

  if (!modalOpen) return null

  const isLogin = modalMode === 'login'
  const isRegister = modalMode === 'register'
  const isProfile = modalMode === 'profile'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!isLogin) {
      if (form.name.trim().length < 3) {
        newErrors.name = 'Ingresa tu nombre completo (mín. 3 caracteres).'
      }
      if (!form.phone.trim()) {
        newErrors.phone = 'El teléfono es obligatorio.'
      } else if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-+()]/g, ''))) {
        newErrors.phone = 'Ingresa un número de teléfono válido.'
      }
    }
    if (!isProfile) {
      const email = form.email.trim().toLowerCase()
      if (!email) {
        newErrors.email = 'El correo es obligatorio.'
      } else if (!ALLOWED_DOMAINS.some((d) => email.endsWith(d))) {
        newErrors.email = 'Usa tu correo institucional (ej: u202100001@unmsm.edu.pe).'
      }
      if (!form.password) {
        newErrors.password = 'La contraseña es obligatoria.'
      } else if (isRegister && passwordStatus && !passwordStatus.isValid) {
        newErrors.password = 'La contraseña no cumple todos los requisitos.'
      }
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const data = {
      name:     form.name.trim(),
      email:    form.email.trim().toLowerCase(),
      phone:    form.phone.trim(),
      password: form.password,
    }

    setLoading(true)
    try {
      if (isLogin) await login(data)
      else if (isRegister) await register(data)
      else await saveProfile(data)
    } catch (err) {
      setMessage(err.code ? authErrorMessage(err) : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const email = form.email.trim().toLowerCase()
    if (!email) return setErrors({ email: 'Escribe tu correo para recuperar la contraseña.' })
    try {
      await resetPassword(email)
      setMessage(`Si existe una cuenta con ${email}, te enviamos un correo para restablecer la contraseña.`)
    } catch (err) {
      setMessage(authErrorMessage(err))
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal()
  }

  const title = isLogin ? '🔐 Iniciar sesión' : isRegister ? '🎓 Crear cuenta' : '✏️ Mi perfil'
  const subtitle = isLogin
    ? pendingEventId ? 'Inicia sesión para inscribirte en el evento.' : 'Ingresa con tu correo institucional.'
    : isRegister
      ? 'Regístrate con tu correo institucional.'
      : student ? 'Actualiza tu información de contacto.' : 'Completa tus datos para inscribirte en eventos.'
  const submitLabel = isLogin
    ? 'Iniciar sesión'
    : isRegister
      ? pendingEventId ? 'Crear cuenta e inscribirme' : 'Crear cuenta'
      : pendingEventId ? 'Guardar e inscribirme' : 'Guardar datos'

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
    >
      <div className="modal">

        {/* Encabezado */}
        <div className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">{title}</h2>
            <p className="modal__subtitle">{subtitle}</p>
          </div>
          <button onClick={closeModal} className="modal__close" aria-label="Cerrar">✕</button>
        </div>

        {/* Pestañas login / registro */}
        {!isProfile && (
          <div className="tabs" role="tablist" style={{ margin: '0 1.5rem' }}>
            <button
              type="button" role="tab" aria-selected={isLogin}
              className={`tab ${isLogin ? 'tab--active' : ''}`}
              onClick={() => setModalMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button" role="tab" aria-selected={isRegister}
              className={`tab ${isRegister ? 'tab--active' : ''}`}
              onClick={() => setModalMode('register')}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="modal__body" noValidate>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="student-name" className="form-label">
                Nombre completo <span className="required">*</span>
              </label>
              <input
                id="student-name" type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="Ej: Juan Pérez García"
                className={`input ${errors.name ? 'input--error' : ''}`}
                autoComplete="name"
              />
              {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="student-email" className="form-label">
              Correo institucional <span className="required">*</span>
            </label>
            <input
              id="student-email" type="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="u202100001@unmsm.edu.pe"
              className={`input ${errors.email ? 'input--error' : ''}`}
              autoComplete="email"
              disabled={isProfile} // el correo es el de la cuenta de Firebase
            />
            {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="student-phone" className="form-label">
                Teléfono / Celular <span className="required">*</span>
              </label>
              <input
                id="student-phone" type="tel" name="phone"
                value={form.phone} onChange={handleChange}
                placeholder="Ej: 987 654 321"
                className={`input ${errors.phone ? 'input--error' : ''}`}
                autoComplete="tel"
              />
              {errors.phone && <span className="field-error" role="alert">{errors.phone}</span>}
            </div>
          )}

          {!isProfile && (
            <div className="form-group">
              <label htmlFor="student-password" className="form-label">
                Contraseña <span className="required">*</span>
              </label>
              <input
                id="student-password" type="password" name="password"
                value={form.password} onChange={handleChange}
                className={`input ${errors.password ? 'input--error' : ''}`}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {errors.password && <span className="field-error" role="alert">{errors.password}</span>}

              {/* Requisitos de la política de contraseñas (solo en registro) */}
              {isRegister && passwordStatus && (
                <ul className="text-muted" style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
                  {RULES
                    .filter(([key]) => passwordStatus[key] !== undefined)
                    .map(([key, label]) => (
                      <li key={key} className={passwordStatus[key] ? 'text-success' : ''}>
                        {passwordStatus[key] ? '✓' : '✗'} {label(passwordStatus.passwordPolicy.customStrengthOptions)}
                      </li>
                    ))}
                </ul>
              )}

              {isLogin && (
                <button type="button" onClick={handleResetPassword} className="link-btn" style={{ marginTop: '0.5rem' }}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
          )}

          {message && <p className="form-error" role="alert">{message}</p>}

          {/* Aviso de privacidad */}
          <p className="modal__privacy">
            🔒 Tu contraseña la gestiona Firebase Authentication; esta aplicación nunca la ve ni la guarda.
          </p>

          {/* Acciones */}
          <div className="modal__footer">
            <button type="button" onClick={closeModal} className="btn btn--ghost">Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Procesando…' : submitLabel}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default StudentModal
