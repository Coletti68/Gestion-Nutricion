const Joi = require('joi');

const hora = Joi.string().pattern(/^\d{2}:\d{2}$/);
const duracionMinutos = Joi.number().integer().min(15).max(240).default(60);

const rango = {
  horaInicio: hora.required(),
  horaFin: hora.required(),
  duracionMinutos
};

const diaSemana = Joi.number().integer().min(1).max(7);

const semanalSchema = Joi.array()
  .items(Joi.object({ diaSemana: diaSemana.required(), ...rango }))
  .unique((a, b) => a.diaSemana === b.diaSemana && a.horaInicio === b.horaInicio)
  .required();

const diaSchema = Joi.object({
  cerrado: Joi.boolean().default(false),
  rangos: Joi.array().items(Joi.object(rango)).default([])
}).custom((valor, helpers) => {
  if (!valor.cerrado && !valor.rangos.length) {
    return helpers.error('any.invalid');
  }
  return valor;
});

const fechaParamsSchema = Joi.object({
  fecha: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
});

const excepcionesQuerySchema = Joi.object({
  desde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  hasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
});

module.exports = { semanalSchema, diaSchema, fechaParamsSchema, excepcionesQuerySchema };
