import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';
import { mensajeDeError } from '../../core/api-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <main class="pantalla">
      <section class="panel">
        <div class="marca">
          <mat-icon class="logo">spa</mat-icon>
          <div>
            <h1>lau.micelli</h1>
            <p>nutrición</p>
          </div>
        </div>

        <p class="bajada">Ingresá para gestionar la agenda y tus clientes.</p>

        <form [formGroup]="form" (ngSubmit)="entrar()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="username" />
            <mat-icon matSuffix>mail_outline</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input matInput [type]="verPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
            <button mat-icon-button matSuffix type="button" (click)="verPassword.set(!verPassword())" [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <mat-icon>{{ verPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <button mat-flat-button color="primary" type="submit" class="entrar" [disabled]="cargando()">
            {{ cargando() ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>

        <p class="pie">Acceso privado · uso profesional</p>
      </section>
    </main>
  `,
  styles: [`
    .pantalla{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
    .panel{width:100%;max-width:380px;background:#fff;border:1px solid #f1e9d2;border-radius:20px;padding:28px 24px;box-shadow:0 12px 40px rgba(242,140,0,.12)}
    .marca{display:flex;align-items:center;gap:12px;margin-bottom:8px}
    .logo{color:#F28C00;font-size:36px;width:36px;height:36px}
    .marca h1{margin:0;font-size:22px;line-height:1.1;color:#111}
    .marca p{margin:2px 0 0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#F28C00;font-weight:600}
    .bajada{margin:4px 0 20px;color:#666;font-size:14px}
    form{display:flex;flex-direction:column;gap:4px}
    mat-form-field{width:100%}
    .entrar{height:46px;font-weight:600;margin-top:4px}
    .error{margin:0 0 8px;color:#b3261e;font-size:13px}
    .pie{margin:20px 0 0;text-align:center;font-size:12px;color:#999}
  `],
})
export class Login {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  cargando = signal(false);
  error = signal('');
  verPassword = signal(false);

  async entrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.cargando()) return;

    this.cargando.set(true);
    this.error.set('');

    try {
      await this.auth.login(
        this.form.controls.email.value.trim().toLowerCase(),
        this.form.controls.password.value
      );
      await this.router.navigate(['/']);
    } catch (err) {
      this.error.set(mensajeDeError(err));
    } finally {
      this.cargando.set(false);
    }
  }
}
