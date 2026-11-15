const express = require('express');
const router = express.Router();

const consultaController = require('../controllers/consultaController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { consultaUpdateSchema, consultaIdSchema } = require('../validations/consulta_schema');

router.use(authMiddleware);

router.put('/:id', validate(consultaIdSchema, 'params'), validate(consultaUpdateSchema), consultaController.actualizar);
router.delete('/:id', validate(consultaIdSchema, 'params'), consultaController.eliminar);

module.exports = router;
