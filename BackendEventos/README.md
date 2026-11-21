# BackendEventos

API REST para FrontendEventos.
- **Servidor:** Node.js + Express 5.
- **Base de datos:** SQLite, con el ORM Sequelize.
- **Login:** Firebase Authentication.

## Ejecutar

```bash
cp .env.example .env   # coloca tu FIREBASE_PROJECT_ID
npm install
npm start              # http://localhost:3000
```

La base `database/eventos.sqlite` se crea sola la primera vez, con los eventos de ejemplo.
Para empezar desde cero, detén el servidor y ejecuta `npm run reset-db`.

## Estructura

```
src/
├── server.js                  Punto de entrada: Express, rutas y arranque
├── config/
│   ├── database.js            Conexión de Sequelize a SQLite
│   └── firebase.js            firebase-admin (verifica tokens)
├── models/
│   ├── index.js               Relaciones + initDb()
│   ├── Event.js  Student.js  Inscription.js  Review.js
├── middleware/
│   └── requireAuth.js         Exige un token válido de Firebase
├── routes/
│   ├── events.routes.js       /api/events, /api/categories, reseñas
│   └── me.routes.js           /api/me (perfil e inscripciones)
└── data/
    ├── categories.js          Categorías válidas
    └── seedEvents.js          Eventos de ejemplo
```

## Endpoints

🔐 = requiere `Authorization: Bearer <ID Token de Firebase>`

| Método | Ruta | Descripción |
|---|---|---|
| GET    | `/api/categories` | Lista de categorías |
| GET    | `/api/events` | Lista de eventos |
| GET    | `/api/events/:id` | Detalle de un evento |
| POST   | `/api/events` 🔐 | Publica un evento |
| GET    | `/api/events/:id/reviews` | Reseñas del evento |
| POST   | `/api/events/:id/reviews` 🔐 | Agrega una reseña `{ rating, comment }` |
| GET    | `/api/me` 🔐 | Perfil del usuario (404 si no lo completó) |
| PUT    | `/api/me` 🔐 | Crea o actualiza el perfil `{ name, phone }` |
| GET    | `/api/me/inscriptions` 🔐 | IDs de eventos inscritos |
| POST   | `/api/me/inscriptions` 🔐 | Inscribe `{ eventId }` (valida fecha y cupos) |
| DELETE | `/api/me/inscriptions/:eventId` 🔐 | Cancela la inscripción |

Explicaciones de cada tarea: carpeta [`../docs`](../docs).
