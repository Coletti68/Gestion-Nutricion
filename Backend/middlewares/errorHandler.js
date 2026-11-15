// Los 4 parámetros son obligatorios para que Express lo reconozca como manejador de errores.
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let mensaje = err.message || 'Error';

  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    mensaje = 'El registro ya existe';
  } else if (err.name === 'SequelizeValidationError') {
    status = 400;
    mensaje = err.errors.map((item) => item.message).join(', ');
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    mensaje = 'El registro relacionado no existe';
  }

  // Log interno completo (nunca se expone al cliente).
  if (status >= 500) {
    console.error(`[${status}]`, err.message, err.stack);
    mensaje = 'Error interno del servidor';
  }

  res.status(status).json({ error: mensaje });
}

module.exports = errorHandler;
