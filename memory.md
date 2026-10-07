# Memory — NutriGestión

## Decisiones
- 2026-10-07: proyecto creado desde cero (repo vacío). Angular 21 + Material verde en la raíz del repo.
- 2026-10-07 (2): Mobile-first implementado (sidenav `over` en handset). Vista dedicada de paciente en `/clientes/:id` con sesiones y avances de peso. Perfil ampliado con `gustos`/`evita`. Botón "Generar dieta" con configurador (3/4/5 comidas, demanda física) pero **sin generación de PDF aún** (a modo "próximamente"). Botón restablecer datos en toolbar. Estética minimalista global.

- 2026-10-07 (3): Estética cálida (fondo gradiente verde/crema, cards blancas translúcidas, chips de estado con colores suaves, toolbar con gradiente verde). Mobile pulido (días de calendario más grandes, formularios en una columna, íconos/tipografía más pequeños).

## Pendientes
- Implementar generación automática del PDF de dieta (formato tipo tabla con comidas por día y columnas de demanda física) usando los gustos del paciente.
- Deploy a GitHub Pages.
- Gráficos reales (Chart.js) si se pide.
