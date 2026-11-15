// Utilidades de fecha sin zona horaria: se trabaja siempre con ISO (YYYY-MM-DD).
export const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];
export const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaLocal(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function aIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate()
  ).padStart(2, '0')}`;
}

export function hoyIso(): string {
  return aIso(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = fechaLocal(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aIso(fecha);
}

// 1 = Lunes ... 7 = Domingo.
export function diaSemanaIso(iso: string): number {
  const dia = fechaLocal(iso).getDay();
  return dia === 0 ? 7 : dia;
}

export function esHoy(iso: string): boolean {
  return iso === hoyIso();
}

export function esPasado(iso: string): boolean {
  return iso < hoyIso();
}

// "Sáb 14"
export function etiquetaDia(iso: string): string {
  const fecha = fechaLocal(iso);
  return `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()}`;
}

// "Sáb 14 nov"
export function etiquetaDiaMes(iso: string): string {
  const fecha = fechaLocal(iso);
  return `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;
}

// "sábado 14 de noviembre"
export function etiquetaLarga(iso: string): string {
  const fecha = fechaLocal(iso);
  return `${DIAS[fecha.getDay()].toLowerCase()} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

// "14/11/2026"
export function fechaCorta(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

// "14 nov 2026"
export function fechaConAnio(iso: string): string {
  const fecha = fechaLocal(iso);
  return `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]} ${fecha.getFullYear()}`;
}
