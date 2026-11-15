const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DURACION_DEFAULT = 60;

async function migrar(conexion) {
  // MySQL no soporta ADD COLUMN IF NOT EXISTS: se chequea information_schema.
  const columnasNuevas = [
    {
      tabla: 'turno',
      nombre: 'duracion_minutos',
      sql: 'ALTER TABLE turno ADD COLUMN duracion_minutos INT NOT NULL DEFAULT 60 AFTER hora'
    },
    {
      tabla: 'turno',
      nombre: 'reprogramado',
      sql: 'ALTER TABLE turno ADD COLUMN reprogramado BOOLEAN NOT NULL DEFAULT FALSE AFTER recordatorio'
    },
    {
      tabla: 'consulta',
      nombre: 'activo',
      sql: 'ALTER TABLE consulta ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE AFTER observaciones'
    }
  ];

  for (const columna of columnasNuevas) {
    const [columnas] = await conexion.query(
      `SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [process.env.DB_NAME, columna.tabla, columna.nombre]
    );

    if (!columnas.length) {
      await conexion.query(columna.sql);
      console.log(`Columna ${columna.tabla}.${columna.nombre} agregada.`);
    }
  }
}

async function cargarObjetivosPorDefecto(conexion) {
  const [filas] = await conexion.query('SELECT COUNT(*) AS total FROM objetivo');
  if (filas[0].total > 0) return;

  const objetivos = [
    'Descenso de peso',
    'Ganancia de masa muscular',
    'Control de diabetes',
    'Alimentación saludable',
    'Mejorar rendimiento deportivo'
  ];

  await conexion.query(
    'INSERT INTO objetivo (nombre, orden) VALUES ?',
    [objetivos.map((nombre, orden) => [nombre, orden])]
  );
  console.log('Objetivos iniciales cargados.');
}

async function cargarHorariosPorDefecto(conexion) {
  const [filas] = await conexion.query('SELECT COUNT(*) AS total FROM disponibilidad_semanal');
  if (filas[0].total > 0) return;

  const rangos = [];
  for (let dia = 1; dia <= 5; dia += 1) {
    rangos.push([dia, '08:00:00', '12:00:00', DURACION_DEFAULT]);
    rangos.push([dia, '16:00:00', '20:00:00', DURACION_DEFAULT]);
  }

  await conexion.query(
    `INSERT INTO disponibilidad_semanal (dia_semana, hora_inicio, hora_fin, duracion_minutos)
     VALUES ?`,
    [rangos]
  );
  console.log('Horarios por defecto: Lun a Vie de 08:00 a 12:00 y de 16:00 a 20:00 (60 min).');
}

async function main() {
  const archivo = path.join(__dirname, '..', 'sql', 'nutricion.sql');
  const sql = fs.readFileSync(archivo, 'utf8');

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  await conexion.query(sql);
  await migrar(conexion);
  await cargarObjetivosPorDefecto(conexion);
  await cargarHorariosPorDefecto(conexion);
  await conexion.end();

  console.log(`Base "${process.env.DB_NAME}" y tablas listas.`);
}

main().catch((err) => {
  console.error('No se pudo crear la base de datos:', err.message);
  process.exit(1);
});
