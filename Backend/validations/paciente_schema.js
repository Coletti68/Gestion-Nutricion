const Joi = require('joi');

const pacienteCampos = {
  nombre: Joi.string().trim().min(2).max(120),
  edad: Joi.number().integer().min(0).max(120).allow(null),
  sexo: Joi.string().valid('Femenino', 'Masculino', 'Otro').allow(null, ''),
  telefono: Joi.string().max(30).allow(null, ''),
  email: Joi.string().email().max(150).allow(null, ''),
  objetivo: Joi.string().max(120).allow(null, ''),
  alergias: Joi.string().max(1000).allow(null, ''),
  patologias: Joi.string().max(1000).allow(null, ''),
  preferencias: Joi.string().max(1000).allow(null, ''),
  gustos: Joi.string().max(1000).allow(null, ''),
  evita: Joi.string().max(1000).allow(null, ''),
  pesoInicial: Joi.number().min(0).max(500).allow(null),
  altura: Joi.number().min(0).max(300).allow(null),
  activo: Joi.boolean()
};

const pacienteCreateSchema = Joi.object({
  ...pacienteCampos,
  nombre: pacienteCampos.nombre.required()
});

const pacienteUpdateSchema = Joi.object(pacienteCampos).min(1);

const pacienteIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  pacienteCreateSchema,
  pacienteUpdateSchema,
  pacienteIdSchema
};
