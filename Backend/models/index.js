const Usuario = require('./usuario_model');
const Paciente = require('./paciente_model');
const Consulta = require('./consulta_model');
const Turno = require('./turno_model');
const DisponibilidadSemanal = require('./disponibilidad_semanal_model');
const DisponibilidadDia = require('./disponibilidad_dia_model');
const Objetivo = require('./objetivo_model');

const models = { Usuario, Paciente, Consulta, Turno, DisponibilidadSemanal, DisponibilidadDia, Objetivo };

require('./relaciones')(models);

module.exports = models;
