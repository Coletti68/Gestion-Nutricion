# MEMORY.md

Memoria del proyecto entre sesiones. (máximo ~70 líneas)

## Estado actual (2026-11-15)

- App real **lau.micelli.nutricion**: backend Node/Express + MySQL y frontend Angular 21 (zoneless) con login JWT. Sin modo demo ni localStorage (salvo sesión).
- Raíz: `Backend/`, `Frontend/`, `scripts/`. MySQL `nutricion` con 8 pacientes. Admins: `lau@local.dev` / `nutricion2026` y `mfmadmin2` / `mfmadmin@gmail.com` / `mfmsolution117` (sin roles).
- Agenda en `/`: hoy primero; mobile un día con tira de 7 días, desktop grilla semanal. Flechas, botón Hoy y selector de fecha. FAB con Turno/Paciente.
- Disponibilidad: plantilla semanal, excepción/día cerrado, duración por rango (30/45/60, default 60) y `turno.duracion_minutos`.
- Turnos solo en slots libres; cancelar libera el slot; reprogramar valida el nuevo slot y marca `turno.reprogramado`. El turno hereda la duración del rango.
- Drag & drop: dentro del mismo día solo reordena visualmente (`turno.orden_manual` + `PUT /turnos/reordenar`); entre días (solo desktop) mueve con modal propio (paciente, origen → destino, hora y nota) conservando la hora vía `PUT /turnos/:id` y valida slot/día cerrado. Todos los turnos son arrastrables.
- Catálogo editable de objetivos (`tabla objetivo`, `GET/POST/PUT/DELETE /api/objetivos`, baja lógica). El select del paciente lo consume; renombrar actualiza en transacción el texto de los pacientes. `paciente.objetivo` sigue siendo texto.
- Sesiones: alta/edición en modal (igual que el alta de paciente), botón "Registrar sesión" junto al título "Sesiones y avances"; baja lógica (`consulta.activo`). Al crear se prefija el peso con el último registrado. Las inactivas no se listan ni se editan.
- Paciente editable reutilizando el diálogo de alta. Botones Volver a Agenda en Clientes, Historial, Horarios y detalle.
- Confirmaciones nativas reemplazadas por `ConfirmacionDialog` (estilo del modal de mover turno): cerrar sesión (botón rojo/peligro), volver a la plantilla, restaurar sugerido, usar plantilla en el día, eliminar turno, desactivar objetivo y desactivar sesión. Botón de cerrar sesión: texto en el drawer, solo ícono rojo en la barra. Modal de nuevo paciente adaptado a mobile (sin scroll horizontal). Botón "Gestionar objetivos" alineado en desktop y con espacio en mobile. Barra de guardar horarios sin caja. Select de Estado del Historial estilizado. Login con botón "ojito" para mostrar/ocultar contraseña.
- Seguridad: JWT de 6 h, rate limit 600 req/15 min global y 10 intentos fallidos/15 min en login (`skipSuccessfulRequests`).
- Verificado contra API real: CRUD de objetivos (incluye 409 duplicado y reactivación), renombrado en pacientes, sesiones alta/edición/baja, edición de paciente, reordenamiento, cross-day (hora conservada, `ordenManual` limpio, `reprogramado`), rechazos 409 slot ocupado/día cerrado y 400 reordenar entre días. Modales de sesión (alta/edición) y de mover turno (cancelar/aceptar) verificados en Edge headless; filtro Estado alineado a 48 px en desktop y mobile. Modales de cerrar sesión (rojo) y volver a plantilla verificados. Build OK.

## Decisiones (por qué)

- **Express 5 + Sequelize + MySQL**: pedir a Hostinger, datos reales; JSON legado solo para importar una vez.
- **JWT + bcrypt + CLI admin**: sin registro público, acceso profesional.
- **`fecha` DATEONLY y `hora` getter `HH:mm`**: evita corrimientos de zona horaria en turnos.
- **Slots calculados en el backend**: una sola fuente de verdad para UI y validación de choques.
- **Objetivo como texto + catálogo**: simple para los datos existentes; el renombrado sincroniza por texto.
- **Día sin rangos en la plantilla = cerrado** (lo devuelve `GET /disponibilidad/:fecha`).
- **Excepción por día visible y reversible**: no se borra la fila; se puede editar o volver a la plantilla.
- **Drag intra-día = solo orden visual; cross-day = reprogramar**: no se tocan horarios al ordenar.
- **Turnos sin orden manual van al final si el día ya fue reordenado**; si nadie tiene orden, manda la hora.
- **Backend sirve el build del frontend si existe**: deploy simple en un mismo servidor.
- **Paleta oficial**: naranja `#F28C00`, amarillo `#F9C900`, claro `#F4E65A`, negro.

## Aprendizajes / errores a evitar

- **App zoneless**: estado que cambia tras un `await` y se muestra en el template debe ser `signal`.
- Un `<select>` con opciones creadas por `@for` puede mostrar la primera opción aunque el modelo sea otro; opciones estáticas o `[selected]` lo evitan.
- Un `<input type="date">` superpuesto a un botón intercepta el toque: `pointer-events:none` + `<label>` es más confiable en mobile.
- PowerShell usa `;`, nunca `&&`. Windows PowerShell 5.1 no tiene `-SkipHttpErrorCheck`.
- `withViewTransitions()` puede abortar una transición si el DOM cambia en prepaint; es un aviso aislado.
- El backend ordena pacientes por `nombre ASC`.
- `node app.js` viejo puede quedar escuchando en :3000 y servir código sin las rutas nuevas: matar el proceso y reiniciar.
- Un `<select>` nativo dentro del mismo `.campo` que los inputs date mantiene la altura alineada (48 px) y evita desfases de `mat-form-field`.
- No versionar `.env` ni `Backend/.env`.

## Próximos pasos

- Probar drag & drop y botones Volver en navegador (desktop y mobile).
- Hacer commit (pendiente de aviso).
- Deploy en Hostinger (MySQL + Node app + estáticos) siguiendo el README.
- Notificaciones PWA y recordatorios por WhatsApp/email.
- Generación automática del PDF de dieta según gustos y comidas por día.
