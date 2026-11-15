const { DataTypes } = require('sequelize');
const db = require('../config/db');

// Plantilla semanal: 1 = Lunes ... 7 = Domingo.
const DisponibilidadSemanal = db.define(
  'DisponibilidadSemanal',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_disponibilidad'
    },
    diaSemana: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: 'dia_semana'
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_inicio',
      get() {
        const valor = this.getDataValue('horaInicio');
        return valor ? String(valor).slice(0, 5) : valor;
      }
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: false,
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
    }
  },
  {
    tableName: 'disponibilidad_semanal',
    timestamps: false
  }
);

module.exports = DisponibilidadSemanal;
