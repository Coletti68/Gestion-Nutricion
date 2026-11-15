const express = require('express');
const router = express.Router();

const turnoController = require('../controllers/turnoController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  turnoCreateSchema,
  turnoUpdateSchema,
  turnoIdSchema,
  turnoFinalizarSchema,
  turnoReordenarSchema
} = require('../validations/turno_schema');

router.use(authMiddleware);

router.get('/', turnoController.listar);
router.post('/', validate(turnoCreateSchema), turnoController.crear);

// Antes de /:id para que "reordenar" no se interprete como un id.
router.put('/reordenar', validate(turnoReordenarSchema), turnoController.reordenar);

router.put('/:id', validate(turnoIdSchema, 'params'), validate(turnoUpdateSchema), turnoController.actualizar);
router.delete('/:id', validate(turnoIdSchema, 'params'), turnoController.eliminar);
router.post(
  '/:id/finalizar',
  validate(turnoIdSchema, 'params'),
  validate(turnoFinalizarSchema),
  turnoController.finalizar
);

module.exports = router;
