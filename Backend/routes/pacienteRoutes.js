const express = require('express');
const router = express.Router();

const pacienteController = require('../controllers/pacienteController');
const consultaController = require('../controllers/consultaController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { pacienteCreateSchema, pacienteUpdateSchema, pacienteIdSchema } = require('../validations/paciente_schema');
const { consultaCreateSchema } = require('../validations/consulta_schema');

router.use(authMiddleware);

router.get('/', pacienteController.listar);
router.post('/', validate(pacienteCreateSchema), pacienteController.crear);

router.get('/:id', validate(pacienteIdSchema, 'params'), pacienteController.obtener);
router.put('/:id', validate(pacienteIdSchema, 'params'), validate(pacienteUpdateSchema), pacienteController.actualizar);
router.delete('/:id', validate(pacienteIdSchema, 'params'), pacienteController.eliminar);

router.get('/:id/consultas', validate(pacienteIdSchema, 'params'), consultaController.listar);
router.post(
  '/:id/consultas',
  validate(pacienteIdSchema, 'params'),
  validate(consultaCreateSchema),
  consultaController.crear
);

module.exports = router;
