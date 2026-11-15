const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Objetivo = db.define(
  'Objetivo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_objetivo'
    },
    nombre: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    tableName: 'objetivo',
    timestamps: false
  }
);

module.exports = Objetivo;
