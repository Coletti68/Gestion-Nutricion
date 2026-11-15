const Joi = require('joi');

const objetivoCampos = {
  nombre: Joi.string().trim().min(2).max(120),
  orden: Joi.number().integer().min(0)
};

const objetivoCreateSchema = Joi.object({
  ...objetivoCampos,
  nombre: objetivoCampos.nombre.required()
});

const objetivoUpdateSchema = Joi.object(objetivoCampos).min(1);

const objetivoIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  objetivoCreateSchema,
  objetivoUpdateSchema,
  objetivoIdSchema
};
