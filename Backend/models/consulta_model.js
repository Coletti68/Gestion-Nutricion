const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Consulta = db.define(
  'Consulta',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_consulta'
    },
    pacienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_paciente'
    },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    motivo: { type: DataTypes.STRING(120), allowNull: false },
    peso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() {
        const valor = this.getDataValue('peso');
        return valor === null || valor === undefined ? null : Number(valor);
      }
    },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    tableName: 'consulta',
    timestamps: false
  }
);

module.exports = Consulta;
