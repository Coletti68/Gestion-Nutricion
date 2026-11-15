const express = require('express');
const router = express.Router();

const disponibilidadController = require('../controllers/disponibilidadController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  semanalSchema,
  diaSchema,
  fechaParamsSchema,
  excepcionesQuerySchema
} = require('../validations/disponibilidad_schema');

router.use(authMiddleware);

router.get('/', disponibilidadController.listarSemanal);
router.put('/', validate(semanalSchema), disponibilidadController.guardarSemanal);

router.get(
  '/excepciones',
  validate(excepcionesQuerySchema, 'query'),
  disponibilidadController.listarExcepciones
);

router.get('/:fecha/slots', validate(fechaParamsSchema, 'params'), disponibilidadController.slots);
router.get('/:fecha', validate(fechaParamsSchema, 'params'), disponibilidadController.obtenerDia);
router.put(
  '/:fecha',
  validate(fechaParamsSchema, 'params'),
  validate(diaSchema),
  disponibilidadController.guardarDia
);
router.delete('/:fecha', validate(fechaParamsSchema, 'params'), disponibilidadController.eliminarDia);

module.exports = router;
