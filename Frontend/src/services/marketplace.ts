import api from './api';
import { API_BASE_URL } from '../constants/api.constants';

export type PublicationType = 'LIVE' | 'STATIC';
export type Publication = {
  id: string; type: PublicationType; title: string; description: string;
  price: string; image_url: string; status: 'ACTIVE' | 'FINISHED';
  price_before_ganga?: string | null;
  seller_id: string; seller: { id: string; name: string };
  zone_id: number; category_id: number; current_stock: number | null;
  initial_stock: number | null; start_time: string | null; end_time: string | null;
  is_ganga_active: boolean; ganga_min_price: string | null;
  ganga_activation_mode: 'MANUAL' | 'SCHEDULED' | null;
  ganga_minutes_before: number | null;
  sellerContact?: { phone: string };
};
export type Reservation = {
  id: string; publicationId: string; publicationTitle: string; status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  reservedAt: string; expiresAt: string; resolvedAt: string | null; unitPrice: string;
  sellerContact?: { phone: string }; buyer?: { id: string; name: string };
  buyerContact?: { phone: string };
};
export type Zone = { id: number; name: string };
export type Category = Zone & { type: PublicationType };

function publicationForClient(publication: Publication): Publication {
  if (!publication.image_url) return publication;
  try {
    const url = new URL(publication.image_url);
    if (/^\/uploads\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(url.pathname)) {
      return { ...publication, image_url: new URL(url.pathname, API_BASE_URL).href };
    }
  } catch { /* Las URLs ajenas al almacenamiento del backend se conservan. */ }
  return publication;
}

export async function listPublications(type: PublicationType, zoneId?: number, categoryId?: number) {
  const { data } = await api.get<Publication[]>('/publications', { params: { type, zoneId, categoryId } });
  return data.map(publicationForClient);
}
export async function publicationDetail(id: string) {
  const { data } = await api.get<Publication>(`/publications/${id}`);
  return publicationForClient(data);
}
export async function myPublications() {
  const { data } = await api.get<Publication[]>('/publications/mine');
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
  return data;
}
export async function myReservations() {
  const { data } = await api.get<Reservation[]>('/reservations/mine');
  return data;
}
export async function sellerReservations(publicationId: string) {
  const { data } = await api.get<Reservation[]>(`/publications/${publicationId}/reservations`);
  return data;
}
export async function cancelReservation(id: string) {
  const { data } = await api.post<Reservation>(`/reservations/${id}/cancel`, {});
  return data;
}
export async function completeReservation(id: string) {
  const { data } = await api.post<Reservation>(`/reservations/${id}/complete`, {});
  return data;
}
export async function publicationAction(id: string, action: 'physical-sale' | 'finish' | 'sold' | 'ganga') {
  const { data } = action === 'ganga'
    ? await api.patch<Publication>(`/publications/${id}/ganga`, {})
    : await api.post<Publication>(`/publications/${id}/${action}`, {});
  return publicationForClient(data);
}
export type PublicationPayload = {
  type: PublicationType; title: string; description: string; price: number;
  image_url: string; zone_id: number; category_id: number;
  initial_stock?: number; current_stock?: number; start_time?: string; end_time?: string;
  ganga_min_price?: number; ganga_activation_mode?: 'MANUAL' | 'SCHEDULED';
  ganga_minutes_before?: number;
};
export async function savePublication(payload: PublicationPayload | Partial<PublicationPayload>, id?: string) {
  const body = id ? payload : (({ current_stock, ...rest }) => rest)(payload);
  const { data } = id
    ? await api.patch<Publication>(`/publications/${id}`, body)
    : await api.post<Publication>('/publications', body);
  return publicationForClient(data);
}
export async function uploadImage(asset: { uri: string; mimeType?: string | null; fileName?: string | null }) {
  const form = new FormData();
  form.append('file', { uri: asset.uri, name: asset.fileName || 'publicacion.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob);
  const { data } = await api.post<{ image_url: string }>('/uploads', form, { headers: { 'Content-Type': undefined } });
  return data.image_url;
}

export function apiMessage(error: unknown): string {
  const cause = error as { code?: string; response?: { status?: number; data?: { message?: string | string[] } } };
  if (cause.code === 'ECONNABORTED' || cause.code === 'ETIMEDOUT') {
    return 'El servidor tardó demasiado en responder. Revisa tu conexión y vuelve a intentarlo.';
  }
  const message = cause.response?.data?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string') return message;
  if (cause.response?.status === 409) return 'La acción ya no está disponible. Actualiza los datos e inténtalo de nuevo.';
  return 'No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.';
}
