const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { loginSchema, cambiarPasswordSchema } = require('../validations/auth_schema');

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);
router.put('/password', authMiddleware, validate(cambiarPasswordSchema), authController.cambiarPassword);

module.exports = router;
