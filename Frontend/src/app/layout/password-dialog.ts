import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../core/auth.service';
import { mensajeDeError } from '../core/api-client';

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Cambiar contraseña</h2>
    <mat-dialog-content class="form">
      <p class="sub">{{ data.email }}</p>
      <mat-form-field appearance="outline">
        <mat-label>Contraseña actual</mat-label>
        <input matInput type="password" [(ngModel)]="actual" autocomplete="current-password" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Contraseña nueva</mat-label>
        <input matInput type="password" [(ngModel)]="nueva" autocomplete="new-password" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Repetir contraseña nueva</mat-label>
        <input matInput type="password" [(ngModel)]="repetir" autocomplete="new-password" />
      </mat-form-field>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="guardando()" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form{display:flex;flex-direction:column;gap:4px;min-width:300px}
    .sub{margin:0 0 8px;color:#666;font-size:13px}
    .error{margin:0;color:#b3261e;font-size:13px}
  `],
})
export class PasswordDialog {
  data = inject<{ email: string }>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<PasswordDialog>);
  private auth = inject(AuthService);

  actual = '';
  nueva = '';
  repetir = '';
  guardando = signal(false);
  error = signal('');

  async guardar() {
    this.error.set('');

    if (this.nueva.length < 8) {
      this.error.set('La contraseña nueva debe tener al menos 8 caracteres.');
      return;
    }
    if (this.nueva !== this.repetir) {
      this.error.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    this.guardando.set(true);
    try {
      await this.auth.cambiarPassword(this.actual, this.nueva);
      this.ref.close(true);
    } catch (err) {
      this.error.set(mensajeDeError(err));
    } finally {
      this.guardando.set(false);
    }
  }
}
