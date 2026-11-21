import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Navbar() {
  const { user, student, logout, inscriptions, openModal } = useApp()

  return (
    <header className="navbar">
      <div className="navbar__inner container">

        {/* Logo / Marca */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon" aria-hidden="true">🎓</span>
          <span className="navbar__brand-text">Eventos<strong>FISI</strong></span>
        </Link>

        {/* Navegación principal */}
        <nav className="navbar__nav" aria-label="Navegación principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Eventos del Mes
          </NavLink>
          <NavLink
            to="/eventos/nuevo"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Publicar Evento
          </NavLink>
          <NavLink
            to="/mis-eventos"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Mis Eventos
            {inscriptions.length > 0 && (
              <span className="navbar__badge">{inscriptions.length}</span>
            )}
          </NavLink>
        </nav>

        {/* Sección de estudiante */}
        <div className="navbar__student">
          {user ? (
            <>
              <div className="navbar__student-info">
                <span className="navbar__student-icon" aria-hidden="true">👤</span>
                <div className="navbar__student-text">
                  <span className="navbar__student-name" title={user.email}>
                    {student?.name || user.displayName || 'Perfil incompleto'}
                  </span>
                  <span className="navbar__student-email">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => openModal(null, 'profile')}
                className="btn btn--ghost btn--sm"
                title="Editar mis datos"
              >
                {student ? 'Editar' : 'Completar perfil'}
              </button>
              <button
                onClick={logout}
                className="btn btn--ghost btn--sm navbar__exit-btn"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => openModal(null, 'login')}
              className="btn btn--primary btn--sm"
            >
              🔐 Iniciar sesión
            </button>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar
