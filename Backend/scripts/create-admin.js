const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = require('../config/db');
const { Usuario } = require('../models');

const USO = 'Uso: npm run user:create -- "Nombre Apellido" email@dominio.com contraseña';

async function main() {
  const [nombre, email, password] = process.argv.slice(2);

  if (!nombre || !email || !password) {
    console.error(USO);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const emailNormalizado = email.toLowerCase().trim();
  const existente = await Usuario.findOne({ where: { email: emailNormalizado } });

  if (existente) {
    console.error(`Ya existe un usuario con el email ${emailNormalizado}.`);
    await db.close();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const usuario = await Usuario.create({
    nombre: nombre.trim(),
    email: emailNormalizado,
    passwordHash
  });

  console.log(`Usuario creado: ${usuario.nombre} <${usuario.email}>`);
  await db.close();
}

main().catch(async (err) => {
  console.error('No se pudo crear el usuario:', err.message);
  await db.close();
  process.exit(1);
});
