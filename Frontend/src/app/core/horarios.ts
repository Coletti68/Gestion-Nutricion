import { RangoHorario } from '../models/models';

function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Valida rangos antes de enviarlos: completos, ordenados y sin superposiciones.
export function validarRangos(rangos: RangoHorario[]): string | null {
  if (!rangos.length) return 'Agregá al menos un horario o marcá el día como cerrado.';

  for (const rango of rangos) {
    if (!rango.horaInicio || !rango.horaFin) return 'Completá todos los horarios.';
    if (rango.horaFin <= rango.horaInicio) {
      return `El horario ${rango.horaInicio}–${rango.horaFin} no es válido.`;
    }
    if (aMinutos(rango.horaFin) - aMinutos(rango.horaInicio) < rango.duracionMinutos) {
      return `El rango ${rango.horaInicio}–${rango.horaFin} es más corto que la duración del turno.`;
    }
  }

  const ordenados = [...rangos].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  for (let i = 1; i < ordenados.length; i += 1) {
    if (ordenados[i].horaInicio < ordenados[i - 1].horaFin) {
      return `Los horarios ${ordenados[i - 1].horaInicio}–${ordenados[i - 1].horaFin} y ${ordenados[i].horaInicio}–${ordenados[i].horaFin} se superponen.`;
    }
  }

  return null;
}
