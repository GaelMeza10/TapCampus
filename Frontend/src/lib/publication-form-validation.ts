import type { OwnedPublication, ProductCondition, PublicationType } from '@/services/marketplace';

export type PublicationDraft = {
  condition?: ProductCondition;
  title: string; description: string; price: string; stock: string;
  start: string; end: string; gangaPrice: string; gangaMinutes: string;
};
export const formFieldOrder = ['photo', 'title', 'description', 'condition', 'category', 'price', 'stock', 'zone', 'start', 'end', 'offer'] as const;
export type PublicationFormField = typeof formFieldOrder[number];
export type PublicationFormErrors = Partial<Record<PublicationFormField, string>>;
export const validPrice = (value: string) =>
  /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= 99999999.99;
export function localInput(date: Date) {
  const part = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}
export function localDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || localInput(date) !== value ? null : date;
}

export function validatePublicationDraft({ draft, type, original, editing, hasPhoto, zoneId, pickupMode, categoryId, gangaMode, now }: {
  draft: PublicationDraft; type: PublicationType; original?: OwnedPublication; editing: boolean;
  hasPhoto: boolean; zoneId?: number; pickupMode?: 'SPECIFIC_ZONE' | 'ARRANGED'; categoryId?: number; gangaMode: 'MANUAL' | 'SCHEDULED'; now: number;
}): PublicationFormErrors {
  const errors: PublicationFormErrors = {};
  if (!hasPhoto) errors.photo = 'Añade una foto del producto.';
  if (!draft.title.trim()) errors.title = 'Escribe un título para identificar el producto.';
  if (!draft.description.trim()) errors.description = 'Describe el producto y agrega una referencia para la entrega.';
  if (!categoryId) errors.category = 'Selecciona una categoría.';
  if (!validPrice(draft.price)) errors.price = 'El precio debe ser positivo y tener hasta dos decimales.';
  if (!(type === 'STATIC' && pickupMode === 'ARRANGED') && !zoneId) errors.zone = 'Selecciona una zona.';
  if (type === 'STATIC') {
    if (draft.condition !== 'NEW' && draft.condition !== 'USED') errors.condition = 'Selecciona si el artículo es nuevo o usado.';
    return errors;
  }
  if (!/^\d+$/.test(draft.stock) || Number(draft.stock) < (editing ? 0 : 1) || Number(draft.stock) > 2147483647) {
    errors.stock = 'El stock debe ser un entero no negativo; al crear debe ser mayor que cero.';
  }
  const start = localDate(draft.start), end = localDate(draft.end);
  if (!start) errors.start = 'Selecciona una fecha y hora de inicio válida.';
  if (!end) errors.end = 'Selecciona una fecha y hora de fin válida.';
  else if (end.getTime() <= now) errors.end = 'La hora de fin debe estar en el futuro.';
  else if (start && end <= start) errors.end = 'La hora de fin debe ser posterior al inicio.';
  const changedOffer = !original || Number(draft.price) !== Number(original.price) ||
    Number(draft.gangaPrice) !== Number(original.ganga_min_price) || gangaMode !== original.ganga_activation_mode ||
    draft.gangaMinutes !== String(original.ganga_minutes_before ?? '');
  const changedSchedule = !original || Number(draft.gangaPrice) !== Number(original.ganga_min_price) ||
    gangaMode !== original.ganga_activation_mode || draft.gangaMinutes !== String(original.ganga_minutes_before ?? '') ||
    draft.start !== (original.start_time ? localInput(new Date(original.start_time)) : '') ||
    draft.end !== (original.end_time ? localInput(new Date(original.end_time)) : '');
  if (draft.gangaPrice && !original?.is_ganga_active) {
    if (changedOffer && (!validPrice(draft.gangaPrice) || errors.price || Number(draft.gangaPrice) >= Number(draft.price))) {
      errors.offer = 'El precio de oferta debe ser positivo y menor que el precio normal.';
    } else if (gangaMode === 'SCHEDULED' && changedSchedule && (!/^\d+$/.test(draft.gangaMinutes) || Number(draft.gangaMinutes) < 1 ||
      Number(draft.gangaMinutes) > 2147483647 || !start || !end || end.getTime() - Number(draft.gangaMinutes) * 60000 <= Math.max(start.getTime(), now))) {
      errors.offer = 'Programa la oferta dentro del horario y en el futuro.';
    }
  }
  return errors;
}
