const { Paciente, Consulta } = require('../models');
const httpError = require('../utils/httpError');

async function verificarPaciente(pacienteId) {
  const paciente = await Paciente.findByPk(pacienteId);
  if (!paciente) throw httpError(404, 'Paciente no encontrado');
  return paciente;
}

async function listarPorPaciente(pacienteId) {
  await verificarPaciente(pacienteId);
  return Consulta.findAll({
    where: { pacienteId, activo: true },
    order: [['fecha', 'ASC']]
  });
}

async function crear(pacienteId, data) {
  await verificarPaciente(pacienteId);
  return Consulta.create({ ...data, pacienteId });
}

async function actualizar(id, data) {
  const consulta = await Consulta.findOne({ where: { id, activo: true } });
  if (!consulta) throw httpError(404, 'Consulta no encontrada');

  await consulta.update(data);
  return consulta;
}

// Baja lógica: la sesión se oculta pero no se pierde el historial.
async function eliminar(id) {
  const consulta = await Consulta.findOne({ where: { id, activo: true } });
  if (!consulta) throw httpError(404, 'Consulta no encontrada');

  await consulta.update({ activo: false });
  return { mensaje: 'Consulta desactivada' };
}

module.exports = { listarPorPaciente, crear, actualizar, eliminar };
