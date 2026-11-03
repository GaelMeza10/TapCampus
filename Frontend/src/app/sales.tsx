import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { COLORS, RADIUS } from '@/theme';
import { apiMessage, completeReservation, myPublications, publicationAction, sellerReservations, type Publication, type Reservation } from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import { canActOnReservation, formatReservationDate, presentReservations, publicationStatusLabel, publicationTypeLabel, reservationDescription, reservationStatusLabel, validTime } from '@/lib/reservation-presentation';

type Sale = { publication: Publication; reservations: Reservation[] };
type Action = { kind: 'complete' | 'physical-sale' | 'finish' | 'sold' | 'ganga'; publicationId: string; reservationId?: string };
export default function Sales() {
  const router = useRouter();
  const { logout } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState<Action>();
  const [now, setNow] = useState(Date.now());
  const refreshedDeadlines = useRef(new Set<string>());
  const refresh = useCallback(async () => {
    try {
      const publications = await myPublications();
      const rows = await Promise.all(publications.map(async publication => ({ publication, reservations: publication.type === 'LIVE' ? await sellerReservations(publication.id) : [] })));
      setSales(rows); setError('');
    } catch (cause) { setError(apiMessage(cause)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let shouldRefresh = false;
    for (const sale of sales) for (const row of sale.reservations) {
      const expires = validTime(row.expiresAt);
      const deadline = `${row.id}:${row.expiresAt}`;
      if (row.status === 'ACTIVE' && expires !== undefined && expires <= now && !refreshedDeadlines.current.has(deadline)) {
        refreshedDeadlines.current.add(deadline);
        shouldRefresh = true;
      }
    }
    if (shouldRefresh) void refresh();
  }, [sales, now, refresh]);
  const selectedSale = sales.find(sale => sale.publication.id === action?.publicationId);
  const selectedReservation = selectedSale && presentReservations(selectedSale.reservations)
    .find(({ reservation }) => reservation.id === action?.reservationId);
  const actionText = action?.kind === 'complete' && selectedReservation
    ? `¿Confirmar la entrega de ${reservationDescription(selectedReservation.reservation, selectedReservation.unitLabel)} para ${selectedReservation.reservation.buyer?.name ?? 'el comprador'} por $${selectedReservation.reservation.unitPrice}?`
    : action && selectedSale ? ({
      'physical-sale': `¿Registrar una venta física de ${selectedSale.publication.title}? Se restará una unidad disponible.`,
      finish: `¿Finalizar la publicación ${selectedSale.publication.title}?`,
      sold: `¿Marcar ${selectedSale.publication.title} como vendida?`,
      ganga: `¿Activar el precio ganga de ${selectedSale.publication.title}?`,
    } as Record<string, string>)[action.kind] : '';
  const actionButtonTitle = action ? ({
    complete: 'Confirmar entrega', 'physical-sale': 'Registrar venta física',
    finish: 'Finalizar publicación', sold: 'Marcar vendida', ganga: 'Activar ganga',
  } as Record<Action['kind'], string>)[action.kind] : 'Confirmar';
  async function run() {
    if (!action || busy) return;
    setBusy(true); setError('');
    try {
      if (action.kind === 'complete' && action.reservationId) {
        const result = await completeReservation(action.reservationId);
        setSales(previous => previous.map(s => ({ ...s, reservations: s.reservations.map(r => r.id === result.id ? result : r) })));
      } else if (action.kind !== 'complete') {
        const result = await publicationAction(action.publicationId, action.kind);
        setSales(previous => previous.map(s => s.publication.id === result.id ? { ...s, publication: result } : s));
      }
      setAction(undefined);
      await refresh();
    } catch (cause) { const message = apiMessage(cause); setAction(undefined); await refresh(); setError(message); }
    finally { setBusy(false); }
  }
  async function contact(phone: string, title: string) {
    try { await openWhatsApp(phone, title, true); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  }
  return <SafeAreaView style={styles.screen}>
    <View style={styles.top}><Pressable onPress={() => router.back()}><Text style={styles.link}>‹ Feed</Text></Pressable><Text style={styles.heading}>Mis Ventas</Text><Pressable onPress={() => void logout()}><Text style={styles.link}>Salir</Text></Pressable></View>
    {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void refresh()}><Text style={styles.link}>Reintentar</Text></Pressable></View> : null}
    {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
    <FlatList data={sales} keyExtractor={item => item.publication.id} contentContainerStyle={styles.list} refreshing={busy} onRefresh={() => void refresh()}
      ListEmptyComponent={!loading ? <Text style={styles.empty}>Aún no tienes publicaciones.</Text> : undefined}
      renderItem={({ item: sale }) => {
        const p = sale.publication;
        const active = p.status === 'ACTIVE' && (p.type === 'STATIC' || !!p.end_time && new Date(p.end_time).getTime() > now);
        return <Card style={styles.card}>
          <Text style={styles.title}>{p.title}</Text>
          <Text style={styles.meta}>{publicationTypeLabel(p.type)} · {publicationStatusLabel(p.status, p.type)} · ${p.price}{p.type === 'LIVE' ? ` · ${p.current_stock} disponibles` : ''}</Text>
          {active ? <>
            <Pressable onPress={() => router.push({ pathname: '/publication/edit', params: { id: p.id } })}><Text style={styles.link}>Editar publicación</Text></Pressable>
            {p.type === 'LIVE' ? <>
              {p.ganga_activation_mode === 'MANUAL' && !p.is_ganga_active ? <Pressable onPress={() => setAction({ kind: 'ganga', publicationId: p.id })}><Text style={styles.link}>Activar ganga manual</Text></Pressable> : null}
              <Pressable onPress={() => setAction({ kind: 'physical-sale', publicationId: p.id })}><Text style={styles.link}>−1 venta física</Text></Pressable>
              <Pressable onPress={() => setAction({ kind: 'finish', publicationId: p.id })}><Text style={styles.danger}>Finalizar publicación</Text></Pressable>
            </> : <Pressable onPress={() => setAction({ kind: 'sold', publicationId: p.id })}><Text style={styles.danger}>Marcar vendido</Text></Pressable>}
          </> : null}
          {p.type === 'LIVE' ? <>
            <Text style={styles.section}>Reservas ({sale.reservations.length})</Text>
            {sale.reservations.length === 0 ? <Text style={styles.meta}>Sin reservas</Text> : presentReservations(sale.reservations).map(({ reservation: r, unitLabel }) => {
              const canConfirm = canActOnReservation(r, now);
              return <View key={r.id} style={styles.reservation}>
                <Text style={styles.reservationTitle}>{r.publicationTitle}{unitLabel ? ` · ${unitLabel}` : ''}</Text>
                <Text style={styles.meta}>Comprador: {r.buyer?.name ?? 'No disponible'}</Text>
                <Text style={styles.meta}>Apartada el {formatReservationDate(r.reservedAt)}</Text>
                <Text style={styles.meta}>Estado: {reservationStatusLabel(r, now)} · Precio fijado: ${r.unitPrice}</Text>
                {canConfirm ? <Text style={styles.meta}>Vence: {formatReservationDate(r.expiresAt)}</Text> : null}
                {r.resolvedAt ? <Text style={styles.meta}>Resuelta el {formatReservationDate(r.resolvedAt)}</Text> : null}
                {canConfirm ? <>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Confirmar entrega de ${reservationDescription(r, unitLabel)} para ${r.buyer?.name ?? 'el comprador'}`} onPress={() => setAction({ kind: 'complete', publicationId: p.id, reservationId: r.id })}><Text style={styles.link}>Confirmar entrega de esta reserva</Text></Pressable>
                  {r.buyerContact?.phone ? <Pressable accessibilityRole="button" accessibilityLabel={`Contactar a ${r.buyer?.name ?? 'el comprador'} por WhatsApp sobre ${reservationDescription(r, unitLabel)}`} onPress={() => void contact(r.buyerContact!.phone, p.title)}><Text style={styles.link}>Contactar comprador por WhatsApp</Text></Pressable> : null}
                </> : null}
              </View>;
            })}
          </> : null}
        </Card>;
      }} />
    <Modal transparent visible={!!action} animationType="fade" onRequestClose={() => setAction(undefined)}><View style={styles.shade}><Card style={styles.modal}>
      <Text style={styles.section}>Confirmar acción</Text><Text style={styles.meta}>{actionText}</Text>
      <PrimaryButton title={actionButtonTitle} loading={busy} onPress={() => void run()} />
      <Pressable onPress={() => setAction(undefined)}><Text style={styles.link}>Volver</Text></Pressable>
    </Card></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  heading: { color: COLORS.textDark, fontSize: 22, fontWeight: '800' }, link: { color: COLORS.primaryDark, fontWeight: '700', paddingVertical: 8 },
  list: { padding: 20, gap: 14, flexGrow: 1 }, card: { padding: 18, gap: 8 }, title: { color: COLORS.textDark, fontSize: 19, fontWeight: '700' },
  meta: { color: COLORS.textMedium }, reservationTitle: { color: COLORS.textDark, fontWeight: '700' }, section: { color: COLORS.textDark, fontSize: 17, fontWeight: '700', marginTop: 8 },
  reservation: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 12, gap: 5 }, danger: { color: COLORS.error, fontWeight: '700', paddingVertical: 8 },
  error: { backgroundColor: COLORS.errorBg, padding: 12, marginHorizontal: 20, borderRadius: RADIUS.md }, errorText: { color: COLORS.error },
  empty: { textAlign: 'center', color: COLORS.textMedium, padding: 30 }, shade: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.overlay },
  modal: { padding: 20, gap: 14 },
});
