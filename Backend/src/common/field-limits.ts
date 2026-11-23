import { ValidateBy, type ValidationOptions } from 'class-validator';

// Límites de longitud compartidos por los DTO. El cliente móvil usa los mismos valores.
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 1000;
export const NAME_MAX = 80;
// bcrypt ignora todo lo que pase de 72 bytes; se rechaza en lugar de truncar en silencio.
export const PASSWORD_MAX_BYTES = 72;

/**
 * Precio con hasta dos decimales.
 * Sustituye a IsNumber({ maxDecimalPlaces: 2 }), que lanza TypeError (500) con valores
 * en notación científica como 1e-7. Aquí nunca se lanza: el valor inválido da 400.
 */
export function IsPrice(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isPrice',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'number' &&
          Number.isFinite(value) &&
          Number(value.toFixed(2)) === value,
      },
    },
    options,
  );
}

export function MaxBytes(max: number, options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'maxBytes',
      constraints: [max],
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= max,
      },
    },
    options,
  );
}
