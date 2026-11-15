const db = require('../config/db');
const { Paciente, Consulta, Turno, DisponibilidadSemanal } = require('../models');

const pacientes = [
  {
    nombre: 'María González',
    edad: 34,
    sexo: 'Femenino',
    telefono: '11 5555-1234',
    email: 'maria.gonzalez@email.com',
    objetivo: 'Descenso de peso',
    alergias: 'Lactosa',
    patologias: 'Hipotiroidismo',
    preferencias: 'Verduras, pollo, atún, frutas cítricas',
    gustos: 'Verduras, pollo, atún, frutas cítricas',
    evita: 'Frituras, ultraprocesados',
    pesoInicial: 82,
    altura: 162,
    consultas: [
      { fecha: '2026-05-12', motivo: 'Primera consulta', peso: 82, observaciones: 'Plan inicial hipocalórico' },
      { fecha: '2026-06-20', motivo: 'Control mensual', peso: 79.5, observaciones: 'Buena adherencia al plan' },
      { fecha: '2026-08-05', motivo: 'Control mensual', peso: 77.2, observaciones: 'Se ajustan porciones' },
      { fecha: '2026-09-18', motivo: 'Control mensual', peso: 74.8, observaciones: 'Excelente evolución' }
    ]
  },
  {
    nombre: 'Carlos Fernández',
    edad: 45,
    sexo: 'Masculino',
    telefono: '11 4444-9876',
    email: 'carlos.fdez@email.com',
    objetivo: 'Control de diabetes',
    alergias: 'Ninguna',
    patologias: 'Diabetes tipo 2, hipertensión',
    preferencias: 'Carnes magras, legumbres, avena, frutos secos',
    gustos: 'Carnes magras, legumbres, avena, frutos secos',
    evita: 'Azúcar agregada, bebidas azucaradas',
    pesoInicial: 95,
    altura: 176,
    consultas: [
      { fecha: '2026-04-02', motivo: 'Primera consulta', peso: 95, observaciones: 'Plan para control glucémico' },
      { fecha: '2026-06-01', motivo: 'Control', peso: 92.3, observaciones: 'Mejora de glucemia en ayunas' },
      { fecha: '2026-09-10', motivo: 'Control', peso: 89.6, observaciones: 'Se mantiene el plan, más actividad física' }
    ]
  },
  {
    nombre: 'Lucía Pérez',
    edad: 27,
    sexo: 'Femenino',
    telefono: '11 3333-4567',
    email: 'lucia.perez@email.com',
    objetivo: 'Ganancia de masa muscular',
    alergias: 'Frutos secos',
    patologias: 'Ninguna',
    preferencias: 'Huevos, yogur, arroz, banana, pescado',
    gustos: 'Huevos, yogur, arroz, banana, pescado',
    evita: 'Fritos, gaseosas',
    pesoInicial: 56,
    altura: 165,
    consultas: [
      { fecha: '2026-06-15', motivo: 'Primera consulta', peso: 56, observaciones: 'Plan hipercalórico proteico' },
      { fecha: '2026-08-20', motivo: 'Control', peso: 58.4, observaciones: 'Buena evolución con entrenamiento' },
      { fecha: '2026-10-01', motivo: 'Control', peso: 60.1, observaciones: 'Aumentar carbohidratos pre-entreno' }
    ]
  },
  {
    nombre: 'Jorge Ramírez',
    edad: 52,
    sexo: 'Masculino',
    telefono: '11 6666-2222',
    email: 'jorge.ramirez@email.com',
    objetivo: 'Descenso de peso',
    alergias: 'Maní',
    patologias: 'Colesterol alto',
    preferencias: 'Pescado, aceite de oliva, ensaladas, legumbres',
    gustos: 'Pescado, ensaladas, legumbres',
    evita: 'Carnes rojas, frituras',
    pesoInicial: 88,
    altura: 170,
    consultas: [
      { fecha: '2026-07-08', motivo: 'Primera consulta', peso: 88, observaciones: 'Plan cardioprotector' },
      { fecha: '2026-09-02', motivo: 'Control', peso: 85.7, observaciones: 'Colesterol con leve mejora' }
    ]
  },
  {
    nombre: 'Sofía Torres',
    edad: 19,
    sexo: 'Femenino',
    telefono: '11 2222-8888',
    email: 'sofia.torres@email.com',
    objetivo: 'Alimentación saludable',
    alergias: 'Gluten',
    patologias: 'Enfermedad celíaca',
    preferencias: 'Arroz, quinoa, papas, frutas, verduras',
    gustos: 'Arroz, quinoa, papas, frutas, verduras',
    evita: 'Todo alimento con TACC',
    pesoInicial: 61,
    altura: 168,
    consultas: [
      { fecha: '2026-09-25', motivo: 'Primera consulta', peso: 61, observaciones: 'Plan libre de gluten estricto' }
    ]
  },
  {
    nombre: 'Diego Morales',
    edad: 38,
    sexo: 'Masculino',
    telefono: '11 7777-3333',
    email: 'diego.morales@email.com',
    objetivo: 'Mejorar rendimiento deportivo',
    alergias: 'Ninguna',
    patologias: 'Ninguna',
    preferencias: 'Frutas, avena, pastas, pollo, palta',
    gustos: 'Frutas, avena, pastas, pollo, palta',
    evita: 'Comida chatarra',
    pesoInicial: 74,
    altura: 180,
    consultas: [
      { fecha: '2026-03-10', motivo: 'Primera consulta', peso: 74, observaciones: 'Plan según entrenamiento 5 veces por semana' },
      { fecha: '2026-05-14', motivo: 'Control', peso: 74.9, observaciones: 'Mejora en recuperación muscular' },
      { fecha: '2026-08-22', motivo: 'Control', peso: 75.6, observaciones: 'Composición corporal favorable' },
      { fecha: '2026-10-02', motivo: 'Control', peso: 76.2, observaciones: 'Se mantiene carga glucídica pre-competencia' }
    ]
  }
];

