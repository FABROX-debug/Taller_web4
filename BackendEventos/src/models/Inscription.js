import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Tabla Inscriptions — qué estudiante está inscrito en qué evento
export const Inscription = sequelize.define('Inscription', {
  studentEmail: { type: DataTypes.STRING,  allowNull: false },
  eventId:      { type: DataTypes.INTEGER, allowNull: false },
}, {
  indexes: [{ unique: true, fields: ['studentEmail', 'eventId'] }], // no duplicar inscripción
})
