import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Tabla Reviews — reseñas de un evento (calificación + comentario)
export const Review = sequelize.define('Review', {
  eventId:      { type: DataTypes.INTEGER, allowNull: false },
  studentEmail: { type: DataTypes.STRING,  allowNull: false },
  studentName:  { type: DataTypes.STRING,  allowNull: false },
  rating:       { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment:      { type: DataTypes.TEXT,    allowNull: false },
})
