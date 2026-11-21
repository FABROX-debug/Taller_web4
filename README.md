# EventosFISI — Taller Web

Aplicación de eventos académicos: frontend en React y backend en Node.js, con base de datos SQLite y login con Firebase.

## Estructura

```
TallerWEB/
├── README.md                     ← este archivo
├── docs/                         ← explicación de cada tarea
│   ├── 01-backend-api.md
│   ├── 02-orm-base-de-datos.md
│   └── 03-login-firebase.md
│
├── BackendEventos/               ← API REST (Node.js + Express)
│   ├── .env                      ← FIREBASE_PROJECT_ID
│   ├── database/
│   │   └── eventos.sqlite        ← la base de datos (se crea sola)
│   └── src/
│       ├── server.js             ← punto de entrada
│       ├── config/               ← conexión a la BD y a Firebase
│       ├── models/               ← tablas del ORM (Sequelize)
│       ├── middleware/           ← verificación del token de Firebase
│       ├── routes/               ← rutas de la API
│       └── data/                 ← categorías y eventos de ejemplo
│
└── FrontendEventos-main/         ← SPA (React + Vite)
    ├── .env                      ← configuración de Firebase
    └── src/
        ├── pages/                ← pantallas (una por ruta)
        ├── components/           ← componentes reutilizables
        ├── context/              ← estado global y sesión
        ├── services/             ← api.js (backend) y firebase.js (login)
        ├── hooks/  utils/
        └── index.css
```

## Cómo ejecutar
Se necesitan dos terminales.

```bash
# Terminal 1 — backend (http://localhost:3000)
cd BackendEventos
npm install        # solo la primera vez
npm start
```

```bash
# Terminal 2 — frontend (http://localhost:5173)
cd FrontendEventos-main
npm install        # solo la primera vez
npm run dev
```

## Tareas
| # | Tarea | Documento |
|---|---|---|
| 1 | Backend no bloqueante para FrontendEventos | [docs/01-backend-api.md](docs/01-backend-api.md) |
| 2 | ORM + base de datos y dos funcionalidades nuevas | [docs/02-orm-base-de-datos.md](docs/02-orm-base-de-datos.md) |
| 3 | Login y registro con un proveedor de identidad | [docs/03-login-firebase.md](docs/03-login-firebase.md) |
