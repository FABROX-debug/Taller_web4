# EventosFISI — Eventos Académicos

Aplicación web (SPA) para que los estudiantes exploren los eventos académicos del mes, consulten su detalle y gestionen sus inscripciones.

Los eventos, inscripciones y reseñas se obtienen del backend [`BackendEventos`](../BackendEventos), que los guarda en SQLite. El login y el registro se hacen con **Firebase Authentication**. La guía general está en el [README de la raíz](../README.md).

## Tecnologías

| Herramienta | Uso |
|---|---|
| [React 19](https://react.dev) | Interfaz de usuario basada en componentes |
| [React Router 7](https://reactrouter.com) | Navegación entre vistas (SPA) |
| [Vite 8](https://vite.dev) | Servidor de desarrollo y empaquetado |
| [Firebase Authentication](https://firebase.google.com/docs/auth) | Login y registro (proveedor de identidad) |
| CSS plano | Estilos globales en `src/index.css` |

## Funcionalidades

### Eventos del mes (`/`)
- Grilla de tarjetas con categoría, costo, fecha, hora, expositor, lugar y barra de cupos.
- Contadores de eventos **próximos** y **realizados**.
- **Filtros combinables:**
  - búsqueda por título, expositor o categoría;
  - categoría (Tecnología, Ciencias, Negocios, Humanidades, Salud, Arte y Cultura);
  - estado (todos, próximos, realizados);
  - costo (todos, gratuitos, de pago);
  - botón para limpiar los filtros activos.
- Inscripción directa desde la tarjeta. El botón se deshabilita si no quedan cupos.

### Detalle del evento (`/eventos/:id`)
- Descripción completa y **agenda** por sesiones.
- Panel lateral con fecha, hora, lugar, expositor (con su biografía), costo y ocupación.
- Inscripción o cancelación de la inscripción.
- Mensaje de "Evento no encontrado" si el ID no existe.

### Mis eventos (`/mis-eventos`)
- Lista de los eventos en los que el estudiante está inscrito, separada en pestañas **Próximos** y **Asistidos**.
- Cancelación de inscripciones de eventos que aún no se realizan.
- Contador de inscripciones en la barra de navegación.

### Login y registro (Firebase Authentication)
- Modal con pestañas **Iniciar sesión** y **Crear cuenta**, y opción **¿Olvidaste tu contraseña?**.
- Registro: nombre, correo institucional (`@unmsm.edu.pe` o `@universidad.edu.pe`), teléfono y contraseña.
- Mientras se escribe la contraseña, se muestran sus requisitos (✓ / ✗) según la política configurada en Firebase.
- Si alguien sin sesión intenta inscribirse, se abre el modal y, al entrar, queda inscrito en ese evento.
- Desde la barra de navegación se puede editar el perfil o **Salir** (cerrar sesión).

### Publicar evento (`/eventos/nuevo`) y reseñas
- Formulario para publicar un evento nuevo (requiere sesión).
- En el detalle de cada evento: reseñas con calificación de 1 a 5, comentario y promedio.

> Las fechas pasadas se calculan comparando con la fecha actual del sistema. Un evento pasado no admite inscripciones.

## Arquitectura

```
src/
├── main.jsx              # Punto de entrada: monta <App /> en #root
├── App.jsx               # Proveedor de contexto + definición de rutas
├── index.css             # Estilos globales
├── context/
│   └── AppContext.jsx    # Estado global: sesión (Firebase), perfil, inscripciones y modal
├── services/
│   ├── api.js            # Llamadas fetch al backend (adjunta el token de Firebase)
│   └── firebase.js       # Inicialización de Firebase Authentication
├── hooks/
│   └── useEventFilter.js # Lógica de filtrado de eventos
├── pages/                # Vistas asociadas a una ruta
│   ├── EventList.jsx
│   ├── EventDetail.jsx
│   ├── CreateEvent.jsx   # Publicar evento
│   └── MyEvents.jsx
├── components/           # Componentes reutilizables
│   ├── Layout.jsx        # Navbar + <Outlet /> para las páginas
│   ├── Navbar.jsx
│   ├── EventCard.jsx
│   ├── FilterBar.jsx
│   ├── ReviewSection.jsx # Reseñas del evento
│   └── StudentModal.jsx  # Login / registro / perfil
└── utils/
    └── dateUtils.js      # Formato de fechas/horas (locale es-PE)
```

### Flujo de componentes

```mermaid
flowchart TD
    App --> AppProvider
    AppProvider --> Router[BrowserRouter]
    Router --> Layout
    Router --> StudentModal
    Layout --> Navbar
    Layout --> EventList
    Layout --> EventDetail
    Layout --> MyEvents
    EventList --> FilterBar
    EventList --> EventCard
    MyEvents --> EventCard
    EventList -. usa .-> useEventFilter
    Layout --> CreateEvent
    EventDetail --> ReviewSection
    useEventFilter -. fetch .-> api[services/api.js]
    EventDetail -. fetch .-> api
    MyEvents -. fetch .-> api
    AppProvider -. sesión .-> firebase[services/firebase.js]
    api -. HTTP + token .-> Backend[(BackendEventos)]
```

### Decisiones principales

- **Estado global con Context API.** `AppContext` centraliza el perfil del estudiante, la lista de IDs de eventos inscritos y el estado del modal. Los componentes acceden a él con el hook `useApp()`, que lanza un error si se usa fuera de `<AppProvider>`.
- **Sesión con Firebase.** `onAuthStateChanged` mantiene la sesión al recargar la página. El perfil y las inscripciones se piden al backend.
- **Lógica separada de la vista.** El filtrado vive en el hook `useEventFilter` (memoizado con `useMemo`), y `FilterBar` solo recibe el estado y los *setters* por props.
- **Layout con rutas anidadas.** `Layout` comparte la barra de navegación entre todas las páginas mediante `<Outlet />`. Cualquier ruta desconocida redirige a `/`.
- **Modal global.** `StudentModal` se renderiza una sola vez fuera de las rutas y se abre desde cualquier parte con `openModal(eventId?)`. Si recibe un `eventId`, la inscripción a ese evento queda pendiente hasta que el estudiante confirme sus datos.
- **Datos del backend.** Todas las llamadas HTTP están en `services/api.js`, que adjunta el ID Token de Firebase cuando hay sesión.

## Cómo ejecutar el proyecto

Requisitos: **Node.js 20.19+ o 22.12+** y npm.

```bash
npm install      # instalar dependencias (solo la primera vez)
npm run dev      # servidor de desarrollo en http://localhost:5173
```

Otros scripts:

```bash
npm run build    # genera la versión de producción en dist/
npm run preview  # sirve localmente la versión de producción
```

## Datos de prueba

Los eventos de ejemplo están en el backend, en [`BackendEventos/src/data/seedEvents.js`](../BackendEventos/src/data/seedEvents.js). Cada evento tiene esta forma:

```js
{
  id: 1,
  title: 'Introducción a la Inteligencia Artificial',
  description: '...',
  date: '2026-10-03',        // YYYY-MM-DD
  time: '10:00',             // HH:mm
  speaker: 'Dr. Carlos Mendoza',
  speakerBio: '...',
  category: 'Tecnología',    // una de CATEGORIES
  isFree: true,
  cost: 0,                   // en soles (S/)
  capacity: 100,
  enrolled: 98,              // inscritos previos (simulados)
  location: 'Auditorio Principal — Pabellón A',
  agenda: [{ session: 'Sesión 1', time: '10:00', topic: '...' }],
}
```

Para identificarte en la aplicación usa cualquier correo que termine en `@unmsm.edu.pe`, por ejemplo `u202100001@unmsm.edu.pe`.
