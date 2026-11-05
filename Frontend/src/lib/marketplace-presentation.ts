import type { Publication } from '@/services/marketplace';
import { validTime } from './reservation-presentation';

export function countdown(value: string | null | undefined, now: number) {
  const seconds = Math.max(0, Math.ceil(((validTime(value) ?? now) - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  return hours > 0 ? `${hours} h ${Math.floor(seconds % 3600 / 60)} min` : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
export function money(value: string | number) {
  const price = Number(value);
  return Number.isFinite(price) ? `$${price.toLocaleString('es-MX', { minimumFractionDigits: price % 1 ? 2 : 0, maximumFractionDigits: 2 })}` : 'Precio no disponible';
}
export function saleIsOpen(p: Publication, now: number) {
  return p.status === 'ACTIVE' && (p.type === 'STATIC' || (validTime(p.end_time) ?? 0) > now);
}
export function saleHasStarted(p: Publication, now: number) {
  return !p.start_time || (validTime(p.start_time) ?? Infinity) <= now;
}
