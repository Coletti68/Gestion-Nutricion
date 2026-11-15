const { DataTypes } = require('sequelize');
const db = require('../config/db');

// Excepción de un día puntual; si cerrado = true, no se atiende.
const DisponibilidadDia = db.define(
  'DisponibilidadDia',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_disponibilidad_dia'
    },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'hora_inicio',
      get() {
        const valor = this.getDataValue('horaInicio');
        return valor ? String(valor).slice(0, 5) : valor;
      }
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'hora_fin',
      get() {
        const valor = this.getDataValue('horaFin');
        return valor ? String(valor).slice(0, 5) : valor;
      }
    },
    duracionMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      field: 'duracion_minutos'
    },
    cerrado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'disponibilidad_dia',
    timestamps: false
  }
);

module.exports = DisponibilidadDia;
