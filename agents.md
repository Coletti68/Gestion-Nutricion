# agents.md

Sistema de gestión para **lau.micelli.nutricion** (no tiene relación con StandFit). App real con login: agenda mobile-first con disponibilidad por horarios para una nutricionista, clientes, historial de sesiones y turnos.

## Stack y estructura

- **Frontend:** `Frontend/` — Angular 21 standalone + Angular Material + SCSS. Signals, zoneless y CDK Layout.
- **Backend:** `Backend/` — Node.js + Express 5 + Sequelize + **MySQL** (base `nutricion`).
- **Auth:** JWT Bearer + bcryptjs. Sin registro público; admin por CLI. Todas las rutas privadas van con guard en Angular y middleware en Express.
- **Docs:** Swagger en `/api-docs`.
- **No hay modo demo ni fallback a localStorage** (solo se guarda la sesión ahí). Tampoco hay backend JSON: fue reemplazado y borrado.

```
Backend/
  app.js                    Express, seguridad, Swagger, sirve el build del frontend si existe
  config/                   Conexión MySQL (Sequelize) y Swagger
  routes/ → controllers/ → services/ → models/   Lógica por capas (estilo Web-StandFit)
  middlewares/              authMiddleware (JWT), validate (Joi), errorHandler, notFound
  validations/              Esquemas Joi por recurso
  sql/nutricion.sql         Esquema de la base
  scripts/                  setup-db.js, seed.js, import-legacy.js, create-admin.js
Frontend/src/app/
  app.ts / app.routes.ts    Solo router-outlet y rutas con guards
  core/                     api-client, auth.service, auth.guard, auth.interceptor, data.store, fechas, horarios, pdf.service
  layout/                   shell.ts (drawer + usuario + logout), password-dialog.ts (sin uso en la UI)
  shared/                   rango-editor.ts (rangos + duración reutilizable)
  features/                 auth/login.ts, agenda/*, clientes/*, horarios/*, historial/*
  models/models.ts          Paciente, Consulta, Turno, Usuario, RangoHorario, Slot
scripts/dev.js              Levanta Backend (--watch) y Frontend (ng serve)
```

## Entorno local

- Windows + PowerShell: el separador `&&` **no funciona**; usar `;`.
- Instalación: `npm run setup`, copiar `Backend/.env.example` a `Backend/.env` y completar.
- Base: `npm run db:setup`. Usuario: `npm run user:create -- "Nombre" email clave`.
- Ambos: `npm run dev` (API :3000, Angular :4200 con proxy `/api`).
- Producción local: `npm run build` y `npm start` (Express sirve API + frontend en :3000).
- La raíz no tiene dependencias propias: cada paquete se instala con `--prefix`.

## Backend (`/api`)

- `auth/login`, `auth/me`, `auth/password`.
- `pacientes` CRUD + `pacientes/:id/consultas`; `consultas/:id` PUT/DELETE.
- `turnos` CRUD, `turnos/:id/finalizar` (transacción: Realizado + consulta nueva) y `turnos/reordenar` (bulk; queda en la API, sin uso en la UI).
- `disponibilidad` GET/PUT (plantilla semanal), `disponibilidad/:fecha` GET/PUT/DELETE (excepción o día cerrado) y `disponibilidad/:fecha/slots` (slots libres/ocupados, `excluirTurnoId`).
- Crear o reprogramar un turno valida que el slot esté libre y hereda `duracionMinutos` del rango; cancelar lo libera. Al reprogramar se marca `turno.reprogramado`.
- DB en español snake_case (`paciente`, `consulta`, `turno`, `usuario`, `disponibilidad_semanal`, `disponibilidad_dia`); API camelCase.
- `fecha` DATEONLY y `hora` con getter `HH:mm`: no convertir a Date para evitar corrimientos de zona horaria.
- Rate limit: 600 req/15 min global y 10 intentos fallidos/15 min en login. `helmet({ contentSecurityPolicy: false })` por Swagger.

## Frontend

- `/login` público; detrás del guard: `/` agenda, `/clientes(:id)`, `/horarios` (plantilla semanal) e `/historial` (filtros por fecha y estado).
- Agenda: hoy primero; en mobile un día con tira de 7 días, en desktop grilla semanal. Navegación por flechas, botón Hoy y selector de fecha.
- FAB "Nuevo" con Turno y Paciente; el diálogo de turno busca/crea paciente y solo muestra slots libres.
- Interceptor: agrega el Bearer y cierra sesión ante 401.
- `DataStore` con signals mantiene pacientes, turnos y disponibilidad; errores legibles con `mensajeDeError`.
- La app es **zoneless**: todo estado que cambie tras un `await` y se muestre en el template debe ser `signal`.
- Mobile-first, paleta oficial: naranja `#F28C00`, amarillo `#F9C900`, amarillo claro `#F4E65A`, negro `#000000`.

## Convenciones

- Textos en español; código descriptivo y consistente con lo existente.
- Diseño limpio, minimalista y responsive; toda pantalla nueva debe verse bien en móvil.
- Respetar la paleta de la marca. Comentarios cortos y representativos.
- Repo: `github.com/Coletti68/Gestion-Nutricion`. No hacer commit sin avisar.

## Forma de trabajar

- Planificar antes de tocar código; evaluar el tamaño del cambio y explicarlo.
- Preferir la opción más simple y viable.
- Verificar el cambio y su entorno antes de darlo por terminado.

## Límites

- Preguntar antes de: dependencias nuevas, archivos nuevos, cambios de formato de datos, cambios de estructura, tablas o campos nuevos.
- Nunca commitear ni tocar datos reales sin avisar. Nunca versionar `.env` ni contraseñas reales.
- No hacer cambios grandes sin consultar.

## Verificación

- Compilar (`npm run build`) y probar el flujo afectado contra la API real.
- Probar login, agenda, clientes y turnos end-to-end cuando se toque auth o el store.

## Memoria

- Leer `memory.md` al empezar cada tarea y actualizarlo al terminar (máximo ~70 líneas).

## Skills

| id | Para qué |
|---|---|
| `security-and-hardening` | auth, JWT, input, dependencias, datos de clientes |
| `nodejs-backend-patterns` | rutas, controllers, services, middlewares, errores, Sequelize |
| `angular-developer` | componentes, forms, routing, HTTP, tests, CLI |
| `responsive-design` | layout, mobile, CSS, tipografía fluida |
| `web-design-guidelines` | auditar pantallas (UX, a11y, forms) |

- Máximo 2 skills por tarea. Endpoint + pantalla: `nodejs-backend-patterns` + `angular-developer`.
- Las skills no pueden romper: paleta, mobile-first, español, ni los límites de este archivo.
