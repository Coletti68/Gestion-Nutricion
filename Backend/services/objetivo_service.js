const db = require('../config/db');
const { Objetivo, Paciente } = require('../models');
const httpError = require('../utils/httpError');

async function listar() {
  return Objetivo.findAll({
    where: { activo: true },
    order: [
      ['orden', 'ASC'],
      ['nombre', 'ASC']
    ]
  });
}

async function crear({ nombre, orden }) {
  const normalizado = nombre.trim();
  const existente = await Objetivo.findOne({ where: { nombre: normalizado } });

  // Si estaba desactivado, se reutiliza en lugar de duplicar el nombre.
  if (existente) {
    if (existente.activo) throw httpError(409, 'Ya existe un objetivo con ese nombre');

    await existente.update({ activo: true, orden: orden ?? existente.orden });
    return existente;
  }

  return Objetivo.create({ nombre: normalizado, orden: orden ?? 0 });
}

async function actualizar(id, { nombre, orden }) {
  const objetivo = await Objetivo.findByPk(id);
  if (!objetivo) throw httpError(404, 'Objetivo no encontrado');

  const normalizado = nombre?.trim();
  if (normalizado && normalizado !== objetivo.nombre) {
    const duplicado = await Objetivo.findOne({ where: { nombre: normalizado } });
    if (duplicado) throw httpError(409, 'Ya existe un objetivo con ese nombre');
  }

  return db.transaction(async (transaccion) => {
    const anterior = objetivo.nombre;

    await objetivo.update(
      {
        ...(normalizado ? { nombre: normalizado } : {}),
        ...(orden !== undefined ? { orden } : {})
      },
      { transaction: transaccion }
    );

    // Los pacientes guardan el objetivo como texto: se renombran juntos.
    if (normalizado && normalizado !== anterior) {
      await Paciente.update(
        { objetivo: normalizado },
        { where: { objetivo: anterior }, transaction: transaccion }
      );
    }

    return objetivo;
  });
}

async function eliminar(id) {
  const objetivo = await Objetivo.findByPk(id);
  if (!objetivo) throw httpError(404, 'Objetivo no encontrado');

  await objetivo.update({ activo: false });
  return { mensaje: 'Objetivo desactivado' };
}

module.exports = { listar, crear, actualizar, eliminar };
