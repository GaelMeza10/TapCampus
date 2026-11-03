import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS } from '@/theme';
import { apiMessage, cancelReservation, myReservations, type Reservation } from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import { canActOnReservation, formatReservationDate, presentReservations, reservationDescription, reservationStatusLabel, validTime } from '@/lib/reservation-presentation';

export default function MyReservations() {
  const router = useRouter();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string>();
  const [now, setNow] = useState(Date.now());
  const refreshedDeadlines = useRef(new Set<string>());
  const refresh = useCallback(async () => {
    try { setRows(await myReservations()); setError(''); }
    catch (cause) { setError(apiMessage(cause)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    let shouldRefresh = false;
    for (const row of rows) {
      const expires = validTime(row.expiresAt);
      const deadline = `${row.id}:${row.expiresAt}`;
      if (row.status === 'ACTIVE' && expires !== undefined && expires <= now && !refreshedDeadlines.current.has(deadline)) {
        refreshedDeadlines.current.add(deadline);
        shouldRefresh = true;
      }
    }
    if (shouldRefresh) void refresh();
  }, [rows, now, refresh]);
  const presented = presentReservations(rows);
  const selected = presented.find(({ reservation }) => reservation.id === confirmId);
  async function cancel() {
    if (!confirmId || busy) return;
    setBusy(true);
    try { const result = await cancelReservation(confirmId); setRows(previous => previous.map(row => row.id === result.id ? result : row)); await refresh(); }
    catch (cause) { const message = apiMessage(cause); await refresh(); setError(message); }
    finally { setConfirmId(undefined); setBusy(false); }
  }
  async function contact(row: Reservation) {
    if (!row.sellerContact?.phone) return;
    try { await openWhatsApp(row.sellerContact.phone, row.publicationTitle, true); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  }
  return <SafeAreaView style={styles.screen}>
    <View style={styles.top}><Pressable onPress={() => router.back()}><Text style={styles.link}>‹ Feed</Text></Pressable><Text style={styles.title}>Mis reservas</Text></View>
    {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void refresh()}><Text style={styles.link}>Reintentar</Text></Pressable></View> : null}
    {loading ? <ActivityIndicator color={COLORS.primary} /> : null}
    <FlatList data={presented} keyExtractor={({ reservation }) => reservation.id} contentContainerStyle={styles.list} refreshing={busy} onRefresh={() => void refresh()}
      ListEmptyComponent={!loading ? <Text style={styles.empty}>Aún no tienes reservas.</Text> : undefined}
      renderItem={({ item: { reservation: item, unitLabel } }) => {
        const active = canActOnReservation(item, now);
        return <Card style={styles.card}>
          <Text style={styles.name}>{item.publicationTitle}</Text>
          {unitLabel ? <Text style={styles.unit}>{unitLabel}</Text> : null}
          <Text style={styles.body}>Apartada el {formatReservationDate(item.reservedAt)}</Text>
          <Text style={styles.body}>Estado: {reservationStatusLabel(item, now)} · Precio fijado: ${item.unitPrice}</Text>
          {active ? <Text style={styles.body}>Vence: {formatReservationDate(item.expiresAt)}</Text> : null}
          {item.resolvedAt ? <Text style={styles.body}>Resuelta el {formatReservationDate(item.resolvedAt)}</Text> : null}
          {active ? <>
            {item.sellerContact?.phone ? <Pressable accessibilityRole="button" accessibilityLabel={`Contactar por WhatsApp sobre ${reservationDescription(item, unitLabel)}`} onPress={() => void contact(item)}><Text style={styles.link}>Contactar por WhatsApp</Text></Pressable> : null}
            <Pressable accessibilityRole="button" accessibilityLabel={`Cancelar ${reservationDescription(item, unitLabel)}`} onPress={() => setConfirmId(item.id)}><Text style={styles.danger}>Cancelar esta reserva</Text></Pressable>
          </> : null}
        </Card>;
      }} />
    <Modal transparent visible={!!confirmId} animationType="fade" onRequestClose={() => setConfirmId(undefined)}><View style={styles.shade}><Card style={styles.modal}>
      <Text style={styles.name}>Cancelar reserva</Text><Text style={styles.body}>¿Cancelar {selected ? reservationDescription(selected.reservation, selected.unitLabel) : 'esta reserva'}? Se liberará esta unidad.</Text>
      <PrimaryButton title="Sí, cancelar reserva" loading={busy} onPress={() => void cancel()} />
      <Pressable onPress={() => setConfirmId(undefined)}><Text style={styles.link}>Volver</Text></Pressable>
    </Card></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, top: { flexDirection: 'row', alignItems: 'center', gap: 20, padding: 20 },
  title: { color: COLORS.textDark, fontSize: 22, fontWeight: '800' }, link: { color: COLORS.primaryDark, fontWeight: '700', paddingVertical: 8 },
  list: { padding: 20, gap: 12, flexGrow: 1 }, card: { padding: 18, gap: 8 }, name: { color: COLORS.textDark, fontSize: 18, fontWeight: '700' },
  unit: { color: COLORS.textDark, fontWeight: '700' }, body: { color: COLORS.textMedium }, danger: { color: COLORS.error, fontWeight: '700', paddingVertical: 8 },
  error: { backgroundColor: COLORS.errorBg, marginHorizontal: 20, padding: 12, borderRadius: RADIUS.md }, errorText: { color: COLORS.error }, empty: { textAlign: 'center', color: COLORS.textMedium, padding: 30 },
  shade: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.overlay }, modal: { padding: 20, gap: 14 },
});
