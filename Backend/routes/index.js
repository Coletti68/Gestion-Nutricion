const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const pacienteRoutes = require('./pacienteRoutes');
const consultaRoutes = require('./consultaRoutes');
const turnoRoutes = require('./turnoRoutes');
const disponibilidadRoutes = require('./disponibilidadRoutes');
const objetivoRoutes = require('./objetivoRoutes');

router.get('/health', (req, res) => {
  res.json({ ok: true, servicio: 'lau.micelli.nutricion', fecha: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/consultas', consultaRoutes);
router.use('/turnos', turnoRoutes);
router.use('/disponibilidad', disponibilidadRoutes);
router.use('/objetivos', objetivoRoutes);

module.exports = router;
