# Tarea 1 — Backend para FrontendEventos

## Enunciado
- Generar un backend no bloqueante (se eligió **Node.js**) que implemente las APIs que necesita FrontendEventos.
- Modificar el frontend solo lo necesario para llamar al backend.
- Sin base de datos: datos en memoria.

## Solución
- **Tecnología:** Node.js + Express. Es el mismo lenguaje del frontend (JavaScript) y lo más simple de explicar.
- **Frontend:** se reemplazó la lectura de `mockData.js` y de `localStorage` por llamadas `fetch` a la API, centralizadas en `src/services/api.js`. Las pantallas y los filtros no cambiaron.

> En la Tarea 2 los datos pasaron de memoria a SQLite, y en la Tarea 3 se agregó el login con Firebase. Las rutas actuales están en [`BackendEventos/README.md`](../BackendEventos/README.md).

## ¿Por qué es no bloqueante?
Node.js atiende todas las peticiones en **un solo hilo** con un *event loop*:
- Las operaciones lentas (consultas a la BD, verificación de tokens) son **asíncronas**: devuelven una Promesa y el handler espera con `await`.
- Mientras una petición espera, el event loop atiende otras.
- Ejemplo en `src/routes/events.routes.js`:

```js
router.get('/events', async (req, res) => {
  res.json(await Event.findAll(...))   // ← el await libera el hilo mientras la BD responde
})
```
