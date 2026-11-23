import { BadRequestException, type ValidationError } from '@nestjs/common';

// Nombre legible de cada campo para los mensajes de validación en español.
const FIELD_LABELS: Record<string, string> = {
  title: 'El título',
  description: 'La descripción',
  price: 'El precio',
  image_url: 'La foto',
  zone_id: 'La zona',
  zoneId: 'La zona',
  category_id: 'La categoría',
  categoryId: 'La categoría',
  start_time: 'La hora de inicio',
  end_time: 'La hora de fin',
  initial_stock: 'El stock',
  current_stock: 'El stock',
  ganga_min_price: 'El precio mínimo de oferta',
  ganga_activation_mode: 'El tipo de oferta',
  ganga_minutes_before: 'Los minutos de la oferta',
  pickup_mode: 'El modo de entrega',
  pickupMode: 'El modo de entrega',
  condition: 'La condición',
  type: 'El tipo de publicación',
  publicationId: 'La publicación',
  q: 'La búsqueda',
  email: 'El correo',
  phone: 'El teléfono',
  password: 'La contraseña',
  name: 'El nombre',
};

// Mensajes por defecto de class-validator (inglés), p. ej. «title must be a string».
const DEFAULT_ENGLISH = /\b(?:must|should|each value|regular expression)\b/i;

function flatten(errors: ValidationError[], parent = ''): ValidationError[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints ? [{ ...error, property: path }] : [];
    return [...own, ...flatten(error.children ?? [], path)];
  });
}

/**
 * Convierte los errores del ValidationPipe en mensajes en español.
 * Conserva los mensajes propios (ya en español) y sustituye los genéricos en inglés
 * por uno solo por campo, para no mostrar textos técnicos al usuario.
 */
export function spanishValidationErrors(errors: ValidationError[]) {
  const messages = flatten(errors).flatMap(({ property, constraints = {} }) => {
    if (constraints.whitelistValidation) return [`El campo «${property}» no está permitido`];
    const own = Object.values(constraints).filter((message) => !DEFAULT_ENGLISH.test(message));
    if (own.length) return own;
    const label = FIELD_LABELS[property.split('.').pop() ?? property] ?? `El campo «${property}»`;
    return [`Revisa ${label.charAt(0).toLowerCase()}${label.slice(1)}`];
  });
  return new BadRequestException([...new Set(messages)]);
}
