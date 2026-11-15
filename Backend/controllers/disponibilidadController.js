const disponibilidadService = require('../services/disponibilidad_service');

const listarSemanal = async (req, res, next) => {
  try {
    res.status(200).json(await disponibilidadService.listarSemanal());
  } catch (err) {
    next(err);
  }
};

const guardarSemanal = async (req, res, next) => {
  try {
    res.status(200).json(await disponibilidadService.reemplazarSemanal(req.validatedBody));
  } catch (err) {
    next(err);
  }
};

const listarExcepciones = async (req, res, next) => {
  try {
    res.status(200).json(await disponibilidadService.listarExcepciones(req.validatedQuery));
  } catch (err) {
    next(err);
  }
};

const obtenerDia = async (req, res, next) => {
  try {
    res.status(200).json(await disponibilidadService.obtenerDia(req.validatedParams.fecha));
  } catch (err) {
    next(err);
  }
};

const guardarDia = async (req, res, next) => {
  try {
    const resultado = await disponibilidadService.guardarDia(
      req.validatedParams.fecha,
      req.validatedBody
    );
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const eliminarDia = async (req, res, next) => {
  try {
    res.status(200).json(await disponibilidadService.eliminarDia(req.validatedParams.fecha));
  } catch (err) {
    next(err);
  }
};

const slots = async (req, res, next) => {
  try {
    const excluirTurnoId = req.query.excluirTurnoId
      ? Number(req.query.excluirTurnoId)
      : undefined;
    res
      .status(200)
      .json(await disponibilidadService.slots(req.validatedParams.fecha, { excluirTurnoId }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarSemanal,
  guardarSemanal,
  listarExcepciones,
  obtenerDia,
  guardarDia,
  eliminarDia,
  slots
};
