# lau.micelli.nutricion — Guía del sistema

## ¿Qué es este sistema?

Es una aplicación web privada para gestionar el trabajo diario de una nutricionista: **agenda de turnos**, **fichas de pacientes**, **historial de sesiones y avances**, y **configuración de horarios de atención**. Se usa desde el navegador, en el celular o en la computadora, y funciona con conexión a internet.

No es una página pública: solo puede entrar quien tenga usuario y contraseña (creados por el administrador). No hay registro abierto.

## ¿Para quién es?

Para **Lau Micelli** (nutricionista) y, en el futuro, cualquier profesional que atienda pacientes de nutrición. El sistema está pensado para ser **mobile-first**: la mayoría de las tareas se hacen cómodamente desde el celular.

## Pantallas principales

### 1. Iniciar sesión

- Se entra con email y contraseña.
- La sesión dura 6 horas; después hay que volver a ingresar.
- Si alguien intenta muchas veces con contraseña incorrecta, el sistema lo bloquea temporalmente (seguridad).

### 2. Agenda (pantalla principal)

Es el corazón del sistema. Muestra los turnos organizados por día.

- **En el celular:** se ve un día a la vez, con una tira de 7 días arriba para elegir rápidamente. Flechas para avanzar/retroceder semanas, botón **Hoy** y un selector de fecha.
- **En la computadora:** se ve la semana completa (7 columnas), cada una con sus turnos.
- **Horarios disponibles del día:** se muestran como "chips" (botones con la hora). Tocar una hora libre abre el formulario para agendar un turno.
- **Turnos del día:** cada turno muestra hora, duración, nombre del paciente, motivo y estado (Pendiente / Confirmado / Realizado / Cancelado).
- **Acciones por turno** (menú de tres puntos): Confirmar, Finalizar, Editar/reprogramar, Cancelar, Eliminar.
- **Arrastrar y soltar (solo computadora):**
  - Dentro del mismo día: cambia el orden visual (no toca horarios).
  - Entre días: mueve el turno conservando la hora. Pide confirmación en un modal que muestra paciente, día de origen, día de destino y hora. Si el día está cerrado o la hora ocupada, avisa y no mueve.
- **Botón flotante "Nuevo":** crea un Paciente o un Turno rápidamente.
- **Aviso de próximo turno:** si hay un turno en la próxima hora, se muestra un cartel amarillo arriba.

### 3. Clientes

- Lista de pacientes con buscador por nombre.
- **Alta de paciente:** nombre, edad, sexo, teléfono, objetivo (elegido de un catálogo editable), peso inicial, altura, gustos, alimentos que evita, alergias, patologías.
- **Edición de paciente:** reutiliza el mismo formulario.
- **Detalle del paciente:**
  - Cabecera con datos y chips de peso inicial, último peso y variación total.
  - Perfil alimentario (gustos, evita, alergias, patologías).
  - Turnos agendados de ese paciente.
  - **Sesiones y avances:** lista de consultas con fecha, motivo, peso, observaciones y variación respecto a la sesión anterior. Cada sesión tiene botones para editar o desactivar.
  - Botón **Registrar sesión** (junto al título) abre un modal con fecha, motivo, peso y observaciones. Al crear, el peso se precarga con el último registrado.
  - Botón **Informe de seguimiento** genera un PDF con el progreso del paciente.
- **Baja lógica de sesiones:** al desactivar una sesión deja de mostrarse, pero no se borra (se puede recuperar desde la base).

### 4. Horarios

- **Plantilla semanal:** define, para cada día de la semana, uno o varios rangos de atención (ej. 08:00–12:00 y 16:00–20:00) y la duración de cada turno (30, 45 o 60 minutos).
- **Día cerrado:** si un día no tiene rangos, se considera cerrado.
- **Excepción por día:** un día puntual puede tener horarios distintos a la plantilla o marcarse cerrado. Se puede editar o "volver a la plantilla".
- Los turnos solo se pueden crear en slots libres; al cancelar un turno, el slot vuelve a estar disponible.

### 5. Historial

- Lista de turnos pasados (más recientes primero).
- **Filtros:** Desde (fecha), Hasta (fecha) y Estado (Todos / Pendiente / Confirmado / Realizado / Cancelado).
- Muestra paciente, motivo, hora, duración, estado y un chip "Reprogramado" si el turno cambió de fecha/hora.
- Botón Limpiar para resetear los filtros.

## Funcionalidades completas (resumen)

**Agenda y turnos**

- Vista día (mobile) y semana (desktop).
- Navegación por flechas, botón Hoy y selector de fecha.
- Chips de horarios libres/ocupados.
- Crear turno eligiendo paciente existente o creando uno nuevo al vuelo.
- Editar/reprogramar turno (cambia fecha/hora y valida slot libre; marca "reprogramado").
- Confirmar, finalizar (marca Realizado y crea la sesión automáticamente), cancelar y eliminar turno.
- Drag & drop: reordenar dentro del día; mover entre días con modal de confirmación.
- Aviso de próximo turno.

**Pacientes**

