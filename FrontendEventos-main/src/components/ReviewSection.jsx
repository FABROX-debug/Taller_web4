import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

// Reseñas de un evento: lista (lectura de la BD) + formulario (escritura en la BD)
function ReviewSection({ eventId }) {
  const { student, openModal } = useApp()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getReviews(eventId).then(setReviews).catch(console.error)
  }, [eventId])

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const review = await api.addReview(eventId, { rating, comment })
      setReviews((prev) => [review, ...prev])
      setComment('')
      setRating(5)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="detail-agenda">
      <h3 className="detail-section-title">
        💬 Reseñas {average && <span className="text-muted">— {average} ★ ({reviews.length})</span>}
      </h3>

      {student ? (
        <form onSubmit={handleSubmit} className="login-form" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="review-rating" className="form-label">Calificación</label>
            <select
              id="review-rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="select"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{stars(n)} ({n})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="review-comment" className="form-label">Comentario</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Qué te pareció el evento?"
              className="input"
              rows={3}
            />
            {error && <span className="field-error" role="alert">{error}</span>}
          </div>
          <button type="submit" className="btn btn--primary btn--sm">Publicar reseña</button>
        </form>
      ) : (
        <p className="text-muted">
          <button onClick={() => openModal(null)} className="link-btn">Inicia sesión</button>{' '}
          para dejar una reseña.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted">Aún no hay reseñas. ¡Sé el primero!</p>
      ) : (
        <ol className="agenda-list">
          {reviews.map((r) => (
            <li key={r.id} className="agenda-item">
              <div className="agenda-item__meta">
                <span className="agenda-item__time">{stars(r.rating)}</span>
                <span className="agenda-item__session">
                  {r.studentName} · {new Date(r.createdAt).toLocaleDateString('es-PE')}
                </span>
              </div>
              <p className="agenda-item__topic">{r.comment}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default ReviewSection
