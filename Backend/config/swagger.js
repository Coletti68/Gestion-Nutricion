const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API lau.micelli.nutricion',
    version: '1.0.0',
    description: 'API de gestión nutricional: pacientes, consultas y turnos.'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          detalles: { type: 'array', items: { type: 'string' } }
        }
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          email: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      Objetivo: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          orden: { type: 'integer' },
          activo: { type: 'boolean' }
        }
      },
      Consulta: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          pacienteId: { type: 'integer' },
          fecha: { type: 'string', format: 'date' },
          motivo: { type: 'string' },
          peso: { type: 'number', nullable: true },
          observaciones: { type: 'string', nullable: true },
          activo: { type: 'boolean' }
        }
      },
      Paciente: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          edad: { type: 'integer', nullable: true },
          sexo: { type: 'string', nullable: true },
          telefono: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          objetivo: { type: 'string', nullable: true },
          alergias: { type: 'string', nullable: true },
          patologias: { type: 'string', nullable: true },
          preferencias: { type: 'string', nullable: true },
          gustos: { type: 'string', nullable: true },
          evita: { type: 'string', nullable: true },
          pesoInicial: { type: 'number', nullable: true },
          altura: { type: 'number', nullable: true },
          activo: { type: 'boolean' },
          consultas: { type: 'array', items: { $ref: '#/components/schemas/Consulta' } }
        }
      },
      Turno: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          pacienteId: { type: 'integer' },
          fecha: { type: 'string', format: 'date' },
          hora: { type: 'string', example: '09:00' },
          duracionMinutos: { type: 'integer', example: 60 },
          motivo: { type: 'string' },
          estado: { type: 'string', enum: ['Pendiente', 'Confirmado', 'Realizado', 'Cancelado'] },
          ordenManual: { type: 'integer', nullable: true },
          recordatorio: { type: 'boolean' },
          reprogramado: { type: 'boolean' },
          observaciones: { type: 'string', nullable: true }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado del servicio',
        security: [],
        responses: { 200: { description: 'Servicio activo' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: { description: 'Token y usuario' },
          401: { description: 'Credenciales inválidas' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Perfil del usuario autenticado',
        responses: { 200: { description: 'Usuario', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } } }
      }
    },
    '/auth/password': {
      put: {
        tags: ['Auth'],
        summary: 'Cambiar contraseña',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['actual', 'nueva'],
                properties: { actual: { type: 'string' }, nueva: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Contraseña actualizada' }, 400: { description: 'Contraseña actual incorrecta' } }
      }
    },
    '/objetivos': {
      get: {
        tags: ['Objetivos'],
        summary: 'Listar objetivos activos',
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Objetivo' } } } } }
        }
      },
      post: {
        tags: ['Objetivos'],
        summary: 'Crear objetivo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string' },
                  orden: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Objetivo creado' },
          409: { description: 'Ya existe un objetivo con ese nombre' }
        }
      }
    },
    '/objetivos/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      put: {
        tags: ['Objetivos'],
        summary: 'Renombrar o reordenar un objetivo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  orden: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Objetivo actualizado' },
          404: { description: 'No encontrado' },
          409: { description: 'Nombre duplicado' }
        }
      },
      delete: {
        tags: ['Objetivos'],
        summary: 'Desactivar objetivo',
        responses: { 200: { description: 'Objetivo desactivado' }, 404: { description: 'No encontrado' } }
      }
    },
    '/pacientes': {
      get: {
        tags: ['Pacientes'],
        summary: 'Listar pacientes',
        parameters: [{ in: 'query', name: 'q', schema: { type: 'string' }, description: 'Buscar por nombre, objetivo o email' }],
        responses: {
          200: { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Paciente' } } } } }
        }
      },
      post: {
        tags: ['Pacientes'],
        summary: 'Crear paciente',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Paciente' } } } },
        responses: { 201: { description: 'Paciente creado' }, 400: { description: 'Datos inválidos' } }
      }
    },
    '/pacientes/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Pacientes'],
        summary: 'Obtener paciente',
        responses: { 200: { description: 'Paciente' }, 404: { description: 'No encontrado' } }
      },
      put: {
        tags: ['Pacientes'],
        summary: 'Actualizar paciente',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Paciente' } } } },
        responses: { 200: { description: 'Paciente actualizado' }, 404: { description: 'No encontrado' } }
      },
      delete: {
        tags: ['Pacientes'],
        summary: 'Eliminar paciente y sus datos',
        responses: { 200: { description: 'Paciente eliminado' }, 404: { description: 'No encontrado' } }
      }
    },
    '/pacientes/{id}/consultas': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Consultas'],
        summary: 'Listar consultas del paciente',
        responses: { 200: { description: 'Consultas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Consulta' } } } } } }
      },
      post: {
        tags: ['Consultas'],
        summary: 'Registrar consulta',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Consulta' } } } },
        responses: { 201: { description: 'Consulta creada' } }
      }
    },
    '/consultas/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      put: {
        tags: ['Consultas'],
        summary: 'Actualizar consulta',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Consulta' } } } },
        responses: { 200: { description: 'Consulta actualizada' } }
      },
      delete: {
        tags: ['Consultas'],
        summary: 'Desactivar consulta (baja lógica)',
        responses: { 200: { description: 'Consulta desactivada' } }
      }
    },
    '/turnos': {
      get: {
        tags: ['Turnos'],
        summary: 'Listar turnos',
        parameters: [
          { in: 'query', name: 'desde', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'hasta', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'pacienteId', schema: { type: 'integer' } },
          { in: 'query', name: 'estado', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Turnos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Turno' } } } } } }
      },
      post: {
        tags: ['Turnos'],
        summary: 'Crear turno',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Turno' } } } },
        responses: { 201: { description: 'Turno creado' }, 400: { description: 'Datos inválidos' } }
      }
    },
    '/turnos/reordenar': {
      put: {
        tags: ['Turnos'],
        summary: 'Reordenar turnos (drag & drop)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'fecha', 'ordenManual'],
                  properties: {
                    id: { type: 'integer' },
                    fecha: { type: 'string', format: 'date' },
                    ordenManual: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Turnos reordenados' } }
      }
    },
    '/turnos/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      put: {
        tags: ['Turnos'],
        summary: 'Actualizar turno',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Turno' } } } },
        responses: { 200: { description: 'Turno actualizado' } }
      },
      delete: {
        tags: ['Turnos'],
        summary: 'Eliminar turno',
        responses: { 200: { description: 'Turno eliminado' } }
      }
    },
    '/turnos/{id}/finalizar': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
      post: {
        tags: ['Turnos'],
        summary: 'Finalizar turno y registrar la consulta',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['peso'],
                properties: {
                  peso: { type: 'number' },
                  motivo: { type: 'string' },
                  observaciones: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Turno finalizado y consulta creada' },
          409: { description: 'El turno ya está finalizado o cancelado' }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
