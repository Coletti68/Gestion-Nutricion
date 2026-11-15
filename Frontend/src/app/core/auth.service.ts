import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiClient } from './api-client';
import { RespuestaLogin, Usuario } from '../models/models';

const TOKEN_KEY = 'nutricion.token';
const USUARIO_KEY = 'nutricion.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiClient);
  private router = inject(Router);

  private _usuario = signal<Usuario | null>(this.leerUsuario());
  usuario = this._usuario.asReadonly();
  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  estaLogueado = computed(() => !!this.token());

  async login(email: string, password: string) {
    const respuesta = await this.api.post<RespuestaLogin>('/auth/login', { email, password });
    this.guardarSesion(respuesta.token, respuesta.usuario);
    return respuesta.usuario;
  }

  // Valida el token guardado contra el backend al iniciar la app.
  async validarSesion() {
    if (!this.token()) return;
    try {
      const usuario = await this.api.get<Usuario>('/auth/me');
      this._usuario.set(usuario);
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    } catch {
      this.limpiar();
    }
  }

  async cambiarPassword(actual: string, nueva: string) {
    await this.api.put('/auth/password', { actual, nueva });
  }

  logout() {
    this.limpiar();
    this.router.navigate(['/login']);
  }

  private guardarSesion(token: string, usuario: Usuario) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    this.token.set(token);
    this._usuario.set(usuario);
  }

  private limpiar() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.token.set(null);
    this._usuario.set(null);
  }

  private leerUsuario(): Usuario | null {
    try {
      const guardado = localStorage.getItem(USUARIO_KEY);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
