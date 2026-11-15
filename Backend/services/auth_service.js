const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario_model');
const httpError = require('../utils/httpError');

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );
}

function datosPublicos(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
}

async function login(email, password) {
  const usuario = await Usuario.scope('conPassword').findOne({
    where: { email: String(email).toLowerCase().trim() }
  });

  if (!usuario || !usuario.activo) {
    throw httpError(401, 'Credenciales inválidas');
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    throw httpError(401, 'Credenciales inválidas');
  }

  return { token: firmarToken(usuario), usuario: datosPublicos(usuario) };
}

async function obtenerPerfil(id) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw httpError(404, 'Usuario no encontrado');
  return datosPublicos(usuario);
}

async function cambiarPassword(id, actual, nueva) {
  const usuario = await Usuario.scope('conPassword').findByPk(id);
  if (!usuario) throw httpError(404, 'Usuario no encontrado');

  const coincide = await bcrypt.compare(actual, usuario.passwordHash);
  if (!coincide) throw httpError(400, 'La contraseña actual no es correcta');

  usuario.passwordHash = await bcrypt.hash(nueva, 10);
  await usuario.save();

  return { mensaje: 'Contraseña actualizada' };
}

module.exports = { login, obtenerPerfil, cambiarPassword };
