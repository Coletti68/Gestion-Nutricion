function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: error.details.map((detalle) => detalle.message)
      });
    }

    const clave = `validated${source.charAt(0).toUpperCase()}${source.slice(1)}`;
    req[clave] = value;
    next();
  };
}

module.exports = validate;
