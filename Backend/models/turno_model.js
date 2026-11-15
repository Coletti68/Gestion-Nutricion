const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Turno = db.define(
  'Turno',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_turno'
    },
    pacienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_paciente'
    },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
      get() {
        const valor = this.getDataValue('hora');
        return valor ? String(valor).slice(0, 5) : valor;
      }
    },
    duracionMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      field: 'duracion_minutos'
    },
    motivo: { type: DataTypes.STRING(120), allowNull: false },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Confirmado', 'Realizado', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    ordenManual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'orden_manual'
    },
    recordatorio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    reprogramado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    observaciones: { type: DataTypes.TEXT, allowNull: true }
  },
  {
    tableName: 'turno',
    timestamps: false
  }
);

module.exports = Turno;
