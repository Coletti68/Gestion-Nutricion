const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Paciente = db.define(
  'Paciente',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_paciente'
    },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    edad: { type: DataTypes.INTEGER, allowNull: true },
    sexo: { type: DataTypes.STRING(20), allowNull: true },
    telefono: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    objetivo: { type: DataTypes.STRING(120), allowNull: true },
    alergias: { type: DataTypes.TEXT, allowNull: true },
    patologias: { type: DataTypes.TEXT, allowNull: true },
    preferencias: { type: DataTypes.TEXT, allowNull: true },
    gustos: { type: DataTypes.TEXT, allowNull: true },
    evita: { type: DataTypes.TEXT, allowNull: true },
    pesoInicial: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'peso_inicial',
      get() {
        const valor = this.getDataValue('pesoInicial');
        return valor === null || valor === undefined ? null : Number(valor);
      }
    },
    altura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      get() {
        const valor = this.getDataValue('altura');
        return valor === null || valor === undefined ? null : Number(valor);
      }
    },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  {
    tableName: 'paciente',
    timestamps: false
  }
);

module.exports = Paciente;
