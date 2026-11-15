function configurarRelaciones({ Paciente, Consulta, Turno }) {
  Paciente.hasMany(Consulta, {
    foreignKey: 'pacienteId',
    as: 'consultas',
    onDelete: 'CASCADE'
  });
  Consulta.belongsTo(Paciente, {
    foreignKey: 'pacienteId',
    as: 'paciente'
  });

  Paciente.hasMany(Turno, {
    foreignKey: 'pacienteId',
    as: 'turnos',
    onDelete: 'CASCADE'
  });
  Turno.belongsTo(Paciente, {
    foreignKey: 'pacienteId',
    as: 'paciente'
  });
}

module.exports = configurarRelaciones;
