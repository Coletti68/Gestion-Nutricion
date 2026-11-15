const pacienteService = require('../services/paciente_service');

const listar = async (req, res, next) => {
  try {
    const pacientes = await pacienteService.listar(req.query.q);
    res.status(200).json(pacientes);
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const paciente = await pacienteService.obtenerPorId(req.validatedParams.id);
    res.status(200).json(paciente);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const paciente = await pacienteService.crear(req.validatedBody);
    res.status(201).json(paciente);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const paciente = await pacienteService.actualizar(req.validatedParams.id, req.validatedBody);
    res.status(200).json(paciente);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await pacienteService.eliminar(req.validatedParams.id);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
