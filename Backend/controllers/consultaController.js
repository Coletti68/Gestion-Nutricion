const consultaService = require('../services/consulta_service');

const listar = async (req, res, next) => {
  try {
    const consultas = await consultaService.listarPorPaciente(req.validatedParams.id);
    res.status(200).json(consultas);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const consulta = await consultaService.crear(req.validatedParams.id, req.validatedBody);
    res.status(201).json(consulta);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const consulta = await consultaService.actualizar(req.validatedParams.id, req.validatedBody);
    res.status(200).json(consulta);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await consultaService.eliminar(req.validatedParams.id);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crear, actualizar, eliminar };
