import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACE } from '@/theme';
import {
  apiMessage,
  cancelReservation,
  myReservations,
  type Reservation,
} from '@/services/marketplace';
import { openWhatsApp } from '@/services/whatsapp';
import {
  reservationSections,
  reservationDescription,
  validTime,
} from '@/lib/reservation-presentation';
import { useClock } from '@/hooks/use-clock';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { MarketplaceShell, PageHeader } from '@/components/marketplace-shell';
import { ConfirmationDialog, InlineMessage } from '@/components/feedback';
import BuyerReservationCard from '@/components/buyer-reservation-card';
import ReservationListState from '@/components/reservation-list-state';
import AppText from '@/components/app-text';

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
    try {
      const result = await myReservations();
      if (request === sequence.current) {
        setRows(result);
        setError('');
      }
    } catch (cause) {
      if (request === sequence.current) setError(apiMessage(cause));
    } finally {
      if (request === sequence.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Los avisos públicos del socket disparan la consulta autenticada de mis reservas.
  useMarketplaceSync(refresh);

  useEffect(
    () => () => {
      sequence.current++;
    },
    [],
  );

  // Al vencer un plazo, consulta su estado al servidor aunque no llegue un aviso de stock.
  useEffect(() => {
    let shouldRefresh = false;
    for (const row of rows) {
      const expires = validTime(row.expiresAt),
        key = `${row.id}:${row.expiresAt}`;
      if (
        row.status === 'ACTIVE' &&
        expires !== undefined &&
        expires <= now &&
        !refreshedDeadlines.current.has(key)
      ) {
        refreshedDeadlines.current.add(key);
        shouldRefresh = true;
      }
    }
    if (shouldRefresh) void refresh();
  }, [rows, now, refresh]);

  const sections = reservationSections(rows);

  const presented = sections.flatMap(section => section.data);
  const selected = presented.find(({ reservation }) => reservation.id === confirmId);

  async function cancel() {
    if (!confirmId || busy) return;
    setBusy(true);
    try {
      const result = await cancelReservation(confirmId);
      setRows(previous => previous.map(row => (row.id === result.id ? result : row)));
      setConfirmId(undefined);
      await refresh();
    } catch (cause) {
      const message = apiMessage(cause);
      setConfirmId(undefined);
      await refresh();
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function contact(row: Reservation) {
    if (!row.sellerContact?.phone) return;
    try {
      await openWhatsApp(row.sellerContact.phone, row.publicationTitle, true);
      setError('');
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  return (
    <MarketplaceShell active="reservations">
      <SectionList
        sections={sections}
        keyExtractor={({ reservation }) => reservation.id}
        extraData={{ now, busy }}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        refreshing={refreshing && !loading}
        onRefresh={() => void refresh()}
        ListHeaderComponent={
          <>
            <PageHeader
              title="Mis reservas"
              contained
            />
            {error && rows.length > 0 ? (
              <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage>
            ) : null}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <AppText
              variant="heading"
              accessibilityRole="header"
              style={styles.sectionTitle}
            >
              {section.title}
            </AppText>
            <AppText
              variant="caption"
              accessibilityLabel={`${section.data.length} ${section.data.length === 1 ? 'reserva' : 'reservas'}`}
            >
              {section.data.length}
            </AppText>
          </View>
        )}
        ListEmptyComponent={
          <ReservationListState
            loading={loading}
            error={error}
            onRetry={() => void refresh()}
            onExplore={() => router.navigate('/homePage')}
          />
        }
        renderItem={({ item: { reservation, unitLabel } }) => (
          <View style={styles.item}>
            <BuyerReservationCard
              reservation={reservation}
              unitLabel={unitLabel}
              now={now}
              disabled={busy}
              onCancel={() => setConfirmId(reservation.id)}
              onContact={() => void contact(reservation)}
            />
          </View>
        )}
      />
      <ConfirmationDialog
        visible={!!confirmId}
        title="Cancelar reserva"
        description={`¿Cancelar ${selected ? reservationDescription(selected.reservation, selected.unitLabel) : 'esta reserva'}? Se liberará esta unidad.`}
        confirmTitle="Sí, cancelar reserva"
        busy={busy}
        variant="destructive"
        onConfirm={() => void cancel()}
        onClose={() => setConfirmId(undefined)}
      />
    </MarketplaceShell>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.xl, flexGrow: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.md,
  },
  sectionTitle: { flexShrink: 1, color: COLORS.textDark },
  item: { marginBottom: SPACE.lg },
});
