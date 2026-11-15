const { Op } = require('sequelize');
const { Paciente, Consulta } = require('../models');
const httpError = require('../utils/httpError');

const incluirConsultas = [
  { model: Consulta, as: 'consultas', where: { activo: true }, required: false }
];

async function listar(q) {
  const where = q
    ? {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { objetivo: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      }
    : {};

  return Paciente.findAll({
    where,
    include: incluirConsultas,
    order: [
      ['nombre', 'ASC'],
      [{ model: Consulta, as: 'consultas' }, 'fecha', 'ASC']
    ]
  });
}

async function obtenerPorId(id) {
  const paciente = await Paciente.findByPk(id, { include: incluirConsultas });
  if (!paciente) throw httpError(404, 'Paciente no encontrado');
  return paciente;
}

async function crear(data) {
  const paciente = await Paciente.create(data);
  return obtenerPorId(paciente.id);
}

async function actualizar(id, data) {
  const paciente = await Paciente.findByPk(id);
  if (!paciente) throw httpError(404, 'Paciente no encontrado');

  await paciente.update(data);
  return obtenerPorId(id);
}

async function eliminar(id) {
  const paciente = await Paciente.findByPk(id);
  if (!paciente) throw httpError(404, 'Paciente no encontrado');

  await paciente.destroy();
  return { mensaje: 'Paciente eliminado' };
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
