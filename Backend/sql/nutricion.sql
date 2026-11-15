-- Base de datos de lau.micelli.nutricion
-- Ejecutar con: npm run db:setup

CREATE DATABASE IF NOT EXISTS nutricion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nutricion;

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Catálogo editable de objetivos del paciente.
CREATE TABLE IF NOT EXISTS objetivo (
  id_objetivo INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paciente (
  id_paciente INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  edad INT NULL,
  sexo VARCHAR(20) NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  objetivo VARCHAR(120) NULL,
  alergias TEXT NULL,
  patologias TEXT NULL,
  preferencias TEXT NULL,
  gustos TEXT NULL,
  evita TEXT NULL,
  peso_inicial DECIMAL(5,2) NULL,
  altura DECIMAL(5,2) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consulta (
  id_consulta INT PRIMARY KEY AUTO_INCREMENT,
  id_paciente INT NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(120) NOT NULL,
  peso DECIMAL(5,2) NULL,
  observaciones TEXT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consulta_paciente
    FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente) ON DELETE CASCADE,
  INDEX idx_consulta_paciente (id_paciente, fecha)
);

CREATE TABLE IF NOT EXISTS turno (
  id_turno INT PRIMARY KEY AUTO_INCREMENT,
  id_paciente INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_minutos INT NOT NULL DEFAULT 60,
  motivo VARCHAR(120) NOT NULL,
  estado ENUM('Pendiente', 'Confirmado', 'Realizado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
  orden_manual INT NULL,
  recordatorio BOOLEAN NOT NULL DEFAULT TRUE,
  reprogramado BOOLEAN NOT NULL DEFAULT FALSE,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_turno_paciente
    FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente) ON DELETE CASCADE,
  INDEX idx_turno_fecha (fecha, hora),
  INDEX idx_turno_paciente (id_paciente)
);

-- Plantilla semanal de horarios: 1 = Lunes ... 7 = Domingo.
CREATE TABLE IF NOT EXISTS disponibilidad_semanal (
  id_disponibilidad INT PRIMARY KEY AUTO_INCREMENT,
  dia_semana TINYINT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_minutos INT NOT NULL DEFAULT 60,
  INDEX idx_disponibilidad_dia (dia_semana)
);

-- Excepciones de un día puntual: pisan la plantilla semanal.
-- Si cerrado = TRUE, el día no atiende (hora_inicio y hora_fin quedan NULL).
CREATE TABLE IF NOT EXISTS disponibilidad_dia (
  id_disponibilidad_dia INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATE NOT NULL,
  hora_inicio TIME NULL,
  hora_fin TIME NULL,
  duracion_minutos INT NOT NULL DEFAULT 60,
  cerrado BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_disponibilidad_fecha (fecha)
);