- Alta, edición y listado con buscador.
- Ficha completa: datos personales, objetivo, peso inicial, altura, preferencias alimentarias, alergias, patologías.
- Detalle con chips de peso y variación total.
- Turnos del paciente.
- Sesiones con alta/edición en modal, baja lógica, variación vs. sesión anterior.
- Informe PDF de seguimiento.

**Objetivos (catálogo)**

- Lista editable de objetivos (ej. "Control de diabetes", "Bajar de peso").
- Crear, renombrar y desactivar objetivos.
- Renombrar un objetivo actualiza automáticamente el texto de los pacientes que lo tenían.
- Los pacientes eligen el objetivo de un desplegable.

**Horarios y disponibilidad**

- Plantilla semanal con varios rangos por día.
- Duración configurable por rango (30/45/60 min).
- Excepción por día (horarios distintos o día cerrado).
- Volver a la plantilla.
- Slots calculados por el servidor (una sola fuente de verdad).

**Historial**

- Filtros por rango de fechas y estado.
- Indicador de turnos reprogramados.

**Seguridad y acceso**

- Login con email y contraseña.
- Tokens JWT de 6 horas.
- Sin registro público: usuarios creados por línea de comandos.
- Rate limit: 600 pedidos cada 15 minutos en general; 10 intentos fallidos de login cada 15 minutos.
- Contraseñas guardadas con bcrypt (costo 12).
- Cambio de contraseña desde la app.

**Técnico (para el administrador)**

- Frontend: Angular 21 (standalone, signals, zoneless) + Angular Material + SCSS.
- Backend: Node.js + Express 5 + Sequelize + MySQL.
- Base de datos `nutricion` con tablas en español (snake_case); la API responde en camelCase.
- Swagger en `/api-docs`; health en `/api/health`.
- El backend sirve el frontend compilado si existe (un solo servidor en producción).
- Sin modo demo ni datos en el navegador (salvo la sesión).

## Datos que guarda el sistema

- **Usuarios:** nombre, email, contraseña (encriptada).
- **Pacientes:** datos personales, objetivo, peso inicial, altura, gustos, evita, alergias, patologías.
- **Consultas (sesiones):** fecha, motivo, peso, observaciones, activo (baja lógica).
- **Turnos:** fecha, hora, duración, motivo, estado, recordatorio, reprogramado, orden manual.
- **Objetivos:** nombre, activo.
- **Disponibilidad:** plantilla semanal (rangos + duración) y excepciones por día (rangos o día cerrado).

## Instalación y puesta en marcha (resumen)

