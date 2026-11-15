import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import { Objetivo } from '../../models/models';
import { ConfirmacionDialog } from '../../shared/confirm-dialog';

// Catálogo editable de objetivos: alta, renombrado y baja lógica.
@Component({
  selector: 'app-objetivos-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Objetivos</h2>

    <mat-dialog-content class="contenido">
      <p class="ayuda">
        Estos objetivos aparecen en el select del paciente. Si renombrás uno, también se actualizan
        los pacientes que lo tenían.
      </p>

      <div class="nuevo">
        <input
          [(ngModel)]="nuevo"
          name="nuevoObjetivo"
          placeholder="Nuevo objetivo"
          aria-label="Nuevo objetivo"
          (keyup.enter)="agregar()"
        />
        <button mat-flat-button class="agregar" (click)="agregar()" [disabled]="!nuevo.trim() || guardando()">
          <mat-icon>add</mat-icon>
          Agregar
        </button>
      </div>

      <ul class="lista">
        @for (o of objetivos(); track o.id) {
          <li class="item">
            @if (editandoId() === o.id) {
              <input
                class="editar-input"
                [(ngModel)]="nombreEditado"
                name="objetivoEditado"
                aria-label="Editar objetivo"
                (keyup.enter)="guardarEdicion(o)"
                (keyup.escape)="cancelarEdicion()"
              />
              <button mat-icon-button class="ok" (click)="guardarEdicion(o)" aria-label="Guardar" [disabled]="guardando()">
                <mat-icon>check</mat-icon>
              </button>
              <button mat-icon-button (click)="cancelarEdicion()" aria-label="Cancelar">
                <mat-icon>close</mat-icon>
              </button>
            } @else {
              <span class="nombre">{{ o.nombre }}</span>
              <button mat-icon-button (click)="editar(o)" aria-label="Renombrar objetivo">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="borrar" (click)="eliminar(o)" aria-label="Desactivar objetivo">
                <mat-icon>delete</mat-icon>
              </button>
            }
          </li>
        } @empty {
          <li class="vacio">No hay objetivos cargados.</li>
        }
      </ul>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .contenido {
        padding-top: 4px;
      }
      .ayuda {
        margin: 0 0 14px;
        color: #7a6a4a;
        font-size: 13px;
        line-height: 1.4;
      }
      .nuevo {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }
      .nuevo input,
      .editar-input {
        flex: 1;
        min-width: 0;
        border: 1px solid #f1e9d2;
        border-radius: 10px;
        padding: 10px 12px;
        font: inherit;
        font-size: 14px;
        background: #fff;
      }
      .nuevo input:focus-visible,
      .editar-input:focus-visible {
        outline: none;
        border-color: #f9c900;
        box-shadow: 0 0 0 3px #f9c90033;
      }
      .agregar {
        background: #f28c00;
        color: #111;
        flex: none;
      }
      .agregar mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .lista {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 52vh;
        overflow-y: auto;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 4px;
        border: 1px solid #f6f0e0;
        border-radius: 10px;
        padding: 4px 6px 4px 12px;
        background: #fffdf8;
      }
      .nombre {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ok {
        color: #2c6b1f;
      }
      .borrar {
        color: #b3401f;
      }
      .vacio {
        color: #999;
        font-size: 13px;
        padding: 12px 4px;
      }
      @media (max-width: 520px) {
        .nuevo {
          flex-direction: column;
          align-items: stretch;
        }
        .nuevo .agregar {
          width: 100%;
        }
      }
    `,
  ],
})
export class ObjetivosDialog {
  private store = inject(DataStore);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  objetivos = this.store.objetivos;
  nuevo = '';
  nombreEditado = '';
  editandoId = signal<number | null>(null);
  guardando = signal(false);

  editar(objetivo: Objetivo) {
    this.editandoId.set(objetivo.id);
    this.nombreEditado = objetivo.nombre;
  }

  cancelarEdicion() {
    this.editandoId.set(null);
    this.nombreEditado = '';
  }

  async agregar() {
    const nombre = this.nuevo.trim();
    if (!nombre || this.guardando()) return;

    this.guardando.set(true);
    try {
      await this.store.crearObjetivo(nombre);
      this.nuevo = '';
      this.snack.open('Objetivo agregado', 'OK', { duration: 2000 });
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.guardando.set(false);
    }
  }

  async guardarEdicion(objetivo: Objetivo) {
    const nombre = this.nombreEditado.trim();
    if (!nombre || this.guardando()) return;

    if (nombre !== objetivo.nombre) {
      const ok = confirm(
        `¿Renombrar "${objetivo.nombre}" a "${nombre}"? Se actualizan los pacientes que lo usan.`
      );
      if (!ok) return;
    }

    this.guardando.set(true);
    try {
      await this.store.actualizarObjetivo(objetivo.id, nombre);
      this.cancelarEdicion();
      this.snack.open('Objetivo actualizado', 'OK', { duration: 2000 });
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(objetivo: Objetivo) {
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Desactivar objetivo',
            mensaje: `¿Desactivar "${objetivo.nombre}"?`,
            detalle: 'Los pacientes que ya lo tienen conservan el texto.',
            botonTexto: 'Desactivar',
            icono: 'delete',
            iconoBoton: 'delete',
            peligro: false,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );
    if (!confirmar) return;

    try {
      await this.store.eliminarObjetivo(objetivo.id);
      this.snack.open('Objetivo desactivado', 'OK', { duration: 2000 });
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    }
  }
}
