import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS, SPACE } from '@/theme';
import { Image as ExpoImage } from 'expo-image';
import AppText from '@/components/app-text';
import ReservationCard from '@/components/reservation-card';
import StatusIcon from '@/components/status-icon';
import { ConfirmationDialog, DataState, InlineMessage } from '@/components/feedback';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { countdown, money, saleHasStarted, saleIsOpen } from '@/lib/marketplace-presentation';
import { apiMessage, cancelReservation, myReservations, publicationDetail, reserve, zones, type Zone, type Publication, type Reservation } from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import { canActOnReservation, formatReservationDate, presentReservations, reservationDescription, reservationStatusLabel, validTime } from '@/lib/reservation-presentation';

export default function PublicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Publication>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [confirmId, setConfirmId] = useState<string>();
  const [successId, setSuccessId] = useState<string>();
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [lastConfirmed, setLastConfirmed] = useState<Reservation>();
  const sequence = useRef(0);
  const reservationBusy = useRef(false);
  const actionKey = useRef<string | undefined>(undefined);
  const refreshedDeadlines = useRef(new Set<string>());
  const refresh = useCallback(async () => {
    if (!id) return;
    const request = ++sequence.current;
    const results = await Promise.allSettled([publicationDetail(id), myReservations()]);
    if (request !== sequence.current) return;
    setError('');
    if (results[0].status === 'fulfilled') setItem(results[0].value);
    else {
      if ((results[0].reason as { response?: { status?: number } }).response?.status === 404) setItem(undefined);
      setError(apiMessage(results[0].reason));
    }
    if (results[1].status === 'fulfilled') {
      const rows = results[1].value.filter(r => r.publicationId === id);
      setReservations(rows);
      setLastConfirmed(previous => previous ? rows.find(r => r.id === previous.id) ?? previous : previous);
    } else setError(apiMessage(results[1].reason));
    setLoading(false);
  }, [id]);
  useMarketplaceSync(refresh, false);
  useEffect(() => { setItem(undefined); setReservations([]); setSuccessId(undefined); setLastConfirmed(undefined); actionKey.current = undefined; setLoading(true); void refresh(); return () => { sequence.current++; }; }, [refresh]);
  useEffect(() => { let current = true; void zones().then(rows => { if (current) setZoneOptions(rows); }).catch(() => {}); return () => { current = false; }; }, []);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let shouldRefresh = false;
    for (const row of reservations) {
      const expires = validTime(row.expiresAt);
      const deadline = `${row.id}:${row.expiresAt}`;
      if (row.status === 'ACTIVE' && expires !== undefined && expires <= now && !refreshedDeadlines.current.has(deadline)) {
        refreshedDeadlines.current.add(deadline);
        shouldRefresh = true;
      }
    }
    if (shouldRefresh) void refresh();
  }, [reservations, now, refresh]);
  const presented = presentReservations(reservations);
  const selected = presented.find(({ reservation }) => reservation.id === confirmId) ?? (lastConfirmed && lastConfirmed.id === confirmId ? { reservation: lastConfirmed, unitLabel: '' } : undefined);
  async function makeReservation(newAction = false) {
    if (!item || pending || reservationBusy.current) return;
    reservationBusy.current = true;
    if (newAction) setSuccessId(undefined);
    if (newAction || !actionKey.current) actionKey.current = randomUUID();
    setPending(true); setError('');
    try {
      const result = await reserve(item.id, actionKey.current);
      setSuccessId(result.id); setLastConfirmed(result);
      setReservations(previous => [result, ...previous.filter(r => r.id !== result.id)]);
      await refresh();
      setError('');
    } catch (cause) {
      const message = apiMessage(cause);
      await refresh();
      setError((cause as { response?: { status?: number } }).response?.status === 409 ? `Sin stock o publicación no disponible. ${message}` : message);
    } finally { setPending(false); reservationBusy.current = false; }
  }
  async function cancel() {
    if (!confirmId || pending) return;
    setPending(true); setError('');
    try {
      const result = await cancelReservation(confirmId);
      setReservations(previous => previous.map(r => r.id === result.id ? result : r));
      setConfirmId(undefined);
      setLastConfirmed(previous => previous?.id === result.id ? result : previous);
      await refresh();
    } catch (cause) { const message = apiMessage(cause); setConfirmId(undefined); await refresh(); setError(message); }
    finally { setPending(false); }
  }
  async function contact(phone: string, reserved: boolean, product?: string) {
    if (!item && !product) return;
    try { await openWhatsApp(phone, product ?? item!.title, reserved); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  }

  const confirmed = successId && lastConfirmed?.id === successId ? lastConfirmed : undefined;
  const canReserve = item?.type === 'LIVE' && saleIsOpen(item, now) && saleHasStarted(item, now) && (item.current_stock ?? 0) > 0;
  const zone = item ? zoneOptions.find(z => z.id === item.zone_id)?.name : undefined;
  return <SafeAreaView style={styles.screen}>
    {confirmed ? <ScrollView contentContainerStyle={styles.successScroll}>
      <Pressable accessibilityRole="button" style={styles.back} onPress={() => { setSuccessId(undefined); actionKey.current = undefined; }}><AppText style={styles.link}>‹ Volver al producto</AppText></Pressable>
      <Card style={styles.successCard}>
        <StatusIcon kind={canActOnReservation(confirmed, now) ? 'success' : 'expired'} />
        <AppText variant="title" style={styles.center}>{canActOnReservation(confirmed, now) ? 'Reserva confirmada' : reservationStatusLabel(confirmed, now)}</AppText>
        <AppText variant="caption">{confirmed.publicationTitle}</AppText>
        <View style={styles.timer}><AppText variant="caption">Tu apartado vence en</AppText><AppText variant="price">{countdown(confirmed.expiresAt, now)}</AppText></View>
        <View style={styles.priceRow}><AppText variant="caption">Precio fijado</AppText><AppText variant="price">{money(confirmed.unitPrice)}</AppText></View>
        {zone ? <AppText variant="caption">{zone}</AppText> : null}
        {canActOnReservation(confirmed, now) ? <>
          {confirmed.sellerContact?.phone ? <PrimaryButton title="Contactar por WhatsApp" onPress={() => void contact(confirmed.sellerContact!.phone, true, confirmed.publicationTitle)} /> : null}
          <PrimaryButton variant="danger-ghost" title="Cancelar esta reserva" onPress={() => setConfirmId(confirmed.id)} />
        </> : <AppText variant="caption">Cada reserva conserva su estado y plazo propios.</AppText>}
      </Card>
      {error ? <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage> : null}
      {canReserve ? <PrimaryButton title="Apartar otra unidad" variant="secondary" loading={pending} onPress={() => void makeReservation(true)} /> : null}
      <PrimaryButton title="Ver mis reservas" variant="secondary" onPress={() => router.push('/reservations')} />
    </ScrollView> : <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable accessibilityRole="button" style={styles.back} onPress={() => router.back()}><AppText style={styles.link}>‹ Explorar</AppText></Pressable>
        {loading ? <DataState kind="loading" title="Cargando publicación…" /> : null}
        {error ? <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage> : null}
        {item ? <>
          <ExpoImage source={{ uri: item.image_url }} style={styles.image} contentFit="cover" accessibilityLabel={`Foto de ${item.title}`} />
          <AppText variant="badge" style={item.is_ganga_active && styles.ganga}>{item.type === 'LIVE' ? `${item.is_ganga_active ? 'GANGA' : 'DISPONIBLE AHORA'} · Venta termina en ${countdown(item.end_time, now)}` : 'CATÁLOGO · Sin reserva'}</AppText>
          <AppText variant="title">{item.title}</AppText>
          <View style={styles.priceRow}><View style={styles.prices}>{item.is_ganga_active && item.price_before_ganga && Number(item.price_before_ganga) > Number(item.price) ? <AppText variant="caption" style={styles.previous}>{money(item.price_before_ganga)}</AppText> : null}<AppText variant="price">{money(item.price)}{item.is_ganga_active ? ' · Ganga' : ''}</AppText></View>{item.type === 'LIVE' ? <AppText variant="badge">{item.current_stock} disponibles</AppText> : null}</View>
          <AppText variant="label">{item.type === 'LIVE' ? 'Dónde recogerlo' : 'Dónde se encuentra'}</AppText>
          <AppText variant="caption">{zone ?? 'Consulta el punto de entrega con el vendedor.'}</AppText>
          <AppText variant="label">{item.type === 'LIVE' ? 'Sobre el producto' : 'Descripción'}</AppText>
          <AppText variant="caption">{item.description}</AppText>
          <AppText variant="caption">Vendedor: {item.seller.name}</AppText>
          <View style={styles.info}><AppText variant="label" style={styles.link}>{item.type === 'LIVE' ? 'Apartas 1 unidad durante 20 min' : 'Aquí puedes escribir sin apartar.'}</AppText><AppText variant="caption">{item.type === 'LIVE' ? 'El precio se fija al confirmarse la reserva.' : 'Coordina la entrega directamente por WhatsApp.'}</AppText></View>
        </> : !loading ? <DataState kind="empty" title="Publicación no disponible" description="Ya no se aceptan nuevos apartados. Las reservas vigentes conservan su propio plazo." action="Ver mis reservas" onAction={() => router.push('/reservations')} /> : null}
        {item?.type === 'LIVE' || reservations.length > 0 ? <>
          <AppText variant="heading">Mis reservas de esta publicación</AppText>
          {presented.length === 0 ? <AppText variant="caption">Todavía no tienes reservas.</AppText> : presented.map(({ reservation: r, unitLabel }) => <ReservationCard key={r.id} reservation={r} unitLabel={unitLabel} now={now} combineTitle disabled={pending} onCancel={() => setConfirmId(r.id)} onContact={() => void contact(r.sellerContact!.phone, true, r.publicationTitle)} />)}
        </> : null}
      </ScrollView>
      {item ? <View style={styles.footer}>{item.type === 'LIVE' ? <PrimaryButton title={canReserve ? 'Apartar una unidad' : saleIsOpen(item, now) ? 'Sin stock disponible' : 'Venta finalizada'} loading={pending} disabled={!canReserve} onPress={() => void makeReservation()} /> : item.sellerContact?.phone ? <PrimaryButton title="Contactar por WhatsApp" onPress={() => void contact(item.sellerContact!.phone, false)} /> : null}</View> : null}
    </>}
    <ConfirmationDialog visible={!!confirmId} title="Cancelar reserva" description={`¿Cancelar ${selected ? reservationDescription(selected.reservation, selected.unitLabel) : 'esta reserva'}? Se liberará esta unidad.`} confirmTitle="Sí, cancelar reserva" variant="destructive" busy={pending} onConfirm={() => void cancel()} onClose={() => setConfirmId(undefined)} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, scroll: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.lg },
  back: { minHeight: 44, justifyContent: 'center' }, link: { color: COLORS.primary }, image: { width: '100%', height: 240, borderRadius: RADIUS.lg, backgroundColor: COLORS.primarySoft },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.sm, flexWrap: 'wrap' }, prices: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, flexWrap: 'wrap' },
  previous: { textDecorationLine: 'line-through' }, ganga: { color: COLORS.ganga }, info: { backgroundColor: COLORS.primarySoft, padding: SPACE.lg, borderRadius: RADIUS.md, gap: SPACE.sm },
  footer: { padding: SPACE.page }, successScroll: { padding: SPACE.page, gap: SPACE.lg, flexGrow: 1 },
  successCard: { padding: SPACE.xl, gap: SPACE.lg }, center: { textAlign: 'center' },
  timer: { padding: SPACE.lg, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, gap: SPACE.sm, alignItems: 'center' },
});
