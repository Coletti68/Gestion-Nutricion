const authService = require('../services/auth_service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const resultado = await authService.login(email, password);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario.id);
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
};

const cambiarPassword = async (req, res, next) => {
  try {
    const { actual, nueva } = req.validatedBody;
    const resultado = await authService.cambiarPassword(req.usuario.id, actual, nueva);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, me, cambiarPassword };
