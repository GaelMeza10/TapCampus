import type { Reservation } from '@/services/marketplace';

const reservationLabels: Record<Reservation['status'], string> = {
  ACTIVE: 'Activa',
  COMPLETED: 'Entrega confirmada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
};

export function validTime(value: string | null | undefined): number | undefined {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(time) ? time : undefined;
}

export function formatReservationDate(value: string | null | undefined): string {
  const time = validTime(value);
  return time === undefined ? 'Fecha no disponible' : new Date(time).toLocaleString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function canActOnReservation(row: Reservation, now: number): boolean {
  const expires = validTime(row.expiresAt);
  return row.status === 'ACTIVE' && expires !== undefined && expires > now;
}

export function reservationStatusLabel(row: Reservation, now: number): string {
  if (row.status === 'ACTIVE' && !canActOnReservation(row, now) && validTime(row.expiresAt) !== undefined) {
    return 'Plazo terminado; actualizando';
  }
  return reservationLabels[row.status] ?? 'Estado no disponible';
}

export function publicationTypeLabel(type: string): string {
  return ({ LIVE: 'Disponibles ahora', STATIC: 'Catálogo' } as Record<string, string>)[type] ?? 'Tipo no disponible';
}

export function publicationStatusLabel(status: string, type: string): string {
  if (status === 'ACTIVE') return 'Activa';
  if (status === 'FINISHED') return type === 'STATIC' ? 'Vendida' : 'Finalizada';
  if (status === 'HIDDEN_BY_REPORTS') return 'Oculta por reportes';
  return 'Estado no disponible';
}

export type PresentedReservation = { reservation: Reservation; unitLabel: string };

export function presentReservations(rows: Reservation[]): PresentedReservation[] {
  const groups = new Map<string, Reservation[]>();
  for (const row of rows) groups.set(row.publicationId, [...(groups.get(row.publicationId) ?? []), row]);
  const presented = new Map<string, string>();
  for (const group of groups.values()) {
    group.sort((a, b) => (validTime(a.reservedAt) ?? Infinity) - (validTime(b.reservedAt) ?? Infinity) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    group.forEach((row, index) => presented.set(row.id, group.length > 1 ? `Unidad ${index + 1} de ${group.length}` : ''));
  }
  return [...rows].sort((a, b) => a.publicationId.localeCompare(b.publicationId) ||
    (validTime(a.reservedAt) ?? Infinity) - (validTime(b.reservedAt) ?? Infinity) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(reservation => ({ reservation, unitLabel: presented.get(reservation.id) ?? '' }));
}

export function reservationDescription(row: Reservation, unitLabel = ''): string {
  return [row.publicationTitle, unitLabel, `apartada el ${formatReservationDate(row.reservedAt)}`].filter(Boolean).join(' · ');
}