1. Instalar Node.js 20+ y MySQL 8+.
2. `npm run setup` (instala dependencias del backend y frontend).
3. Copiar `Backend/.env.example` a `Backend/.env` y completar los datos de la base, la clave JWT, etc.
4. `npm run db:setup` (crea la base `nutricion` y sus tablas).
5. `npm run user:create -- "Nombre" email clave` (crea el primer usuario).
6. Desarrollo: `npm run dev` (abre la app en http://localhost:4200 y la API en http://localhost:3000).
7. Producción: `npm run build` y `npm start` (todo en http://localhost:3000).

## Preguntas frecuentes

- **¿Se puede usar desde el celular?** Sí, está pensado mobile-first.
- **¿Funciona sin internet?** No, necesita conexión al servidor.
- **¿Se pueden borrar pacientes o sesiones?** Las sesiones se desactivan (baja lógica) y dejan de mostrarse, pero no se borran. Los pacientes se pueden eliminar.
- **¿Qué pasa si muevo un turno a un día sin ese horario?** El sistema avisa y no mueve el turno.
- **¿Los turnos se superponen?** No: solo se pueden crear en slots libres calculados por el servidor.
- **¿Hay respaldo de datos?** Depende del hosting (MySQL). Se recomienda backup periódico de la base `nutricion`.

---

## Instalación y configuración técnica (para el administrador)

### Requisitos

- Node.js 20+
- MySQL 8+ (base local o remota)

### Variables de entorno (`Backend/.env`)

Copiar `Backend/.env.example` a `Backend/.env` (nunca se commitea) y completar:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (3000 por defecto) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Conexión MySQL |
| `JWT_SECRET` | Clave larga y aleatoria para firmar los tokens |
| `JWT_EXPIRES` | Duración del token (6h por defecto) |
| `RATE_LIMIT_MAX` | Pedidos por IP cada 15 minutos (600 por defecto; el login tiene su propio límite) |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma |

### Instalación paso a paso

```bash
npm run setup                 # instala Backend y Frontend
npm run db:setup              # crea la base nutricion y sus tablas
npm run user:create -- "Lau Micelli" lau@tudominio.com tu_clave_secreta   # primer usuario (clave de 8+ caracteres)
```

La contraseña se guarda con bcrypt (costo 12). **No hay registro público**: los usuarios se crean solo por CLI.

### Desarrollo

```bash
npm run dev         # API con --watch + Angular con proxy /api
```

- App: http://localhost:4200
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api-docs

Por separado: `npm run dev:api` y `npm run dev:web`.

### Producción local

```bash
npm run build       # genera Frontend/dist/gestion-nutricion/browser
npm start           # Express sirve la API y el build en :3000
```

El backend detecta el build del frontend y lo sirve con fallback SPA, así que localmente funciona todo en un solo servidor.

### Endpoints de la API

Todas las rutas (salvo `health` y `auth/login`) requieren `Authorization: Bearer <token>`. Documentación interactiva en `/api-docs`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/login` | Login (rate limit: 10 intentos fallidos / 15 min) |
| GET | `/api/auth/me` | Usuario actual |
| PUT | `/api/auth/password` | Cambiar contraseña |
| GET/POST | `/api/pacientes` | Listar (con consultas) / crear paciente |
| GET/PUT/DELETE | `/api/pacientes/:id` | Obtener / editar / eliminar paciente |
| GET/POST | `/api/pacientes/:id/consultas` | Listar / registrar sesión |
| PUT/DELETE | `/api/consultas/:id` | Editar / desactivar sesión (baja lógica) |
| GET/POST | `/api/objetivos` | Catálogo de objetivos activos / crear objetivo |
| PUT/DELETE | `/api/objetivos/:id` | Renombrar / desactivar objetivo (baja lógica) |
| GET/POST | `/api/turnos` | Listar / crear turno (filtros: `pacienteId`, `estado`, `desde`, `hasta`) |
| PUT/DELETE | `/api/turnos/:id` | Editar / eliminar turno (fecha y hora validan slot libre; marca `reprogramado`) |
| POST | `/api/turnos/:id/finalizar` | Marca Realizado y crea la consulta en una transacción |
| PUT | `/api/turnos/reordenar` | Reordenar turnos de un mismo día (drag & drop intra-día) |
| GET/PUT | `/api/disponibilidad` | Plantilla semanal de atención (rangos y duración por día) |
| GET/PUT/DELETE | `/api/disponibilidad/:fecha` | Día puntual: excepción, día cerrado o volver a la plantilla |
| GET | `/api/disponibilidad/:fecha/slots` | Slots del día con `disponible` (acepta `excluirTurnoId`) |

Modelos en la base (snake_case): `usuario`, `paciente`, `consulta` (con `activo`), `turno` (con `duracion_minutos`, `orden_manual` y `reprogramado`), `objetivo`, `disponibilidad_semanal`, `disponibilidad_dia`. La API devuelve camelCase.

### Disponibilidad (detalle técnico)

- La plantilla semanal define varios rangos por día (ej. 08:00–12:00 y 16:00–20:00) y la duración de cada turno (30/45/60 min).
- Cada fecha puede tener una **excepción** con otros rangos o marcarse **cerrada**; si no hay excepción se usa la plantilla.
- Un turno solo puede crearse o reprogramarse en un slot libre del día. Al cancelarlo, el slot vuelve a quedar disponible.
- Al cambiar fecha u hora el turno queda marcado como **reprogramado** y el Historial lo muestra con un chip.
- `fecha` es `DATEONLY` y `hora` se expone como `HH:mm` para evitar corrimientos de zona horaria.

### Agenda, sesiones y objetivos (detalle técnico)

- Arrastrar un turno dentro del mismo día solo cambia el orden visual (no toca los horarios). Entre días (solo desktop) lo mueve conservando la hora, con confirmación y validación de slot libre o día cerrado.
- Las sesiones se pueden editar y desactivar: la baja es lógica, dejan de mostrarse pero no se borran.
- Los objetivos del paciente salen de un catálogo editable (`/api/objetivos`). Renombrar uno actualiza también el texto de los pacientes que lo tenían.

### Datos legados

Si todavía existe el viejo `server/data.json`, se puede importar una sola vez (preserva IDs):

```bash
npm --prefix Backend run db:import -- --force
```

### Deploy en Hostinger

**Opción recomendada: frontend estático + backend Node separados.**

1. **Base de datos:** crear una base MySQL en hPanel, cargar `Backend/sql/nutricion.sql` si hace falta o dejar que `db:setup` cree las tablas.
2. **Backend (Node.js App):** subir `Backend/` (sin `.env`), configurar las variables de entorno en hPanel y el start file `app.js`. Ejecutar `npm install --omit=dev` y `npm run db:setup` una vez.
3. **Frontend (sitio estático):** si la API queda en otro dominio/subdominio, editar `Frontend/src/environments/environment.production.ts` con `apiUrl: 'https://api.tudominio.com/api'` y agregar `https://tudominio.com` a `CORS_ORIGIN`. Luego `npm run build` y subir el contenido de `Frontend/dist/gestion-nutricion/browser` a `public_html`.
4. **HTTPS:** activar el certificado SSL de Hostinger para ambos dominios; el JWT viaja en cada request.
5. Crear el usuario administrador real con `npm run user:create`.

**Alternativa:** si el plan permite Node con dominio único, se puede subir todo y dejar que Express sirva también el frontend (`npm run build && npm start`), apuntando el dominio a la app Node.

### Documentación interactiva

Swagger disponible en `/api-docs`; health en `/api/health`. Archivos `AGENTS.md` y `memory.md` en la raíz del proyecto contienen convenciones y decisiones de desarrollo.
