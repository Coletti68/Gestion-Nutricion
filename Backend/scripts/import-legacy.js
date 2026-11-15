const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { Paciente, Consulta, Turno } = require('../models');

// Importa los datos del backend JSON legado (server/data.json) preservando los IDs.
const archivoLegado = path.join(__dirname, '..', '..', 'server', 'data.json');

function leerLegado() {
  if (!fs.existsSync(archivoLegado)) {
    throw new Error(`No se encontró el archivo legado: ${archivoLegado}`);
  }
  return JSON.parse(fs.readFileSync(archivoLegado, 'utf8'));
}

function pacienteDesdeLegado(paciente) {
  const { id, consultas, ...datos } = paciente;
  return { id, datos, consultas: consultas || [] };
}

async function main() {
  const forzar = process.argv.includes('--force');
  const legado = leerLegado();

  const pacientes = legado.patients || legado.pacientes || [];
  const turnos = legado.appointments || legado.turnos || [];

  if (!pacientes.length) {
    throw new Error('El archivo legado no tiene pacientes para importar.');
  }

  const cantidad = await Paciente.count();
  if (cantidad > 0 && !forzar) {
    console.log(`Ya hay ${cantidad} pacientes cargados. Usá "npm run db:import -- --force" para reimportar.`);
    await db.close();
    return;
  }

  await db.transaction(async (transaccion) => {
    if (forzar) {
      await Turno.destroy({ where: {}, transaction: transaccion });
      await Consulta.destroy({ where: {}, transaction: transaccion });
      await Paciente.destroy({ where: {}, transaction: transaccion });
    }

    for (const paciente of pacientes) {
      const { id, datos, consultas } = pacienteDesdeLegado(paciente);

      await Paciente.create({ id, ...datos }, { transaction: transaccion });

      if (consultas.length) {
        await Consulta.bulkCreate(
          consultas.map((consulta) => ({
            pacienteId: id,
            fecha: consulta.fecha,
            motivo: consulta.motivo,
            peso: consulta.peso ?? null,
            observaciones: consulta.observaciones ?? null
          })),
          { transaction: transaccion }
        );
      }
    }

    if (turnos.length) {
      await Turno.bulkCreate(
        turnos.map((turno) => ({
          id: turno.id,
          pacienteId: turno.pacienteId,
          fecha: turno.fecha,
          hora: turno.hora,
          motivo: turno.motivo,
          estado: turno.estado || 'Pendiente',
          ordenManual: turno.ordenManual ?? null,
          recordatorio: turno.recordatorio !== false,
          observaciones: turno.observaciones ?? null
        })),
        { transaction: transaccion }
      );
    }
  });

  const [pacientesImportados, consultasImportadas, turnosImportados] = await Promise.all([
    Paciente.count(),
    Consulta.count(),
    Turno.count()
  ]);

  console.log(
    `Importación completa: ${pacientesImportados} pacientes, ${consultasImportadas} consultas, ${turnosImportados} turnos.`
  );
  await db.close();
}

main().catch(async (err) => {
  console.error('Error al importar los datos legados:', err.message);
  await db.close();
  process.exit(1);
});
