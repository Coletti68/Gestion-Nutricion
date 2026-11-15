const { Op } = require('sequelize');
const db = require('../config/db');
const { Paciente, Consulta, Turno } = require('../models');
const disponibilidadService = require('./disponibilidad_service');
const httpError = require('../utils/httpError');

async function verificarPaciente(pacienteId) {
  const paciente = await Paciente.findByPk(pacienteId);
  if (!paciente) throw httpError(404, 'Paciente no encontrado');
  return paciente;
}

async function listar(filtros = {}) {
  const where = {};

  if (filtros.pacienteId) where.pacienteId = Number(filtros.pacienteId);
  if (filtros.estado) where.estado = filtros.estado;

  if (filtros.desde || filtros.hasta) {
    where.fecha = {};
    if (filtros.desde) where.fecha[Op.gte] = filtros.desde;
    if (filtros.hasta) where.fecha[Op.lte] = filtros.hasta;
  }

  return Turno.findAll({
    where,
    order: [
      ['fecha', 'ASC'],
      ['hora', 'ASC']
    ]
  });
}

async function crear(data) {
  await verificarPaciente(data.pacienteId);

  // Solo se permite asignar un turno a un slot libre de la disponibilidad.
  const slot = await disponibilidadService.validarSlot(data.fecha, data.hora);
  return Turno.create({ ...data, duracionMinutos: slot.duracionMinutos });
}

async function actualizar(id, data) {
  const turno = await Turno.findByPk(id);
  if (!turno) throw httpError(404, 'Turno no encontrado');

  if (data.pacienteId) await verificarPaciente(data.pacienteId);

  // Si se reprograma (fecha u hora), el nuevo horario debe estar libre.
  const fecha = data.fecha ?? turno.fecha;
  const hora = data.hora ?? turno.hora;

  if (fecha !== turno.fecha || hora !== turno.hora) {
    const slot = await disponibilidadService.validarSlot(fecha, hora, {
      excluirTurnoId: turno.id
    });
    data.duracionMinutos = slot.duracionMinutos;
    data.reprogramado = true;

    // El orden manual pertenece al día anterior: al mover de día se descarta.
    if (fecha !== turno.fecha && data.ordenManual === undefined) {
      data.ordenManual = null;
    }
  }

  await turno.update(data);
  return turno;
}

async function eliminar(id) {
  const turno = await Turno.findByPk(id);
  if (!turno) throw httpError(404, 'Turno no encontrado');

  await turno.destroy();
  return { mensaje: 'Turno eliminado' };
}

async function finalizar(id, datos) {
  return db.transaction(async (transaccion) => {
    const turno = await Turno.findByPk(id, { transaction: transaccion });
    if (!turno) throw httpError(404, 'Turno no encontrado');
    if (turno.estado === 'Realizado') throw httpError(409, 'El turno ya está finalizado');
    if (turno.estado === 'Cancelado') throw httpError(409, 'No se puede finalizar un turno cancelado');

    turno.estado = 'Realizado';
    await turno.save({ transaction: transaccion });

    const consulta = await Consulta.create(
      {
        pacienteId: turno.pacienteId,
        fecha: turno.fecha,
        motivo: datos.motivo || turno.motivo,
        peso: datos.peso,
        observaciones: datos.observaciones || ''
      },
      { transaction: transaccion }
    );

    return { turno, consulta };
  });
}

// Reordena solo dentro de un mismo día: mover de día es reprogramar.
async function reordenar(cambios) {
  const fechas = new Set(cambios.map((cambio) => cambio.fecha));
  if (fechas.size !== 1) {
    throw httpError(400, 'Solo se puede reordenar dentro del mismo día');
  }

  const fecha = cambios[0].fecha;
  const ids = cambios.map((cambio) => cambio.id);
  const ordenes = cambios.map((cambio) => cambio.ordenManual);

  if (new Set(ids).size !== ids.length) {
    throw httpError(400, 'Hay turnos repetidos en el reordenamiento');
  }
  if (new Set(ordenes).size !== ordenes.length) {
    throw httpError(400, 'El orden manual no puede repetirse');
  }

  return db.transaction(async (transaccion) => {
    const turnos = await Turno.findAll({ where: { id: ids }, transaction: transaccion });

    if (turnos.length !== ids.length) {
      throw httpError(404, 'Algún turno del reordenamiento no existe');
    }
    if (turnos.some((turno) => turno.fecha !== fecha)) {
      throw httpError(400, 'Todos los turnos deben pertenecer al mismo día');
    }

    for (const cambio of cambios) {
      const turno = turnos.find((item) => Number(item.id) === Number(cambio.id));
      await turno.update(
        { fecha, ordenManual: cambio.ordenManual },
        { transaction: transaccion }
      );
    }

    return { mensaje: 'Turnos reordenados', actualizados: cambios.length };
  });
}

module.exports = { listar, crear, actualizar, eliminar, finalizar, reordenar };
