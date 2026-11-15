const objetivoService = require('../services/objetivo_service');

const listar = async (req, res, next) => {
  try {
    const objetivos = await objetivoService.listar();
    res.status(200).json(objetivos);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const objetivo = await objetivoService.crear(req.validatedBody);
    res.status(201).json(objetivo);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const objetivo = await objetivoService.actualizar(req.validatedParams.id, req.validatedBody);
    res.status(200).json(objetivo);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await objetivoService.eliminar(req.validatedParams.id);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crear, actualizar, eliminar };
