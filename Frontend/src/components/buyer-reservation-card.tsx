import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { Reservation } from '@/services/marketplace';
import { canActOnReservation, formatReservationDate, reservationDescription, reservationStatusLabel } from '@/lib/reservation-presentation';
import { countdown, money } from '@/lib/marketplace-presentation';
import { COLORS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import Card from './Card';
import PrimaryButton from './PrimaryButton';
import PublicationPhoto from './publication-photo';
import PickupLocation from './pickup-location';

type Props = { reservation: Reservation; unitLabel: string; now: number; disabled?: boolean; onCancel: () => void; onContact: () => void };
const stateIcons = { ACTIVE: 'time-outline', COMPLETED: 'checkmark-circle-outline', CANCELLED: 'close-circle-outline', EXPIRED: 'hourglass-outline' } as const;

export default function BuyerReservationCard({ reservation: r, unitLabel, now, disabled, onCancel, onContact }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  const active = canActOnReservation(r, now);
  const urgent = active && new Date(r.expiresAt).getTime() - now <= 300000;
  const pending = r.status === 'ACTIVE';
  const description = reservationDescription(r, unitLabel);
  const completed = r.status === 'COMPLETED';
  const color = active || completed ? styles.greenText : styles.mutedText;
  const resolvedLabel = completed ? 'Entregada el' : r.status === 'CANCELLED' ? 'Cancelada el' : 'Venció el';
  return <Card style={[styles.card, !pending && styles.history]}>
    <View style={[styles.product, stacked && pending && styles.stackedProduct]}>
      <PublicationPhoto uri={r.publicationImageUrl} title={r.publicationTitle} style={[styles.photo, !pending && styles.historyPhoto, stacked && pending && styles.widePhoto]} />
      <View style={styles.productBody}>
        <AppText variant={pending ? 'heading' : 'label'}>{r.publicationTitle}</AppText>
        {unitLabel ? <AppText variant="caption">{unitLabel}</AppText> : null}
        <View style={styles.price}>
          <AppText variant={pending ? 'price' : 'heading'} style={!pending && styles.mutedText} accessibilityLabel={`Precio reservado: ${money(r.unitPrice)}`}>{money(r.unitPrice)}</AppText>
          <AppText variant="caption">Precio reservado</AppText>
        </View>
      </View>
    </View>
    <PickupLocation reservation={r} />
    {pending ? <View style={[styles.deadline, !active && styles.waiting]}>
      <View style={styles.deadlineRow}>
        <View style={styles.status}>
          <Ionicons name={urgent ? 'alert-circle-outline' : stateIcons.ACTIVE} size={18} color={urgent ? COLORS.error : active ? COLORS.primary : COLORS.textMedium} accessible={false} />
          <AppText variant="label" style={[styles.statusText, color, urgent && styles.urgentText]}>{urgent ? 'Por vencer' : reservationStatusLabel(r, now)}</AppText>
        </View>
        {active ? <AppText variant="countdown" style={[styles.timer, urgent && styles.urgentText]} accessibilityLabel={`Tiempo para recoger: ${countdown(r.expiresAt, now)}`}>{countdown(r.expiresAt, now)}</AppText> : null}
      </View>
      {active ? <AppText variant="caption" style={styles.greenText}>Tiempo para recoger · Vence {formatReservationDate(r.expiresAt)}</AppText> : null}
    </View> : <View style={styles.resolution}>
      <View style={styles.status}>
        <Ionicons name={stateIcons[r.status] ?? 'help-circle-outline'} size={18} color={completed ? COLORS.primary : COLORS.textMedium} accessible={false} />
        <AppText variant="label" style={[styles.statusText, color]}>{reservationStatusLabel(r, now)}</AppText>
      </View>
      <AppText variant="caption">{r.resolvedAt || r.status === 'EXPIRED' ? `${resolvedLabel} ${formatReservationDate(r.resolvedAt ?? r.expiresAt)}` : `Apartada el ${formatReservationDate(r.reservedAt)}`}</AppText>
    </View>}
    {active ? <View style={[styles.actions, stacked && styles.stackedActions]}>
      {r.sellerContact?.phone ? <PrimaryButton compact title="WhatsApp" style={styles.action} accessibilityLabel={`Contactar por WhatsApp sobre ${description}`} disabled={disabled} onPress={onContact} /> : null}
      <PrimaryButton compact title="Cancelar" variant="danger-ghost" style={styles.action} accessibilityLabel={`Cancelar ${description}`} disabled={disabled} onPress={onCancel} />
    </View> : null}
  </Card>;
}

const styles = StyleSheet.create({
  card: { padding: SPACE.lg, gap: SPACE.lg },
  history: { backgroundColor: 'transparent', borderWidth: 0, borderBottomWidth: 1, borderRadius: 0, paddingHorizontal: 0, paddingBottom: SPACE.xl },
  product: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.lg },
  stackedProduct: { flexDirection: 'column' },
  photo: { width: 104, height: 112, borderRadius: RADIUS.sm, backgroundColor: COLORS.inputBg },
  widePhoto: { width: '100%', height: undefined, aspectRatio: 2 },
  historyPhoto: { width: 72, height: 80 },
  productBody: { flex: 1, minWidth: 0, gap: SPACE.xs },
  price: { gap: SPACE.xs, marginTop: SPACE.sm },
  deadline: { backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.sm, padding: SPACE.md, gap: SPACE.xs },
  waiting: { backgroundColor: COLORS.inputBg },
  deadlineRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.sm },
  status: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, flexShrink: 1 },
  statusText: { flexShrink: 1 },
  timer: { fontVariant: ['tabular-nums'] },
  urgentText: { color: COLORS.error },
  resolution: { gap: SPACE.xs },
  greenText: { color: COLORS.primary }, mutedText: { color: COLORS.textMedium },
  actions: { flexDirection: 'row', gap: SPACE.sm }, stackedActions: { flexDirection: 'column' }, action: { flex: 1 },
});
