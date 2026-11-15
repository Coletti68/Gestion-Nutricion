const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Usuario = db.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_usuario'
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'usuario',
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] }
    },
    scopes: {
      conPassword: {
        attributes: { include: ['passwordHash'] }
      }
    }
  }
);

module.exports = Usuario;
