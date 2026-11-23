import api from './api';
import { apiMessage } from './error-messages';
import { API_BASE_URL } from '../constants/api.constants';

export type PublicationType = 'LIVE' | 'STATIC';
export type ProductCondition = 'NEW' | 'USED';
export type PickupMode = 'SPECIFIC_ZONE' | 'ARRANGED';
export type PublicPublication = {
  id: string; type: PublicationType; title: string; description: string;
  condition?: ProductCondition | null;
  price: string; image_url: string; status: 'ACTIVE' | 'FINISHED';
  price_before_ganga?: string | null;
  seller_id: string; seller: { id: string; name: string };
  pickup_mode?: PickupMode;
  zone_id: number | null; category_id: number; current_stock: number | null;
  initial_stock: number | null; start_time: string | null; end_time: string | null;
  is_ganga_active: boolean;
  sellerContact?: { phone: string };
};
export type Publication = PublicPublication;
export type OwnedPublication = PublicPublication & {
  ganga_min_price: string | null;
  ganga_activation_mode: 'MANUAL' | 'SCHEDULED' | null;
  ganga_minutes_before: number | null;
};
export type Reservation = {
  sellerName?: string;
  pickupLocation?: { zoneId: number; name: string; source: 'SNAPSHOT' | 'LEGACY_CURRENT' } | null;
  publicationImageUrl?: string | null;
  id: string; publicationId: string; publicationTitle: string; status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  reservedAt: string; expiresAt: string; resolvedAt: string | null; unitPrice: string;
  sellerContact?: { phone: string }; buyer?: { id: string; name: string };
  buyerContact?: { phone: string };
};
export type Zone = { id: number; name: string };
export type Category = Zone & { type: PublicationType };

function imageForClient(uri: string) {
  try {
    const url = new URL(uri, API_BASE_URL);
    if (/^\/uploads\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(url.pathname)) {
      return new URL(url.pathname, API_BASE_URL).href;
    }
  } catch { /* Las URLs ajenas al almacenamiento del backend se conservan. */ }
  return uri;
}
function publicationForClient<T extends PublicPublication>(publication: T): T {
  return publication.image_url ? { ...publication, image_url: imageForClient(publication.image_url) } : publication;
}
function reservationForClient(reservation: Reservation): Reservation {
  return reservation.publicationImageUrl ? { ...reservation, publicationImageUrl: imageForClient(reservation.publicationImageUrl) } : reservation;
}

export async function listPublications(type: PublicationType, zoneId?: number, categoryId?: number, q?: string, pickupMode?: PickupMode) {
  const { data } = await api.get<Publication[]>('/publications', { params: { type, zoneId, categoryId, pickupMode, ...(q?.trim() ? { q: q.trim().replace(/\s+/g, ' ') } : {}) } });
  return data.map(publicationForClient);
}
export async function publicationDetail(id: string) {
  const { data } = await api.get<Publication>(`/publications/${id}`);
  return publicationForClient(data);
}
export async function myPublications() {
  const { data } = await api.get<OwnedPublication[]>('/publications/mine');
  return data.map(publicationForClient);
}
export async function zones() {
  const { data } = await api.get<Zone[]>('/zones');
  return data;
}
export async function categories(type: PublicationType) {
  const { data } = await api.get<Category[]>('/categories', { params: { type } });
  return data;
}
export async function reserve(publicationId: string, key: string) {
  const { data } = await api.post<Reservation>('/reservations', { publicationId }, { headers: { 'Idempotency-Key': key } });
  return reservationForClient(data);
}
export async function myReservations() {
  const { data } = await api.get<Reservation[]>('/reservations/mine');
  return data.map(reservationForClient);
}
export async function sellerReservations(publicationId: string) {
  const { data } = await api.get<Reservation[]>(`/publications/${publicationId}/reservations`);
  return data.map(reservationForClient);
}
export async function cancelReservation(id: string) {
  const { data } = await api.post<Reservation>(`/reservations/${id}/cancel`, {});
  return reservationForClient(data);
}
export async function completeReservation(id: string) {
  const { data } = await api.post<Reservation>(`/reservations/${id}/complete`, {});
  return reservationForClient(data);
}
export async function publicationAction(id: string, action: 'physical-sale' | 'finish' | 'sold' | 'ganga') {
  const { data } = action === 'ganga'
    ? await api.patch<OwnedPublication>(`/publications/${id}/ganga`, {})
    : await api.post<OwnedPublication>(`/publications/${id}/${action}`, {});
  return publicationForClient(data);
}
export type PublicationPayload = {
  condition?: ProductCondition;
  type: PublicationType; title: string; description: string; price: number;
  image_url: string; zone_id: number | null; category_id: number;
  pickup_mode?: PickupMode;
  initial_stock?: number; current_stock?: number; start_time?: string; end_time?: string;
  ganga_min_price?: number; ganga_activation_mode?: 'MANUAL' | 'SCHEDULED';
  ganga_minutes_before?: number;
};
export type PublicationPatch = Omit<Partial<PublicationPayload>, 'ganga_min_price' | 'ganga_activation_mode' | 'ganga_minutes_before'> & {
  ganga_min_price?: number | null;
  ganga_activation_mode?: 'MANUAL' | 'SCHEDULED' | null;
  ganga_minutes_before?: number | null;
};
export function savePublication(payload: PublicationPayload): Promise<OwnedPublication>;
export function savePublication(payload: PublicationPatch, id: string): Promise<OwnedPublication>;
export async function savePublication(payload: PublicationPayload | PublicationPatch, id?: string) {
  const body = id ? payload : (({ current_stock, ...rest }) => rest)(payload);
  const { data } = id
    ? await api.patch<OwnedPublication>(`/publications/${id}`, body)
    : await api.post<OwnedPublication>('/publications', body);
  return publicationForClient(data);
}
export async function uploadImage(asset: { uri: string; mimeType?: string | null; fileName?: string | null }) {
  const form = new FormData();
  form.append('file', { uri: asset.uri, name: asset.fileName || 'publicacion.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
  const { data } = await api.post<{ image_url: string }>('/uploads', form, { headers: { 'Content-Type': undefined } });
  return data.image_url;
}

export { apiMessage } from './error-messages';

export function publicationContentError(error: unknown): { message: string; fields: ('title' | 'description')[] } | undefined {
  const data = (error as { response?: { data?: { code?: unknown; fields?: unknown } } } | null)?.response?.data;
  if (data?.code !== 'PUBLICATION_CONTENT_BLOCKED' || !Array.isArray(data.fields)) return;
  const fields = [...new Set(data.fields.filter((field): field is 'title' | 'description' => field === 'title' || field === 'description'))];
  if (fields.length) return { message: apiMessage(error), fields };
}
