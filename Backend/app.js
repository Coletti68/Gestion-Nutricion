const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./config/db');
require('./models');

const routes = require('./routes');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// Hostinger está detrás de un proxy: así se obtiene la IP real del cliente.
app.set('trust proxy', 1);

// Headers de seguridad. Se desactiva la CSP para que Swagger UI cargue sus scripts.
app.use(helmet({ contentSecurityPolicy: false }));

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origen) => origen.trim())
  : ['http://localhost:4200'];

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '1mb' }));

// 600 pedidos cada 15 minutos: margen cómodo para el uso normal de la agenda.
const limiterGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 600),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Esperá unos minutos y volvé a intentar.' }
});

// Login: solo cuentan los intentos fallidos, para no bloquear el uso legítimo.
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' }
});

app.use('/api', limiterGlobal);
app.use('/api/auth/login', limiterAuth);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);
app.use('/api', notFound);

// Si existe el build del frontend, se sirve desde el mismo servidor (deploy simple).
const carpetaFrontend = path.join(__dirname, 'dist', 'gestion-nutricion', 'browser');
if (fs.existsSync(carpetaFrontend)) {
  app.use(express.static(carpetaFrontend));
  app.use((req, res, next) => {
    const esApi = req.path.startsWith('/api') || req.path.startsWith('/api-docs');
    if (req.method !== 'GET' || esApi) return next();
    res.sendFile(path.join(carpetaFrontend, 'index.html'));
  });
}

app.use(errorHandler);

db.authenticate()
  .then(() => console.log('DB conectada'))
  .catch((err) => console.error('Error de conexión a la DB:', err.message));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API lau.micelli.nutricion en http://localhost:${PORT}`);
});

module.exports = app;
