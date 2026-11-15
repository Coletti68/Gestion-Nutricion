const Joi = require('joi');

const consultaCampos = {
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  motivo: Joi.string().trim().min(1).max(120),
  peso: Joi.number().min(0).max(500).allow(null),
  observaciones: Joi.string().max(1000).allow(null, '')
};

const consultaCreateSchema = Joi.object({
  ...consultaCampos,
  fecha: consultaCampos.fecha.required(),
  motivo: consultaCampos.motivo.required()
});

const consultaUpdateSchema = Joi.object(consultaCampos).min(1);

const consultaIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  consultaCreateSchema,
  consultaUpdateSchema,
  consultaIdSchema
};
