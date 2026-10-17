import { DestroyRef, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';
import { Cliente, Mascota } from '../models/api.models';
import { CatalogoService } from '../services/catalogo.service';

/** Resultado de {@link crearCombosClienteMascota}: listas para alimentar los selects. */
export interface CombosClienteMascota {
  /** Clientes disponibles. */
  clientes: Signal<Cliente[]>;
  /** Mascotas del cliente actualmente seleccionado. */
  mascotas: Signal<Mascota[]>;
}

/**
 * Conecta los combos dependientes Cliente → Mascota de un formulario.
 * Carga los clientes al iniciar y, cada vez que cambia el cliente, limpia la
 * mascota seleccionada y consulta únicamente las mascotas de ese cliente.
 *
 * @param form formulario con los controles `clienteId` y `mascotaId`.
 * @param catalogo servicio de catálogos.
 * @param destroyRef referencia para cancelar las suscripciones.
 * @returns señales con los clientes y las mascotas del cliente elegido.
 */
export function crearCombosClienteMascota(
  form: FormGroup,
  catalogo: CatalogoService,
  destroyRef: DestroyRef,
): CombosClienteMascota {
  const clientes = signal<Cliente[]>([]);
  const mascotas = signal<Mascota[]>([]);

  catalogo
    .listarClientes()
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe({ next: (lista) => clientes.set(lista) });

  form
    .get('clienteId')!
    .valueChanges.pipe(
      tap(() => {
        form.get('mascotaId')!.reset(null);
        mascotas.set([]);
      }),
      switchMap((id: number | null) =>
        id ? catalogo.listarMascotasDeCliente(id).pipe(catchError(() => of([] as Mascota[]))) : of([] as Mascota[]),
      ),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe((lista) => mascotas.set(lista));

  return { clientes, mascotas };
}