function iso(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate()
  ).padStart(2, '0')}`;
}

function lunesDeEstaSemana() {
  const base = new Date();
  const dia = base.getDay();
  base.setDate(base.getDate() + (dia === 0 ? -6 : 1 - dia));
  base.setHours(0, 0, 0, 0);
  return base;
}

function turnosDemo() {
  const base = lunesDeEstaSemana();

  return [
    { dia: 0, hora: '09:00', paciente: 1, motivo: 'Control mensual', estado: 'Confirmado' },
    { dia: 0, hora: '10:00', paciente: 3, motivo: 'Seguimiento', estado: 'Confirmado' },
    { dia: 1, hora: '11:00', paciente: 2, motivo: 'Control diabético', estado: 'Pendiente' },
    { dia: 2, hora: '16:00', paciente: 5, motivo: 'Primera consulta seguimiento', estado: 'Confirmado' },
    { dia: 3, hora: '08:00', paciente: 6, motivo: 'Evaluación deportiva', estado: 'Confirmado' },
    { dia: 3, hora: '10:00', paciente: 1, motivo: 'Revisión de plan', estado: 'Pendiente' },
    { dia: 4, hora: '17:00', paciente: 4, motivo: 'Control colesterol', estado: 'Pendiente' }
  ].map((turno) => {
    const fecha = new Date(base);
    fecha.setDate(base.getDate() + turno.dia);
    return { ...turno, fecha: iso(fecha), recordatorio: true };
  });
}

async function main() {
  const forzar = process.argv.includes('--force');
  const cantidad = await Paciente.count();

  if (cantidad > 0 && !forzar) {
    console.log(`Ya hay ${cantidad} pacientes cargados. Usá "npm run db:seed -- --force" para recargar.`);
    await db.close();
    return;
  }

  await db.transaction(async (transaccion) => {
    if (forzar) {
      await Turno.destroy({ where: {}, transaction: transaccion });
      await Consulta.destroy({ where: {}, transaction: transaccion });
      await Paciente.destroy({ where: {}, transaction: transaccion });
    }

    const ids = [];

    for (const { consultas, ...datos } of pacientes) {
      const paciente = await Paciente.create(datos, { transaction: transaccion });
      ids.push(paciente.id);

      await Consulta.bulkCreate(
        consultas.map((consulta) => ({ ...consulta, pacienteId: paciente.id })),
        { transaction: transaccion }
      );
    }

    const turnos = turnosDemo().map(({ paciente, dia, ...turno }) => ({
      ...turno,
      pacienteId: ids[paciente - 1]
    }));

    await Turno.bulkCreate(turnos, { transaction: transaccion });
  });

  // Si no hay plantilla semanal, carga la de ejemplo.
  if ((await DisponibilidadSemanal.count()) === 0) {
    const rangos = [];
    for (let dia = 1; dia <= 5; dia += 1) {
      rangos.push({ diaSemana: dia, horaInicio: '08:00', horaFin: '12:00', duracionMinutos: 60 });
      rangos.push({ diaSemana: dia, horaInicio: '16:00', horaFin: '20:00', duracionMinutos: 60 });
    }
    await DisponibilidadSemanal.bulkCreate(rangos);
  }

  const [pacientesCreados, consultasCreadas, turnosCreados] = await Promise.all([
    Paciente.count(),
    Consulta.count(),
    Turno.count()
  ]);

  console.log(`Datos demo cargados: ${pacientesCreados} pacientes, ${consultasCreadas} consultas, ${turnosCreados} turnos.`);
  await db.close();
}

main().catch(async (err) => {
  console.error('Error al cargar los datos demo:', err.message);
  await db.close();
  process.exit(1);
});
