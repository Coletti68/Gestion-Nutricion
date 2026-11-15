const express = require('express');
const router = express.Router();

const objetivoController = require('../controllers/objetivoController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  objetivoCreateSchema,
  objetivoUpdateSchema,
  objetivoIdSchema
} = require('../validations/objetivo_schema');

router.use(authMiddleware);

router.get('/', objetivoController.listar);
router.post('/', validate(objetivoCreateSchema), objetivoController.crear);
router.put('/:id', validate(objetivoIdSchema, 'params'), validate(objetivoUpdateSchema), objetivoController.actualizar);
router.delete('/:id', validate(objetivoIdSchema, 'params'), objetivoController.eliminar);

module.exports = router;
