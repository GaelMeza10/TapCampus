import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS } from '@/theme';
import { apiMessage, cancelReservation, myReservations, publicationDetail, reserve, type Publication, type Reservation } from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import { canActOnReservation, formatReservationDate, presentReservations, reservationDescription, reservationStatusLabel, validTime } from '@/lib/reservation-presentation';

function remaining(expiresAt: string, now: number) {
  const seconds = Math.max(0, Math.ceil(((validTime(expiresAt) ?? now) - now) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

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
  const actionKey = useRef<string | undefined>(undefined);
  const refreshedDeadlines = useRef(new Set<string>());
  const refresh = useCallback(async () => {
    if (!id) return;
    const results = await Promise.allSettled([publicationDetail(id), myReservations()]);
    if (results[0].status === 'fulfilled') setItem(results[0].value);
    else { setItem(undefined); setError(apiMessage(results[0].reason)); }
    if (results[1].status === 'fulfilled') setReservations(results[1].value.filter(r => r.publicationId === id));
    else setError(apiMessage(results[1].reason));
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
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
  const selected = presented.find(({ reservation }) => reservation.id === confirmId);
  async function makeReservation(newAction = false) {
    if (!item || pending) return;
    if (newAction || !actionKey.current) actionKey.current = randomUUID();
    setPending(true); setError('');
    try {
      const result = await reserve(item.id, actionKey.current);
      setSuccessId(result.id);
      setReservations(previous => [result, ...previous.filter(r => r.id !== result.id)]);
      await refresh();
      setError('');
    } catch (cause) {
      const message = apiMessage(cause);
      await refresh();
      setError((cause as { response?: { status?: number } }).response?.status === 409 ? `Sin stock o publicación no disponible. ${message}` : message);
    } finally { setPending(false); }
  }
  async function cancel() {
    if (!confirmId || pending) return;
    setPending(true); setError('');
    try {
      const result = await cancelReservation(confirmId);
      setReservations(previous => previous.map(r => r.id === result.id ? result : r));
      setConfirmId(undefined);
      await refresh();
    } catch (cause) { const message = apiMessage(cause); setConfirmId(undefined); await refresh(); setError(message); }
    finally { setPending(false); }
  }
  async function contact(phone: string, reserved: boolean, product?: string) {
    if (!item && !product) return;
    try { await openWhatsApp(phone, product ?? item!.title, reserved); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  }
  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scroll}>
      <Pressable onPress={() => router.back()}><Text style={styles.link}>‹ Volver</Text></Pressable>
      {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
      {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void refresh()}><Text style={styles.link}>Actualizar</Text></Pressable></View> : null}
      {item ? <>
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}{item.is_ganga_active ? ' · Ganga' : ''}</Text>
        <Text style={styles.body}>{item.description}</Text>
        <Text style={styles.body}>Vendedor: {item.seller.name}</Text>
        {item.type === 'LIVE' ? <>
          <Text style={styles.body}>Disponibles: {item.current_stock}</Text>
          <Text style={styles.body}>Termina: {item.end_time ? formatReservationDate(item.end_time) : '—'}</Text>
          <PrimaryButton title="Apartar una unidad" loading={pending} disabled={!item.current_stock || !!successId} onPress={() => void makeReservation()} />
        </> : item.sellerContact?.phone ? <PrimaryButton title="Contactar por WhatsApp" onPress={() => void contact(item.sellerContact!.phone, false)} /> : null}
      </> : !loading ? <View><Text style={styles.body}>La publicación ya no está disponible en el feed.</Text><Pressable onPress={() => router.push('/reservations')}><Text style={styles.link}>Ver mis reservas</Text></Pressable></View> : null}
      {successId ? <Card style={styles.success}>
        <Text style={styles.successTitle}>Reserva confirmada</Text>
        <Text style={styles.body}>Consulta el precio y plazo de esta reserva abajo.</Text>
        {item?.type === 'LIVE' && !!item.current_stock ? <PrimaryButton title="Apartar otra unidad" loading={pending} onPress={() => { setSuccessId(undefined); void makeReservation(true); }} /> : null}
      </Card> : null}
      {item?.type === 'LIVE' || reservations.length > 0 ? <>
        <Text style={styles.section}>Mis reservas de esta publicación</Text>
        {presented.length === 0 ? <Text style={styles.body}>Todavía no tienes reservas.</Text> : presented.map(({ reservation: r, unitLabel }) => <Card key={r.id} style={styles.reservation}>
          <Text style={styles.reservationId}>{r.publicationTitle}{unitLabel ? ` · ${unitLabel}` : ''}</Text>
          <Text style={styles.body}>Apartada el {formatReservationDate(r.reservedAt)}</Text>
          <Text style={styles.body}>Estado: {reservationStatusLabel(r, now)} · Precio fijado: ${r.unitPrice}</Text>
          {canActOnReservation(r, now) ? <Text style={styles.body}>Vence: {formatReservationDate(r.expiresAt)} · {remaining(r.expiresAt, now)}</Text> : null}
          {r.resolvedAt ? <Text style={styles.body}>Resuelta el {formatReservationDate(r.resolvedAt)}</Text> : null}
          {canActOnReservation(r, now) ? <>
            {r.sellerContact?.phone ? <Pressable accessibilityRole="button" accessibilityLabel={`Contactar por WhatsApp sobre ${reservationDescription(r, unitLabel)}`} onPress={() => void contact(r.sellerContact!.phone, true, r.publicationTitle)}><Text style={styles.link}>Contactar por WhatsApp</Text></Pressable> : null}
            <Pressable accessibilityRole="button" accessibilityLabel={`Cancelar ${reservationDescription(r, unitLabel)}`} onPress={() => setConfirmId(r.id)}><Text style={styles.cancel}>Cancelar esta reserva</Text></Pressable>
          </> : null}
        </Card>)}
      </> : null}
    </ScrollView>
    <Modal transparent visible={!!confirmId} animationType="fade" onRequestClose={() => setConfirmId(undefined)}>
      <View style={styles.modalShade}><Card style={styles.modal}>
        <Text style={styles.section}>Cancelar reserva</Text><Text style={styles.body}>¿Cancelar {selected ? reservationDescription(selected.reservation, selected.unitLabel) : 'esta reserva'}? Se liberará esta unidad.</Text>
        <PrimaryButton title="Sí, cancelar reserva" loading={pending} onPress={() => void cancel()} />
        <Pressable onPress={() => setConfirmId(undefined)}><Text style={styles.link}>Volver</Text></Pressable>
      </Card></View>
    </Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, scroll: { padding: 20, gap: 12 },
  link: { color: COLORS.primaryDark, fontWeight: '700', paddingVertical: 8 }, image: { width: '100%', height: 240, borderRadius: RADIUS.lg, backgroundColor: COLORS.primarySoft },
  title: { color: COLORS.textDark, fontSize: 26, fontWeight: '800' }, price: { color: COLORS.primaryDark, fontSize: 24, fontWeight: '800' },
  body: { color: COLORS.textMedium, fontSize: 15 }, section: { color: COLORS.textDark, fontSize: 19, fontWeight: '700', marginTop: 12 },
  reservation: { padding: 16, gap: 8 }, reservationId: { color: COLORS.textDark, fontWeight: '700' },
  success: { padding: 16, gap: 10 }, successTitle: { color: COLORS.primaryDark, fontSize: 18, fontWeight: '700' },
  error: { backgroundColor: COLORS.errorBg, padding: 12, borderRadius: RADIUS.md }, errorText: { color: COLORS.error },
  cancel: { color: COLORS.error, fontWeight: '700', paddingVertical: 8 },
  modalShade: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.overlay }, modal: { padding: 20, gap: 14 },
});
