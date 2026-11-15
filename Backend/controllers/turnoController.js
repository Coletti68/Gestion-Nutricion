const turnoService = require('../services/turno_service');

const listar = async (req, res, next) => {
  try {
    const turnos = await turnoService.listar(req.query);
    res.status(200).json(turnos);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const turno = await turnoService.crear(req.validatedBody);
    res.status(201).json(turno);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const turno = await turnoService.actualizar(req.validatedParams.id, req.validatedBody);
    res.status(200).json(turno);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await turnoService.eliminar(req.validatedParams.id);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const finalizar = async (req, res, next) => {
  try {
    const resultado = await turnoService.finalizar(req.validatedParams.id, req.validatedBody);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const reordenar = async (req, res, next) => {
  try {
    const resultado = await turnoService.reordenar(req.validatedBody);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crear, actualizar, eliminar, finalizar, reordenar };
