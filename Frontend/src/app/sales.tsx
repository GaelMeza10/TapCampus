import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS, SPACE } from '@/theme';
import AppText from '@/components/app-text';
import ReservationCard from '@/components/reservation-card';
import { ConfirmationDialog, DataState, InlineMessage } from '@/components/feedback';
import { MarketplaceShell, PageHeader, TypeSelector } from '@/components/marketplace-shell';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { money, countdown, saleHasStarted, saleIsOpen } from '@/lib/marketplace-presentation';
import { apiMessage, completeReservation, myPublications, publicationAction, sellerReservations, zones, type Zone, type PublicationType, type Publication, type Reservation } from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import { canActOnReservation, formatReservationDate, presentReservations, reservationDescription, validTime } from '@/lib/reservation-presentation';

type Sale = { publication: Publication; reservations: Reservation[] };
type Action = { kind: 'complete' | 'physical-sale' | 'finish' | 'sold' | 'ganga'; publicationId: string; reservationId?: string };
export default function Sales() {
  const router = useRouter();
  const { type: initialType } = useLocalSearchParams<{ type?: string }>();
  const [saleType, setSaleType] = useState<PublicationType>(initialType === 'STATIC' ? 'STATIC' : 'LIVE');
  const [refreshing, setRefreshing] = useState(false);
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const sequence = useRef(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState<Action>();
  const [now, setNow] = useState(Date.now());
  const refreshedDeadlines = useRef(new Set<string>());
  const refresh = useCallback(async () => {
    const request = ++sequence.current; setRefreshing(true);
    try {
      const publications = await myPublications();
      const rows = await Promise.all(publications.map(async publication => ({ publication, reservations: publication.type === 'LIVE' ? await sellerReservations(publication.id) : [] })));
      if (request === sequence.current) { setSales(rows); setError(''); }
    } catch (cause) { if (request === sequence.current) setError(apiMessage(cause)); }
    finally { if (request === sequence.current) { setLoading(false); setRefreshing(false); } }
  }, []);
  useMarketplaceSync(refresh);
  useEffect(() => () => { sequence.current++; }, []);
  useEffect(() => { let current = true; void zones().then(rows => { if (current) setZoneOptions(rows); }).catch(() => {}); return () => { current = false; }; }, []);
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
      finish: `¿Finalizar la publicación ${selectedSale.publication.title}? No se aceptarán nuevos apartados; las reservas previas conservan su plazo.`,
      sold: `¿Marcar ${selectedSale.publication.title} como vendida?`,
      ganga: `¿Activar el precio ganga de ${selectedSale.publication.title} por ${money(selectedSale.publication.ganga_min_price ?? selectedSale.publication.price)}? Las reservas anteriores conservan su precio.`,
    } as Record<string, string>)[action.kind] : '';
  const actionButtonTitle = action ? ({
    complete: 'Confirmar entrega', 'physical-sale': 'Registrar venta física',
    finish: 'Finalizar publicación', sold: 'Marcar vendida', ganga: 'Activar ganga',
  } as Record<Action['kind'], string>)[action.kind] : 'Confirmar';
  async function run() {
    if (!action || busy) return;
    if (action.kind === 'complete' && (!selectedReservation || !canActOnReservation(selectedReservation.reservation, now))) { setAction(undefined); await refresh(); setError('El plazo de esta reserva terminó. Actualizamos su estado.'); return; }
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

  const visibleSales = sales.filter(sale => sale.publication.type === saleType);
  return <MarketplaceShell active="sales">
    <PageHeader title="Mis ventas" />
    <View style={styles.typeSelector}><TypeSelector value={saleType} liveLabel="Con horario" disabled={busy} onChange={setSaleType} /></View>
    <FlatList data={visibleSales} keyExtractor={item => item.publication.id} contentContainerStyle={styles.list} extraData={now} refreshing={refreshing && !loading} onRefresh={() => void refresh()}
      ListHeaderComponent={error && sales.length > 0 ? <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage> : undefined}
      ListEmptyComponent={loading ? <DataState kind="loading" title="Cargando tus ventas…" /> : error ? <DataState kind="error" title="No pudimos cargar tus ventas" description={error} action="Reintentar" onAction={() => void refresh()} /> : <DataState kind="empty" title="Aún no tienes publicaciones" description={saleType === 'LIVE' ? 'Publica lo que tienes disponible y recibe apartados.' : 'Publica un artículo y coordina la entrega por WhatsApp.'} />}
      ListFooterComponent={<View style={styles.footer}><PrimaryButton title={saleType === 'LIVE' ? '+ Nueva publicación' : '+ Publicar otro artículo'} variant="secondary" disabled={busy} onPress={() => router.push({ pathname: '/publication/edit', params: { type: saleType } })} /></View>}
      renderItem={({ item: sale }) => {
        const p = sale.publication;
        const active = saleIsOpen(p, now);
        const started = saleHasStarted(p, now);
        const rows = presentReservations(sale.reservations);
        const pendingRows = rows.filter(({ reservation }) => canActOnReservation(reservation, now)).sort((a, b) => (validTime(a.reservation.expiresAt) ?? Infinity) - (validTime(b.reservation.expiresAt) ?? Infinity));
        const historyRows = rows.filter(({ reservation }) => !canActOnReservation(reservation, now));
        return <View style={styles.sale}>
          <Card style={styles.card}>
            <AppText variant="badge">{p.type === 'LIVE' ? 'VENTA CON HORARIO' : 'CATÁLOGO'} · {active ? p.is_ganga_active ? 'GANGA ACTIVA' : 'ACTIVA' : p.type === 'STATIC' ? 'VENDIDO' : 'FINALIZADA'}</AppText>
            <AppText variant="heading">{p.title}</AppText>
            {p.type === 'STATIC' || p.is_ganga_active || !active ? <View style={styles.priceRow}>{p.is_ganga_active && p.price_before_ganga && Number(p.price_before_ganga) > Number(p.price) ? <AppText variant="caption" style={styles.previous}>{money(p.price_before_ganga)}</AppText> : null}<AppText variant={p.type === 'STATIC' || p.is_ganga_active ? 'price' : 'label'}>{money(p.price)}{p.is_ganga_active ? ' · Ganga' : ''}</AppText></View> : null}
            {p.type === 'LIVE' ? <AppText variant="caption">{active ? `${!p.is_ganga_active ? `${money(p.price)} · ` : ''}${p.current_stock} disponibles · ${started ? `Termina ${new Date(p.end_time!).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })}` : `Inicia ${formatReservationDate(p.start_time)}`}` : 'Venta cerrada · sin nuevos apartados'}</AppText> : <><AppText variant="caption">{zoneOptions.find(z => z.id === p.zone_id)?.name}</AppText><AppText variant="caption">{p.description}</AppText></>}
            {active ? <>
              {p.type === 'LIVE' ? <View style={styles.row}>
                <PrimaryButton compact variant="secondary" title="−1 venta física" style={styles.flex} disabled={busy || !started || !p.current_stock} onPress={() => setAction({ kind: 'physical-sale', publicationId: p.id })} />
                {p.ganga_activation_mode === 'MANUAL' && p.ganga_min_price && !p.is_ganga_active ? <PrimaryButton compact variant="secondary" title={`Activar Ganga · ${money(p.ganga_min_price)}`} disabled={busy || !started} style={styles.flex} onPress={() => setAction({ kind: 'ganga', publicationId: p.id })} /> : p.is_ganga_active ? <AppText variant="badge" style={styles.ganga}>Ganga activa</AppText> : p.ganga_activation_mode === 'SCHEDULED' ? <AppText variant="caption" style={styles.flex}>Ganga programada · {p.ganga_minutes_before} min antes del fin</AppText> : null}
              </View> : <View style={styles.info}><AppText variant="label" style={styles.link}>Sin apartados ni plazo de venta</AppText><AppText variant="caption">Coordina la entrega por WhatsApp y marca el artículo como vendido al terminar.</AppText></View>}
              <View style={styles.row}><PrimaryButton compact style={styles.flex} title={p.type === 'LIVE' ? 'Editar' : 'Editar publicación'} accessibilityLabel="Editar publicación" variant="secondary" disabled={busy} onPress={() => router.push({ pathname: '/publication/edit', params: { id: p.id } })} /><PrimaryButton compact style={styles.flex} title={p.type === 'LIVE' ? 'Finalizar' : 'Marcar vendido'} accessibilityLabel={p.type === 'LIVE' ? 'Finalizar publicación' : 'Marcar vendido'} variant="destructive" disabled={busy} onPress={() => setAction({ kind: p.type === 'LIVE' ? 'finish' : 'sold', publicationId: p.id })} /></View>
            </> : <AppText variant="caption">{p.type === 'LIVE' ? 'Puedes entregar las reservas que sigan vigentes.' : 'Ya no aparece en el catálogo activo.'}</AppText>}
          </Card>
          {p.type === 'LIVE' ? <>
            <AppText variant="heading">Reservas por entregar · {pendingRows.length}</AppText>
            {pendingRows.length === 0 ? <AppText variant="caption">No quedan entregas pendientes.</AppText> : pendingRows.map(({ reservation, unitLabel }) => <ReservationCard key={reservation.id} reservation={reservation} unitLabel={unitLabel} now={now} seller combineTitle disabled={busy} onConfirm={() => setAction({ kind: 'complete', publicationId: p.id, reservationId: reservation.id })} onContact={() => void contact(reservation.buyerContact!.phone, p.title)} />)}
            {historyRows.length > 0 ? <><AppText variant="label">Historial</AppText>{historyRows.map(({ reservation, unitLabel }) => <ReservationCard key={reservation.id} reservation={reservation} unitLabel={unitLabel} now={now} seller combineTitle />)}</> : null}
          </> : null}
        </View>;
      }} />
    <ConfirmationDialog visible={!!action} title={action?.kind === 'complete' ? 'Confirmar entrega' : actionButtonTitle} description={actionText} confirmTitle={actionButtonTitle} busy={busy} variant={action?.kind === 'finish' || action?.kind === 'sold' ? 'destructive' : action?.kind === 'ganga' ? 'warning' : 'primary'} onConfirm={() => void run()} onClose={() => setAction(undefined)} />
  </MarketplaceShell>;
}
const styles = StyleSheet.create({
  typeSelector: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.sm },
  list: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.xl, flexGrow: 1 }, sale: { gap: SPACE.md }, card: { padding: SPACE.lg, gap: SPACE.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md }, previous: { textDecorationLine: 'line-through' }, row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  flex: { flex: 1 }, ganga: { color: COLORS.ganga }, link: { color: COLORS.primary }, info: { padding: SPACE.md, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, gap: SPACE.sm }, footer: { paddingTop: SPACE.xl, gap: SPACE.md },
});
