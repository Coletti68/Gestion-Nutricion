# Agents — NutriGestión

Mockup SPA para un nutricionista: Angular 21 standalone + Angular Material (tema verde, minimalista) + datos mock en `localStorage`. Sin backend.

## Estructura
- `src/app/app.ts` — layout: sidenav (over en mobile vía BreakpointObserver) + toolbar con botón "restablecer datos"
- `src/app/app.routes.ts` — `/`, `/clientes`, `/clientes/:id`, `/calendario`
- `src/app/models/models.ts` — `Patient`, `Consultation`, `Appointment`
- `src/app/data/mock-data.ts` — datos demo (6 pacientes, 7 turnos)
- `src/app/services/data.service.ts` — signals + persistencia localStorage (`resetDemo()` disponible)
- `src/app/services/pdf.service.ts` — PDF con jsPDF + jspdf-autotable (dieta y seguimiento)
- `src/app/pages/*` — Dashboard, Clients, PatientDetail, CalendarPage

## Comandos
- Dev: `ng serve`
- Build: `ng build --configuration production`
- GH Pages: `ng build --configuration production --base-href "/Gestion-Nutricion/"` y publicar `dist/gestion-nutricion/browser`

## Reglas
- UI en español; estilos con Angular Material + ajustes minimalistas en `styles.scss`
- Sin backend: los datos se resetean con el botón ↺ de la toolbar
- "Generar dieta" en detalle de paciente: configurador de comidas/día y demanda física, PDF automatico pendiente de implementar
