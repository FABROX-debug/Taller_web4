import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useApp } from '../context/AppContext'

const EMPTY = {
  title: '', description: '', date: '', time: '', speaker: '', speakerBio: '',
  category: '', location: '', cost: 0, capacity: 30,
}

// Formulario para publicar un evento nuevo (se guarda en la BD)
function CreateEvent() {
  const navigate = useNavigate()
  const { user, openModal } = useApp()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const created = await api.createEvent(form)
      navigate(`/eventos/${created.id}`) // muestra el evento recién creado
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Campo de texto reutilizable
  const field = (name, label, props = {}) => (
    <div className="form-group">
      <label htmlFor={`ev-${name}`} className="form-label">
        {label} {props.required && <span className="required">*</span>}
      </label>
      <input
        id={`ev-${name}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="input"
        {...props}
      />
    </div>
  )

  // Publicar eventos requiere haber iniciado sesión
  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">🔐</span>
          <h3>Inicia sesión para publicar un evento</h3>
          <button onClick={() => openModal(null, 'login')} className="btn btn--primary">
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Publicar Evento</h2>
          <p className="page-subtitle">Registra un nuevo evento académico.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="info-card login-form" style={{ maxWidth: 640 }}>
        {field('title', 'Título', { required: true })}

        <div className="form-group">
          <label htmlFor="ev-description" className="form-label">
            Descripción <span className="required">*</span>
          </label>
          <textarea
            id="ev-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input"
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ev-category" className="form-label">
            Categoría <span className="required">*</span>
          </label>
          <select
            id="ev-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="select"
            required
          >
            <option value="">Selecciona…</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {field('date', 'Fecha', { type: 'date', required: true })}
        {field('time', 'Hora', { type: 'time', required: true })}
        {field('location', 'Lugar', { required: true })}
        {field('speaker', 'Expositor', { required: true })}
        {field('speakerBio', 'Biografía del expositor')}
        {field('capacity', 'Capacidad', { type: 'number', min: 1, required: true })}
        {field('cost', 'Costo en S/ (0 = gratuito)', { type: 'number', min: 0, step: '0.01' })}

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
          {saving ? 'Guardando…' : 'Publicar evento'}
        </button>
      </form>
    </div>
  )
}

export default CreateEvent
