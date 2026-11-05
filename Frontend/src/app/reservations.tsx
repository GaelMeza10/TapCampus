import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SPACE } from '@/theme';
import { apiMessage, cancelReservation, myReservations, type Reservation } from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import { presentReservations, reservationDescription, validTime } from '@/lib/reservation-presentation';
import { useClock } from '@/hooks/use-clock';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { MarketplaceShell, PageHeader } from '@/components/marketplace-shell';
import { ConfirmationDialog, DataState, InlineMessage } from '@/components/feedback';
import ReservationCard from '@/components/reservation-card';

export default function MyReservations() {
  const router = useRouter();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string>();
  const now = useClock();
  const refreshedDeadlines = useRef(new Set<string>());
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    setRefreshing(true);
    try { const result = await myReservations(); if (request === sequence.current) { setRows(result); setError(''); } }
    catch (cause) { if (request === sequence.current) setError(apiMessage(cause)); }
    finally { if (request === sequence.current) { setLoading(false); setRefreshing(false); } }
  }, []);
  useMarketplaceSync(refresh);
  useEffect(() => () => { sequence.current++; }, []);
  useEffect(() => {
    let shouldRefresh = false;
    for (const row of rows) {
      const expires = validTime(row.expiresAt), key = `${row.id}:${row.expiresAt}`;
      if (row.status === 'ACTIVE' && expires !== undefined && expires <= now && !refreshedDeadlines.current.has(key)) { refreshedDeadlines.current.add(key); shouldRefresh = true; }
    }
    if (shouldRefresh) void refresh();
  }, [rows, now, refresh]);
  const presented = presentReservations(rows);
  const selected = presented.find(({ reservation }) => reservation.id === confirmId);
  async function cancel() {
    if (!confirmId || busy) return;
    setBusy(true);
    try { const result = await cancelReservation(confirmId); setRows(previous => previous.map(row => row.id === result.id ? result : row)); setConfirmId(undefined); await refresh(); }
    catch (cause) { const message = apiMessage(cause); setConfirmId(undefined); await refresh(); setError(message); }
    finally { setBusy(false); }
  }
  async function contact(row: Reservation) {
    if (!row.sellerContact?.phone) return;
    try { await openWhatsApp(row.sellerContact.phone, row.publicationTitle, true); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  }
  return <MarketplaceShell active="reservations">
    <PageHeader title="Mis reservas" subtitle="Cada apartado conserva su precio y plazo" />
    <FlatList data={presented} keyExtractor={({ reservation }) => reservation.id} extraData={now} contentContainerStyle={styles.list} refreshing={refreshing && !loading} onRefresh={() => void refresh()}
      ListHeaderComponent={error && rows.length > 0 ? <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage> : undefined}
      ListEmptyComponent={loading ? <DataState kind="loading" title="Cargando reservas…" /> : error ? <DataState kind="error" title="No pudimos cargar tus reservas" description={error} action="Reintentar" onAction={() => void refresh()} /> : <DataState kind="empty" title="Aún no tienes reservas" description="Explora lo disponible y aparta una unidad para recogerla en 20 minutos." action="Explorar publicaciones" onAction={() => router.navigate('/homePage')} />}
      renderItem={({ item: { reservation, unitLabel } }) => <ReservationCard reservation={reservation} unitLabel={unitLabel} now={now} disabled={busy} onCancel={() => setConfirmId(reservation.id)} onContact={() => void contact(reservation)} />}
    />
    <ConfirmationDialog visible={!!confirmId} title="Cancelar reserva" description={`¿Cancelar ${selected ? reservationDescription(selected.reservation, selected.unitLabel) : 'esta reserva'}? Se liberará esta unidad.`} confirmTitle="Sí, cancelar reserva" busy={busy} variant="destructive" onConfirm={() => void cancel()} onClose={() => setConfirmId(undefined)} />
  </MarketplaceShell>;
}
const styles = StyleSheet.create({ list: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.md, flexGrow: 1 } });
