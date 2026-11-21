# Tarea 3 — Login y registro con Firebase Authentication

**Firebase Authentication** es el proveedor de identidad: guarda las cuentas, verifica las contraseñas y emite un **ID Token** (JWT). La aplicación nunca ve ni guarda contraseñas.

```
Frontend (React)                Firebase Auth                 Backend (Express)
─────────────────               ─────────────                 ─────────────────
1. Registro / login  ─────────▶ verifica la contraseña
                     ◀───────── devuelve el ID Token (JWT)
2. Llamada a la API con  Authorization: Bearer <token>  ─────▶ 3. firebase-admin verifica
                                                                  firma + expiración
                                                               4. Guarda en SQLite el perfil
                                                                  e inscripciones (sin contraseña)
```

---

## 1. Configuración en la consola de Firebase

1. Entra a https://console.firebase.google.com → **Agregar proyecto** (puedes desactivar Google Analytics).
2. **Compilación → Authentication → Comenzar**.
3. Pestaña **Método de acceso** → **Correo electrónico/contraseña** → **Habilitar** → Guardar.
4. **Configuración del proyecto** (⚙️) → **General** → *Tus apps* → ícono **`</>`** (Web) → registra la app (sin Hosting).
   Copia los valores de `firebaseConfig`.
5. **Authentication → Configuración → Dominios autorizados**: verifica que esté `localhost` (viene por defecto).

## 2. Configuración en el proyecto

**Frontend:** copia `FrontendEventos-main/.env.example` como `FrontendEventos-main/.env` y completa:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_APP_ID=1:123...:web:abc...
```

**Backend:** copia `BackendEventos/.env.example` como `BackendEventos/.env`:

```
FIREBASE_PROJECT_ID=tu-proyecto
```

Luego ejecuta `npm start` en el backend y `npm run dev` en el frontend.

---

## 3. Propuesta de configuración mínima para contraseñas seguras

En **Authentication → Configuración → Política de contraseñas**:

| Opción | Valor propuesto | Por qué |
|---|---|---|
| Modo de aplicación | **Exigir** (*Require enforcement*) | Firebase rechaza en el servidor el registro con contraseñas que no cumplan la política |
| Longitud mínima | **8** caracteres | Mínimo recomendado por OWASP / NIST |
| Requerir mayúscula | ✅ | Aumenta las combinaciones posibles |
| Requerir minúscula | ✅ | |
| Requerir número | ✅ | |
| Requerir carácter especial | ✅ | Ej.: `! @ # $ %` |
| Exigir actualización al iniciar sesión | ✅ (si aparece) | Obliga a cambiarla a quien tenga una contraseña antigua que no cumple la política |

Medidas que Firebase ya aplica por defecto, para mencionar:
- **Hash de contraseñas con scrypt** (con *salt* por usuario): nunca se guardan en texto plano.
- **Límite de intentos:** tras varios fallos responde `auth/too-many-requests`, lo que frena ataques de fuerza bruta.
- **Protección contra enumeración de correos:** el login no revela si un correo está registrado (activada por defecto en proyectos nuevos; está en *Configuración → Acciones del usuario*).
- **Tokens de corta duración:** el ID Token expira en 1 hora y el SDK lo renueva solo.

> Nota: si la consola pide **"Actualizar a Firebase Authentication con Identity Platform"** para editar la política, acéptalo. Sigue siendo gratuito hasta 50 000 usuarios activos al mes.

**En el código:**
- El formulario de registro (`StudentModal.jsx`) llama a `validatePassword()`. Esa función descarga la política del proyecto y muestra en vivo qué requisitos se cumplen (✓ / ✗).
- La validación definitiva la hace Firebase en su servidor: si la contraseña no cumple, devuelve `auth/password-does-not-meet-requirements`.

---

## 4. Cómo se almacenan los datos

Los datos se reparten entre **Firebase** y **nuestra base SQLite**:

| Dato | Dónde se guarda |
|---|---|
| Correo, contraseña (hash scrypt), UID, nombre visible, fecha de creación y último acceso | **Firebase** (Authentication → Usuarios) |
| Nombre, teléfono, UID (enlace con Firebase) | **SQLite**, tabla `Students` |
| Inscripciones, reseñas, eventos | **SQLite**, tablas `Inscriptions`, `Reviews`, `Events` |

**Para mostrarlo en la presentación:**
1. **Authentication → Usuarios**: lista de cuentas con *Identificador* (correo), *Proveedor*, *Fecha de creación*, *Fecha de acceso* y *UID de usuario*. La contraseña **no aparece en ningún lado**.
2. En la misma pestaña, menú **⋮ → Parámetros de hash de contraseña**: muestra el algoritmo **SCRYPT** y sus parámetros (*base64_signer_key*, *salt_separator*, *rounds*, *mem_cost*). Esto prueba que Firebase guarda solo un hash.
3. Abre `BackendEventos/database/eventos.sqlite` con la extensión **SQLite Viewer** de VS Code. La tabla `Students` tiene `email`, `uid`, `name` y `phone`, **sin columna de contraseña**.
4. Para mostrar el token, en las herramientas del navegador (F12) → **Red**: cualquier petición a `/api/me` lleva la cabecera `Authorization: Bearer eyJ...`. Si la pegas en https://jwt.io verás `email`, `user_id`, `iss` (securetoken.google.com/tu-proyecto) y `exp`.

---

## 5. Qué hace cada archivo

| Archivo | Rol |
|---|---|
| `FrontendEventos-main/src/services/firebase.js` | Inicializa Firebase y traduce los errores al español |
| `FrontendEventos-main/src/context/AppContext.jsx` | `register`, `login`, `logout` y `resetPassword`; escucha la sesión con `onAuthStateChanged` |
| `FrontendEventos-main/src/components/StudentModal.jsx` | Modal con pestañas *Iniciar sesión* / *Crear cuenta*, requisitos de contraseña en vivo y “¿Olvidaste tu contraseña?” |
| `FrontendEventos-main/src/services/api.js` | Adjunta `Authorization: Bearer <ID Token>` a cada llamada |
| `BackendEventos/src/middleware/requireAuth.js` | Middleware `requireAuth`: verifica el token con `firebase-admin` y acepta solo correos institucionales |
| `BackendEventos/src/routes/` | Rutas públicas (ver eventos y reseñas) y protegidas (`/api/me`, inscribirse, reseñar, publicar) |
