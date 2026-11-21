import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Tabla Events — eventos académicos
export const Event = sequelize.define('Event', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING,  allowNull: false },
  description: { type: DataTypes.TEXT,    allowNull: false },
  date:        { type: DataTypes.STRING,  allowNull: false }, // 'YYYY-MM-DD'
  time:        { type: DataTypes.STRING,  allowNull: false }, // 'HH:mm'
  speaker:     { type: DataTypes.STRING,  allowNull: false },
  speakerBio:  { type: DataTypes.TEXT },
  category:    { type: DataTypes.STRING,  allowNull: false },
  isFree:      { type: DataTypes.BOOLEAN, defaultValue: true },
  cost:        { type: DataTypes.FLOAT,   defaultValue: 0 },
  capacity:    { type: DataTypes.INTEGER, allowNull: false },
  enrolled:    { type: DataTypes.INTEGER, defaultValue: 0 },  // inscritos previos (simulados)
  location:    { type: DataTypes.STRING,  allowNull: false },
  agenda:      { type: DataTypes.JSON },                      // [{ session, time, topic }] | null
}, { timestamps: false })
