# Tarea 2 — ORM y base de datos

## Enunciado
- Usar un ORM/ODM para grabar y leer de una base de datos, preferiblemente no bloqueante.
- Demostrar dos funcionalidades nuevas que graben y consulten datos.

## Solución
| | |
|---|---|
| **ORM** | Sequelize 6 |
| **Base de datos** | SQLite (relacional). Es un solo archivo: `BackendEventos/database/eventos.sqlite`, sin instalar ningún servidor. |
| **Driver** | `sqlite3`, asíncrono |

### Dónde está cada cosa
| Archivo | Contenido |
|---|---|
| `BackendEventos/src/config/database.js` | Conexión de Sequelize a SQLite |
| `BackendEventos/src/models/*.js` | Un archivo por tabla: `Event`, `Student`, `Inscription`, `Review` |
| `BackendEventos/src/models/index.js` | Relaciones entre tablas y `initDb()`: crea las tablas y carga los eventos de ejemplo la primera vez |
| `BackendEventos/src/data/seedEvents.js` | Eventos de ejemplo |

## ¿El ORM es bloqueante?
**No.** Todos los métodos de Sequelize (`findAll`, `findByPk`, `create`, `count`, `destroy`, `upsert`) devuelven una **Promesa** y se usan con `await`.

- Por debajo, el driver `sqlite3` ejecuta cada consulta en el *thread pool* de libuv, fuera del hilo principal. Cuando termina, avisa con un *callback*.
- Mientras tanto, el event loop sigue atendiendo otras peticiones.
- La alternativa `better-sqlite3` es **síncrona** y bloquearía el event loop. Por eso no se usó.

## Dos funcionalidades nuevas
| Funcionalidad | Frontend | Backend (graba / consulta) |
|---|---|---|
| **1. Publicar evento** | Menú *Publicar Evento* → `src/pages/CreateEvent.jsx` | `POST /api/events` → `Event.create()`; aparece en la lista con `GET /api/events` → `Event.findAll()` |
| **2. Reseñas de eventos** | En el detalle del evento → `src/components/ReviewSection.jsx` | `POST /api/events/:id/reviews` → `Review.create()`; `GET /api/events/:id/reviews` → `Review.findAll()`, con el promedio |

**Para demostrarlo:** publica un evento y deja una reseña, reinicia el backend y comprueba que siguen ahí. Después abre `eventos.sqlite` con la extensión **SQLite Viewer** de VS Code y muestra las tablas.
