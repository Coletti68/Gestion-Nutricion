const Joi = require('joi');

const fecha = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);
const hora = Joi.string().pattern(/^\d{2}:\d{2}$/);

const turnoCampos = {
  pacienteId: Joi.number().integer().positive(),
  fecha,
  hora,
  motivo: Joi.string().trim().min(1).max(120),
  estado: Joi.string().valid('Pendiente', 'Confirmado', 'Realizado', 'Cancelado'),
  ordenManual: Joi.number().integer().min(0).allow(null),
  recordatorio: Joi.boolean(),
  observaciones: Joi.string().max(1000).allow(null, '')
};

const turnoCreateSchema = Joi.object({
  ...turnoCampos,
  pacienteId: turnoCampos.pacienteId.required(),
  fecha: turnoCampos.fecha.required(),
  hora: turnoCampos.hora.required(),
  motivo: turnoCampos.motivo.required()
});

const turnoUpdateSchema = Joi.object(turnoCampos).min(1);

const turnoIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const turnoFinalizarSchema = Joi.object({
  peso: Joi.number().min(0).max(500).required(),
  motivo: Joi.string().max(120).allow(null, ''),
  observaciones: Joi.string().max(1000).allow(null, '')
});

const turnoReordenarSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      fecha: fecha.required(),
      ordenManual: Joi.number().integer().min(0).required()
    })
  )
  .min(1)
  .required();

module.exports = {
  turnoCreateSchema,
  turnoUpdateSchema,
  turnoIdSchema,
  turnoFinalizarSchema,
  turnoReordenarSchema
};
