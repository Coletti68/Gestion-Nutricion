const { Op } = require('sequelize');
const db = require('../config/db');
const { DisponibilidadSemanal, DisponibilidadDia, Turno } = require('../models');
const httpError = require('../utils/httpError');

const DURACION_DEFAULT = 60;

function aMinutos(hora) {
  const [h, m] = String(hora).slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

function aHora(minutos) {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

// 1 = Lunes ... 7 = Domingo (sin depender de la zona horaria).
function diaSemanaISO(fecha) {
  const [anio, mes, dia] = String(fecha).split('-').map(Number);
  const js = new Date(anio, mes - 1, dia).getDay();
  return js === 0 ? 7 : js;
}

function serializarRango(rango) {
  return {
    horaInicio: rango.horaInicio,
    horaFin: rango.horaFin,
    duracionMinutos: Number(rango.duracionMinutos) || DURACION_DEFAULT
  };
}

async function listarSemanal() {
  const filas = await DisponibilidadSemanal.findAll({
    order: [
      ['diaSemana', 'ASC'],
      ['horaInicio', 'ASC']
    ]
  });
  return filas.map((fila) => ({ id: fila.id, diaSemana: fila.diaSemana, ...serializarRango(fila) }));
}

async function reemplazarSemanal(rangos) {
  await db.transaction(async (transaccion) => {
    await DisponibilidadSemanal.destroy({ where: {}, transaction: transaccion });

    if (rangos.length) {
      await DisponibilidadSemanal.bulkCreate(
        rangos.map((rango) => ({
          diaSemana: rango.diaSemana,
          horaInicio: rango.horaInicio,
          horaFin: rango.horaFin,
          duracionMinutos: rango.duracionMinutos ?? DURACION_DEFAULT
        })),
        { transaction: transaccion }
      );
    }
  });

  return listarSemanal();
}

// Devuelve la disponibilidad efectiva de una fecha: excepción o plantilla semanal.
async function obtenerDia(fecha) {
  const excepciones = await DisponibilidadDia.findAll({
    where: { fecha },
    order: [['horaInicio', 'ASC']]
  });

  if (excepciones.length) {
    const cerrado = excepciones.some((excepcion) => excepcion.cerrado);
    return {
      fecha,
      esExcepcion: true,
      cerrado,
      rangos: cerrado ? [] : excepciones.map(serializarRango)
    };
  }

  const plantilla = await DisponibilidadSemanal.findAll({
    where: { diaSemana: diaSemanaISO(fecha) },
    order: [['horaInicio', 'ASC']]
  });

  // Sin rangos en la plantilla, el día se considera cerrado.
  return {
    fecha,
    esExcepcion: false,
    cerrado: plantilla.length === 0,
    rangos: plantilla.map(serializarRango)
  };
}

// Lista las excepciones por fecha (días con horario propio o cerrados).
async function listarExcepciones({ desde, hasta } = {}) {
  const where = {};

  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha[Op.gte] = desde;
    if (hasta) where.fecha[Op.lte] = hasta;
  }

  const filas = await DisponibilidadDia.findAll({
    where,
    order: [
      ['fecha', 'ASC'],
      ['horaInicio', 'ASC']
    ]
  });

  const porFecha = new Map();

  for (const fila of filas) {
    const actual = porFecha.get(fila.fecha) ?? { fecha: fila.fecha, cerrado: false, rangos: [] };
    if (fila.cerrado) {
      actual.cerrado = true;
    } else {
      actual.rangos.push(serializarRango(fila));
    }
    porFecha.set(fila.fecha, actual);
  }

  return [...porFecha.values()];
}

async function guardarDia(fecha, { cerrado, rangos = [] }) {
  if (!cerrado && !rangos.length) {
    throw httpError(400, 'Agregá al menos un rango horario o marcá el día como cerrado');
  }

  await db.transaction(async (transaccion) => {
    await DisponibilidadDia.destroy({ where: { fecha }, transaction: transaccion });

    if (cerrado) {
      await DisponibilidadDia.create(
        { fecha, cerrado: true, horaInicio: null, horaFin: null },
        { transaction: transaccion }
      );
      return;
    }

    await DisponibilidadDia.bulkCreate(
      rangos.map((rango) => ({
        fecha,
        cerrado: false,
        horaInicio: rango.horaInicio,
        horaFin: rango.horaFin,
        duracionMinutos: rango.duracionMinutos ?? DURACION_DEFAULT
      })),
      { transaction: transaccion }
    );
  });

  return obtenerDia(fecha);
}

async function eliminarDia(fecha) {
  await DisponibilidadDia.destroy({ where: { fecha } });
  return obtenerDia(fecha);
}

// Genera los slots del día y marca cuáles están ocupados por turnos activos.
async function slots(fecha, { excluirTurnoId } = {}) {
  const dia = await obtenerDia(fecha);

  if (dia.cerrado || !dia.rangos.length) {
    return { ...dia, slots: [] };
  }

  const ocupados = await Turno.findAll({
    where: { fecha, estado: { [Op.ne]: 'Cancelado' } }
  });

  const resultado = [];

  for (const rango of dia.rangos) {
    const duracion = rango.duracionMinutos || DURACION_DEFAULT;
    const fin = aMinutos(rango.horaFin);

    for (let inicio = aMinutos(rango.horaInicio); inicio + duracion <= fin; inicio += duracion) {
      const termino = inicio + duracion;
      const ocupado = ocupados.some((turno) => {
        if (excluirTurnoId && Number(turno.id) === Number(excluirTurnoId)) return false;
        const turnoInicio = aMinutos(turno.hora);
        const turnoFin = turnoInicio + (Number(turno.duracionMinutos) || DURACION_DEFAULT);
        return inicio < turnoFin && termino > turnoInicio;
      });

      resultado.push({
        hora: aHora(inicio),
        duracionMinutos: duracion,
        disponible: !ocupado,
        rango: `${rango.horaInicio}–${rango.horaFin}`
      });
    }
  }

  return { ...dia, slots: resultado };
}

// Valida que un turno caiga en un slot libre y devuelve su duración.
async function validarSlot(fecha, hora, { excluirTurnoId } = {}) {
  const { slots: disponibles } = await slots(fecha, { excluirTurnoId });
  const slot = disponibles.find((item) => item.hora === String(hora).slice(0, 5));

  if (!slot) {
    throw httpError(409, 'El horario no está dentro de la disponibilidad de ese día');
  }
  if (!slot.disponible) {
    throw httpError(409, 'Ese horario ya está ocupado por otro turno');
  }

  return slot;
}

module.exports = {
  listarSemanal,
  reemplazarSemanal,
  listarExcepciones,
  obtenerDia,
  guardarDia,
  eliminarDia,
  slots,
  validarSlot
};
