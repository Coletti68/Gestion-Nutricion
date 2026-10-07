import { Patient, Appointment } from '../models/models';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1, nombre: 'María González', edad: 34, sexo: 'Femenino', telefono: '11 5555-1234',
    email: 'maria.gonzalez@email.com', objetivo: 'Descenso de peso',
    alergias: 'Lactosa', patologias: 'Hipotiroidismo',
    preferencias: 'Verduras, pollo, atún, frutas cítricas, evita frituras', gustos: 'Verduras, pollo, atún, frutas cítricas, evita frituras', evita: 'Alimentos fritos, ultraprocesados',
    pesoInicial: 82, altura: 162,
    consultas: [
      { fecha: '2026-05-12', motivo: 'Primera consulta', peso: 82, observaciones: 'Plan inicial hipocalórico' },
      { fecha: '2026-06-20', motivo: 'Control mensual', peso: 79.5, observaciones: 'Buena adherencia al plan' },
      { fecha: '2026-08-05', motivo: 'Control mensual', peso: 77.2, observaciones: 'Se ajustan porciones' },
      { fecha: '2026-09-18', motivo: 'Control mensual', peso: 74.8, observaciones: 'Excelente evolución' },
    ],
  },
  {
    id: 2, nombre: 'Carlos Fernández', edad: 45, sexo: 'Masculino', telefono: '11 4444-9876',
    email: 'carlos.fdez@email.com', objetivo: 'Control de diabetes',
    alergias: 'Ninguna', patologias: 'Diabetes tipo 2, hipertensión',
    preferencias: 'Carnes magras, legumbres, avena, frutos secos, sin azúcar agregada', gustos: 'Carnes magras, legumbres, avena, frutos secos, sin azúcar agregada', evita: 'Alimentos fritos, ultraprocesados',
    pesoInicial: 95, altura: 176,
    consultas: [
      { fecha: '2026-04-02', motivo: 'Primera consulta', peso: 95, observaciones: 'Plan para control glucémico' },
      { fecha: '2026-06-01', motivo: 'Control', peso: 92.3, observaciones: 'Mejora de glucemia en ayunas' },
      { fecha: '2026-09-10', motivo: 'Control', peso: 89.6, observaciones: 'Se mantiene el plan, más actividad física' },
    ],
  },
  {
    id: 3, nombre: 'Lucía Pérez', edad: 27, sexo: 'Femenino', telefono: '11 3333-4567',
    email: 'lucia.perez@email.com', objetivo: 'Ganancia de masa muscular',
    alergias: 'Frutos secos', patologias: 'Ninguna',
    preferencias: 'Huevos, yogur, arroz, banana, pescado, batidos de proteínas', gustos: 'Huevos, yogur, arroz, banana, pescado, batidos de proteínas', evita: 'Alimentos fritos, ultraprocesados',
    pesoInicial: 56, altura: 165,
    consultas: [
      { fecha: '2026-06-15', motivo: 'Primera consulta', peso: 56, observaciones: 'Plan hipercalórico proteico' },
      { fecha: '2026-08-20', motivo: 'Control', peso: 58.4, observaciones: 'Buena evolución con entrenamiento' },
      { fecha: '2026-10-01', motivo: 'Control', peso: 60.1, observaciones: 'Aumentar carbohidratos pre-entreno' },
    ],
  },
  {
    id: 4, nombre: 'Jorge Ramírez', edad: 52, sexo: 'Masculino', telefono: '11 6666-2222',
    email: 'jorge.ramirez@email.com', objetivo: 'Descenso de peso',
    alergias: 'Mani', patologias: 'Colesterol alto',
    preferencias: 'Pescado, aceite de oliva, ensaladas, legumbres, limita carnes rojas', gustos: 'Pescado, aceite de oliva, ensaladas, legumbres, limita carnes rojas', evita: 'Alimentos fritos, ultraprocesados',
    pesoInicial: 88, altura: 170,
    consultas: [
      { fecha: '2026-07-08', motivo: 'Primera consulta', peso: 88, observaciones: 'Plan cardioprotector' },
      { fecha: '2026-09-02', motivo: 'Control', peso: 85.7, observaciones: 'Colesterol con leve mejora' },
    ],
  },
  {
    id: 5, nombre: 'Sofía Torres', edad: 19, sexo: 'Femenino', telefono: '11 2222-8888',
    email: 'sofia.torres@email.com', objetivo: 'Alimentación saludable',
    alergias: 'Gluten', patologias: 'Enfermedad celíaca',
    preferencias: 'Arroz, quinoa, papas, frutas, verduras, lácteos, sin TACC', gustos: 'Arroz, quinoa, papas, frutas, verduras, lácteos, sin TACC', evita: 'Alimentos fritos, ultraprocesados',
    pesoInicial: 61, altura: 168,
    consultas: [
      { fecha: '2026-09-25', motivo: 'Primera consulta', peso: 61, observaciones: 'Plan libre de gluten estricto' },
    ],
  },
  {
    id: 6, nombre: 'Diego Morales', edad: 38, sexo: 'Masculino', telefono: '11 7777-3333',
    email: 'diego.morales@email.com', objetivo: 'Mejorar rendimiento deportivo',
    alergias: 'Ninguna', patologias: 'Ninguna',
    preferencias: 'Frutas, avena, pastas, pollo, palta, batidos de recuperación', gustos: 'Frutas, avena, pastas, pollo, palta, batidos de recuperación', evita: 'Alimentos fritos, ultraprocesados',
    pesoInicial: 74, altura: 180,
    consultas: [
      { fecha: '2026-03-10', motivo: 'Primera consulta', peso: 74, observaciones: 'Plan según entrenamiento 5 veces por semana' },
      { fecha: '2026-05-14', motivo: 'Control', peso: 74.9, observaciones: 'Mejora en recuperación muscular' },
      { fecha: '2026-08-22', motivo: 'Control', peso: 75.6, observaciones: 'Composición corporal favorable' },
      { fecha: '2026-10-02', motivo: 'Control', peso: 76.2, observaciones: 'Se mantiene carga glucídica pre-competencia' },
    ],
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, fecha: '2026-10-07', hora: '09:00', pacienteId: 1, motivo: 'Control mensual', estado: 'Confirmado' },
  { id: 2, fecha: '2026-10-07', hora: '10:30', pacienteId: 3, motivo: 'Seguimiento', estado: 'Confirmado' },
  { id: 3, fecha: '2026-10-08', hora: '11:00', pacienteId: 2, motivo: 'Control diabético', estado: 'Pendiente' },
  { id: 4, fecha: '2026-10-09', hora: '16:00', pacienteId: 5, motivo: 'Primera consulta seguimiento', estado: 'Confirmado' },
  { id: 5, fecha: '2026-10-10', hora: '08:30', pacienteId: 6, motivo: 'Evaluación deportiva', estado: 'Confirmado' },
  { id: 6, fecha: '2026-10-12', hora: '14:00', pacienteId: 4, motivo: 'Control colesterol', estado: 'Pendiente' },
  { id: 7, fecha: '2026-10-14', hora: '10:00', pacienteId: 1, motivo: 'Revisión de plan', estado: 'Confirmado' },
];
