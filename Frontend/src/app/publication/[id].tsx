import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import Card from '@/components/Card';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS, SPACE } from '@/theme';
import PublicationPhoto from '@/components/publication-photo';
import PublicationPrice, { GangaBadge } from '@/components/publication-price';
import AppText from '@/components/app-text';
import ReservationCard from '@/components/reservation-card';
import StatusIcon from '@/components/status-icon';
import { ConfirmationDialog, DataState, InlineMessage } from '@/components/feedback';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { countdown, money, saleHasStarted, saleIsOpen } from '@/lib/marketplace-presentation';
import {
  apiMessage,
  cancelReservation,
  myReservations,
  publicationDetail,
  reserve,
  zones,
  type Zone,
  type Publication,
  type Reservation,
} from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import {
  canActOnReservation,
  formatReservationDate,
  presentReservations,
  reservationDescription,
  reservationStatusLabel,
  validTime,
} from '@/lib/reservation-presentation';

type ReservationIntent = {
  publicationId: string;
  title: string;
  price: string;
  key?: string;
  rejected?: boolean;
};

export default function PublicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Publication>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [contactError, setContactError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [confirmId, setConfirmId] = useState<string>();
  const [successId, setSuccessId] = useState<string>();
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [lastConfirmed, setLastConfirmed] = useState<Reservation>();
  const sequence = useRef(0);
  const reservationBusy = useRef(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [intent, setIntent] = useState<ReservationIntent>();
  const [reservationError, setReservationError] = useState('');
  const intentRef = useRef<ReservationIntent | undefined>(undefined);
  const reserveTrigger = useRef<ComponentRef<typeof Pressable>>(null);
  const routeEpoch = useRef(0);
  const refreshedDeadlines = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    if (!id) return;
    const request = ++sequence.current;
    const results = await Promise.allSettled([publicationDetail(id), myReservations()]);
    if (request !== sequence.current) return;
    setError('');
    if (results[0].status === 'fulfilled') setItem(results[0].value);
    else {
      if ((results[0].reason as { response?: { status?: number } }).response?.status === 404) {
        setItem(undefined);
        setContactError('');
      }
      setError(apiMessage(results[0].reason));
    }
    if (results[1].status === 'fulfilled') {
      const rows = results[1].value.filter(r => r.publicationId === id);
      setReservations(rows);
      setLastConfirmed(previous =>
        previous ? (rows.find(r => r.id === previous.id) ?? previous) : previous,
      );
    } else setError(apiMessage(results[1].reason));
    setLoading(false);
  }, [id]);

  // Cada aviso del socket reconsulta el producto y mis reservas para actualizar stock y precio.
  // false deja la carga inicial al efecto de ruta siguiente; connect también reconsulta.
  useMarketplaceSync(refresh, false);

  useEffect(() => {
    routeEpoch.current++;
    setItem(undefined);
    setReservations([]);
    setSuccessId(undefined);
    setLastConfirmed(undefined);
    intentRef.current = undefined;
    setIntent(undefined);
    setReservationOpen(false);
    setReservationError('');
    setContactError('');
    reservationBusy.current = false;
    setPending(false);
    setLoading(true);
    void refresh();
    return () => {
      sequence.current++;
      routeEpoch.current++;
    };
  }, [refresh]);

  useEffect(() => {
    let current = true;
    void zones()
      .then(rows => {
        if (current) setZoneOptions(rows);
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reconsulta al vencer una reserva sin depender de que llegue un evento de stock.
  useEffect(() => {
    let shouldRefresh = false;
    for (const row of reservations) {
      const expires = validTime(row.expiresAt);
      const deadline = `${row.id}:${row.expiresAt}`;
      if (
        row.status === 'ACTIVE' &&
        expires !== undefined &&
        expires <= now &&
        !refreshedDeadlines.current.has(deadline)
      ) {
        refreshedDeadlines.current.add(deadline);
        shouldRefresh = true;
      }
    }
    if (shouldRefresh) void refresh();
  }, [reservations, now, refresh]);

  const presented = presentReservations(reservations);
  const selected =
    presented.find(({ reservation }) => reservation.id === confirmId) ??
    (lastConfirmed && lastConfirmed.id === confirmId
      ? { reservation: lastConfirmed, unitLabel: '' }
      : undefined);
  const canReserve =
    item?.type === 'LIVE' &&
    saleIsOpen(item, now) &&
    saleHasStarted(item, now) &&
    (item.current_stock ?? 0) > 0;
  const canConsultSeller = !!item?.sellerContact?.phone &&
    saleIsOpen(item, now) && (item.type === 'STATIC' || canReserve);
  const unresolved = !!intent?.key && !intent.rejected;
  const priceChanged =
    !!intent && !intent.key && !!item && Number(intent.price) !== Number(item.price);
  const reservationBlocked = !!intent?.rejected || (!unresolved && !canReserve);

  function updateIntent(next: ReservationIntent | undefined) {
    intentRef.current = next;
    setIntent(next);
  }

  function openReservation() {
    if (pending || reservationBusy.current) return;
    if (!intentRef.current?.key || intentRef.current.rejected) {
      if (!canReserve || !item) return;
      updateIntent({ publicationId: item.id, title: item.title, price: item.price });
      setReservationError('');
    }
    setReservationOpen(true);
  }

  function closeReservation() {
    if (pending || reservationBusy.current) return;
    setReservationOpen(false);
    if (!intentRef.current?.key || intentRef.current.rejected) updateIntent(undefined);
  }

  async function makeReservation() {
    const current = intentRef.current;
    if (
      !current ||
      current.publicationId !== id ||
      current.rejected ||
      pending ||
      reservationBusy.current
    )
      return;
    if (!current.key) {
      if (
        !item ||
        item.type !== 'LIVE' ||
        !saleIsOpen(item, Date.now()) ||
        !saleHasStarted(item, Date.now()) ||
        (item.current_stock ?? 0) <= 0
      ) {
        setReservationError('Ya no se pueden apartar unidades de esta publicación.');
        return;
      }
      if (Number(current.price) !== Number(item.price)) {
        updateIntent({ ...current, price: item.price });
        setReservationError('El precio cambió. Revisa el precio actualizado y confirma de nuevo.');
        return;
      }
    }
    reservationBusy.current = true;
    const attempt = { ...current, key: current.key ?? randomUUID() };
    updateIntent(attempt);
    const epoch = routeEpoch.current;
    setPending(true);
    setError('');
    setReservationError('');
    try {
      const result = await reserve(attempt.publicationId, attempt.key);
      if (epoch !== routeEpoch.current) return;
      setSuccessId(result.id);
      setLastConfirmed(result);
      setReservations(previous => [result, ...previous.filter(r => r.id !== result.id)]);
      updateIntent(undefined);
      setReservationOpen(false);
      await refresh();
      if (epoch === routeEpoch.current) setError('');
    } catch (cause) {
      if (epoch !== routeEpoch.current) return;
      const rejected = (cause as { response?: { status?: number } }).response?.status === 409;
      if (rejected) updateIntent({ ...attempt, rejected: true });
      setReservationError(
        rejected
          ? `Sin stock o publicación no disponible. ${apiMessage(cause)}`
          : apiMessage(cause),
      );
      await refresh();
    } finally {
      if (epoch === routeEpoch.current) {
        setPending(false);
        reservationBusy.current = false;
      }
    }
  }

  async function cancel() {
    if (!confirmId || pending) return;
    setPending(true);
    setError('');
    try {
      const result = await cancelReservation(confirmId);
      setReservations(previous => previous.map(r => (r.id === result.id ? result : r)));
      setConfirmId(undefined);
      setLastConfirmed(previous => (previous?.id === result.id ? result : previous));
      await refresh();
    } catch (cause) {
      const message = apiMessage(cause);
      setConfirmId(undefined);
      await refresh();
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function contact(phone: string, reserved: boolean, product?: string) {
    if (pending || reservationBusy.current || reservationOpen || confirmId) return;
    if (!item && !product) return;
    if (!reserved && (!item || !saleIsOpen(item, Date.now()) ||
      (item.type === 'LIVE' && (!saleHasStarted(item, Date.now()) || (item.current_stock ?? 0) <= 0)))) return;
    try {
      await openWhatsApp(phone, product ?? item!.title, reserved);
      setContactError('');
    } catch (cause) {
      setContactError((cause as Error).message);
    }
  }

  const confirmed = successId && lastConfirmed?.id === successId ? lastConfirmed : undefined;
  const zone = item ? zoneOptions.find(z => z.id === item.zone_id)?.name : undefined;

  return (
    <SafeAreaView style={styles.screen}>
      <View
        style={styles.fill}
        accessibilityElementsHidden={reservationOpen || !!confirmId}
        importantForAccessibility={reservationOpen || confirmId ? 'no-hide-descendants' : 'auto'}
      >
        {confirmed ? (
          <ScrollView contentContainerStyle={styles.successScroll}>
            <Pressable
              accessibilityRole="button"
              style={styles.back}
              disabled={pending}
              onPress={() => setSuccessId(undefined)}
            >
              <AppText style={styles.link}>‹ Volver al producto</AppText>
            </Pressable>
            <Card style={styles.successCard}>
              <StatusIcon kind={canActOnReservation(confirmed, now) ? 'success' : 'expired'} />
              <AppText
                variant="title"
                style={styles.center}
              >
                {canActOnReservation(confirmed, now)
                  ? 'Reserva confirmada'
                  : reservationStatusLabel(confirmed, now)}
              </AppText>
              <AppText variant="caption">{confirmed.publicationTitle}</AppText>
              <View style={styles.timer}>
                <AppText variant="caption">Tu apartado vence en</AppText>
                <AppText variant="price">{countdown(confirmed.expiresAt, now)}</AppText>
              </View>
              <View style={styles.priceRow}>
                <AppText variant="caption">Precio fijado</AppText>
                <AppText variant="price">{money(confirmed.unitPrice)}</AppText>
              </View>
              {zone ? <AppText variant="caption">{zone}</AppText> : null}
              {canActOnReservation(confirmed, now) ? (
                <>
                  {confirmed.sellerContact?.phone ? (
                    <PrimaryButton
                      title="Contactar por WhatsApp"
                      disabled={pending}
                      onPress={() =>
                        void contact(
                          confirmed.sellerContact!.phone,
                          true,
                          confirmed.publicationTitle,
                        )
                      }
                    />
                  ) : null}
                  <PrimaryButton
                    variant="danger-ghost"
                    title="Cancelar esta reserva"
                    disabled={pending}
                    onPress={() => setConfirmId(confirmed.id)}
                  />
                </>
              ) : (
                <AppText variant="caption">
                  Cada reserva conserva su estado y plazo propios.
                </AppText>
              )}
            </Card>
            {error ? <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage> : null}
            {contactError ? <InlineMessage>{contactError}</InlineMessage> : null}
            {canReserve || unresolved ? (
              <PrimaryButton
                ref={reserveTrigger}
                title={unresolved ? 'Reintentar apartado' : 'Apartar otra unidad'}
                variant="secondary"
                loading={pending}
                onPress={openReservation}
              />
            ) : null}
            <PrimaryButton
              title="Ver mis reservas"
              variant="secondary"
              onPress={() => router.dismissTo('/reservations')}
            />
          </ScrollView>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Pressable
                accessibilityRole="button"
                style={styles.back}
                onPress={() => router.back()}
              >
                <AppText style={styles.link}>‹ Explorar</AppText>
              </Pressable>
              {loading ? (
                <DataState
                  kind="loading"
                  title="Cargando publicación…"
                />
              ) : null}
              {error ? <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage> : null}
              {contactError ? <InlineMessage>{contactError}</InlineMessage> : null}
              {item ? (
                <>
                  <PublicationPhoto
                    uri={item.image_url}
                    title={item.title}
                    style={styles.image}
                  />
                  {item.is_ganga_active ? <GangaBadge /> : null}
                  <AppText variant="badge">
                    {item.type === 'LIVE'
                      ? `${item.is_ganga_active ? 'Venta termina en' : 'DISPONIBLE AHORA · Venta termina en'} ${countdown(item.end_time, now)}`
                      : 'CATÁLOGO · Sin reserva'}
                  </AppText>
                  <AppText variant="title">{item.title}</AppText>
                  <View style={[styles.detailPrices, item.is_ganga_active && styles.gangaPanel]}>
                    <PublicationPrice item={item} />
                    {item.type === 'LIVE' ? (
                      <AppText variant="badge">{item.current_stock} disponibles</AppText>
                    ) : null}
                  </View>
                  <AppText variant="label">
                    {item.type === 'LIVE' ? 'Dónde recogerlo' : 'Dónde se encuentra'}
                  </AppText>
                  <AppText variant="caption">
                    {zone ?? 'Consulta el punto de entrega con el vendedor.'}
                  </AppText>
                  <AppText variant="label">
                    {item.type === 'LIVE' ? 'Sobre el producto' : 'Descripción'}
                  </AppText>
                  <AppText variant="caption">{item.description}</AppText>
                  <AppText variant="caption">Vendedor: {item.seller.name}</AppText>
                  <View style={styles.info}>
                    <AppText
                      variant="label"
                      style={styles.link}
                    >
                      {item.type === 'LIVE'
                        ? 'Apartas 1 unidad durante 20 min'
                        : 'Aquí puedes escribir sin apartar.'}
                    </AppText>
                    <AppText variant="caption">
                      {item.type === 'LIVE'
                        ? 'El precio se fija al confirmarse la reserva.'
                        : 'Coordina la entrega directamente por WhatsApp.'}
                    </AppText>
                  </View>
                </>
              ) : !loading ? (
                <DataState
                  kind="empty"
                  title="Publicación no disponible"
                  description="Ya no se aceptan nuevos apartados. Las reservas vigentes conservan su propio plazo."
                  action="Ver mis reservas"
                  onAction={() => router.dismissTo('/reservations')}
                />
              ) : null}
              {item?.type === 'LIVE' || reservations.length > 0 ? (
                <>
                  <AppText variant="heading">Mis reservas de esta publicación</AppText>
                  {presented.length === 0 ? (
                    <AppText variant="caption">Todavía no tienes reservas.</AppText>
                  ) : (
                    presented.map(({ reservation: r, unitLabel }) => (
                      <ReservationCard
                        key={r.id}
                        reservation={r}
                        unitLabel={unitLabel}
                        now={now}
                        combineTitle
                        disabled={pending}
                        onCancel={() => setConfirmId(r.id)}
                        onContact={() =>
                          void contact(r.sellerContact!.phone, true, r.publicationTitle)
                        }
                      />
                    ))
                  )}
                </>
              ) : null}
            </ScrollView>
            {item || unresolved ? (
              <View style={styles.footer}>
                {item?.type === 'LIVE' || unresolved ? (
                  <PrimaryButton
                    ref={reserveTrigger}
                    title={
                      unresolved
                        ? 'Reintentar apartado'
                        : canReserve
                          ? 'Apartar una unidad'
                          : item && saleIsOpen(item, now)
                            ? 'Sin stock disponible'
                            : 'Venta finalizada'
                    }
                    loading={pending}
                    disabled={!canReserve && !unresolved}
                    onPress={openReservation}
                  />
                ) : null}
                {canConsultSeller && item?.sellerContact?.phone ? (
                  <PrimaryButton
                    title="Contactar por WhatsApp"
                    variant={item.type === 'LIVE' ? 'secondary' : 'primary'}
                    disabled={pending || reservationOpen || !!confirmId}
                    onPress={() => void contact(item.sellerContact!.phone, false, item.title)}
                  />
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </View>
      <ConfirmationDialog
        visible={reservationOpen}
        title="¿Quieres apartar una unidad?"
        description={
          intent
            ? `${intent.title}\n1 unidad · Precio actual: ${money(!intent.key && item ? item.price : intent.price)}\n\nTendrás 20 minutos para recogerla. El precio se fija al confirmarse la reserva.`
            : ''
        }
        confirmTitle={
          unresolved ? 'Reintentar apartado' : priceChanged ? 'Revisar nuevo precio' : 'Sí, apartar'
        }
        loadingTitle="Apartando…"
        confirmDisabled={reservationBlocked}
        busy={pending}
        error={
          reservationError ||
          (reservationBlocked
            ? 'Ya no se pueden apartar unidades de esta publicación.'
            : priceChanged
              ? 'El precio cambió. Revisa el precio actualizado antes de confirmar.'
              : undefined)
        }
        returnFocusRef={reserveTrigger}
        onConfirm={() => void makeReservation()}
        onClose={closeReservation}
      />
      <ConfirmationDialog
        visible={!!confirmId}
        title="Cancelar reserva"
        description={`¿Cancelar ${selected ? reservationDescription(selected.reservation, selected.unitLabel) : 'esta reserva'}? Se liberará esta unidad.`}
        confirmTitle="Sí, cancelar reserva"
        variant="destructive"
        busy={pending}
        onConfirm={() => void cancel()}
        onClose={() => setConfirmId(undefined)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.lg },
  back: { minHeight: 44, justifyContent: 'center' },
  link: { color: COLORS.primary },
  image: {
    width: '100%',
    height: 221,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primarySoft,
  },
  detailPrices: { gap: SPACE.sm },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACE.sm,
    flexWrap: 'wrap',
  },
  gangaPanel: { backgroundColor: COLORS.gangaSoft, padding: SPACE.lg, borderRadius: RADIUS.md },
  info: {
    backgroundColor: COLORS.primarySoft,
    padding: SPACE.lg,
    borderRadius: RADIUS.md,
    gap: SPACE.sm,
  },
  footer: { padding: SPACE.page, gap: SPACE.sm },
  successScroll: { padding: SPACE.page, gap: SPACE.lg, flexGrow: 1 },
  successCard: { padding: SPACE.xl, gap: SPACE.lg },
  center: { textAlign: 'center' },
  timer: {
    padding: SPACE.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    gap: SPACE.sm,
    alignItems: 'center',
  },
});
