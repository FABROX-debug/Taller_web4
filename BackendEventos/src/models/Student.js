import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Tabla Students — perfil del estudiante.
// La contraseña NO se guarda aquí: la gestiona Firebase Authentication.
export const Student = sequelize.define('Student', {
  email: { type: DataTypes.STRING, primaryKey: true },
  uid:   { type: DataTypes.STRING, unique: true },   // ID del usuario en Firebase
  name:  { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
}, { timestamps: false })
