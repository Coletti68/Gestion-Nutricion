import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

// Cliente HTTP centralizado: una sola base y errores con mensaje legible.
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  get<T>(ruta: string) {
    return firstValueFrom(this.http.get<T>(`${this.base}${ruta}`));
  }

  post<T>(ruta: string, cuerpo: unknown) {
    return firstValueFrom(this.http.post<T>(`${this.base}${ruta}`, cuerpo));
  }

  put<T>(ruta: string, cuerpo: unknown) {
    return firstValueFrom(this.http.put<T>(`${this.base}${ruta}`, cuerpo));
  }

  delete<T>(ruta: string) {
    return firstValueFrom(this.http.delete<T>(`${this.base}${ruta}`));
  }
}

// Traduce la respuesta de error del backend a un texto para mostrar.
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    const cuerpo = error.error as { error?: string; detalles?: string[] } | null;
    if (cuerpo?.detalles?.length) return cuerpo.detalles.join('. ');
    if (cuerpo?.error) return cuerpo.error;
    return `Error ${error.status}.`;
  }
  return 'Ocurrió un error inesperado.';
}
