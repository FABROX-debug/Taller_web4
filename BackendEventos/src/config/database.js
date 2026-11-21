// ============================================================
// Conexión a la base de datos (ORM: Sequelize + SQLite)
// ============================================================
import { Sequelize } from 'sequelize'
import { fileURLToPath } from 'node:url'

// La BD es un único archivo: BackendEventos/database/eventos.sqlite
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: fileURLToPath(new URL('../../database/eventos.sqlite', import.meta.url)),
  logging: false, // pon console.log para ver el SQL que genera el ORM
})
