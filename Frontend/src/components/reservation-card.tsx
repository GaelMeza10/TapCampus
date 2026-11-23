import { Pressable, StyleSheet, View } from 'react-native';
import type { Reservation } from '@/services/marketplace';
import { canActOnReservation, formatReservationDate, reservationDescription, reservationStatusLabel } from '@/lib/reservation-presentation';
import { countdown, money } from '@/lib/marketplace-presentation';
import { COLORS, RADIUS, SPACE } from '@/theme';
import Card from './Card';
import AppText from './app-text';
import PrimaryButton from './PrimaryButton';
import StatusIcon from './status-icon';
import PublicationPhoto from './publication-photo';
import Ionicons from '@expo/vector-icons/Ionicons';
import PickupLocation from './pickup-location';

export default function ReservationCard({ reservation: r, unitLabel, now, seller, combineTitle, onConfirm, onCancel, onContact, disabled }: { reservation: Reservation; unitLabel: string; now: number; seller?: boolean; combineTitle?: boolean; onConfirm?: () => void; onCancel?: () => void; onContact?: () => void; disabled?: boolean }) {
  const active = canActOnReservation(r, now);
  const contact = seller ? r.buyerContact?.phone : r.sellerContact?.phone;
  const description = reservationDescription(r, unitLabel);
  if (seller && active) return <Card style={styles.sellerCard}>
    <View style={styles.sellerHeader}><AppText variant="label" style={styles.flex}>{unitLabel || 'Unidad 1'} · {r.buyer?.name ?? 'No disponible'}</AppText>{contact && onContact ? <Pressable accessibilityRole="button" accessibilityLabel={`Contactar a ${r.buyer?.name ?? 'el comprador'} por WhatsApp sobre ${description}`} disabled={disabled} style={styles.contactIcon} onPress={onContact}><Ionicons name="logo-whatsapp" size={22} color={COLORS.primary} /></Pressable> : null}</View>
    <AppText variant="label" style={styles.clock}>Apartado vence en {countdown(r.expiresAt, now)}</AppText>
    <AppText variant="caption">Precio fijado: {money(r.unitPrice)}</AppText>
    <PickupLocation reservation={r} />
    {onConfirm ? <PrimaryButton compact title="Confirmar entrega" accessibilityLabel={`Confirmar entrega de ${description} para ${r.buyer?.name ?? 'el comprador'}`} disabled={disabled} onPress={onConfirm} /> : null}
  </Card>;
  return <Card style={styles.card}>
    {r.status === 'EXPIRED' ? <StatusIcon kind="expired" /> : null}
    <AppText variant="badge" style={!active && styles.inactive}>Estado: {reservationStatusLabel(r, now)}</AppText>
    <View style={styles.productHeader}>
      {!seller ? <PublicationPhoto uri={r.publicationImageUrl} title={r.publicationTitle} style={styles.photo} /> : null}
      <View style={styles.productBody}>
        <AppText variant="heading">{r.publicationTitle}{combineTitle && unitLabel ? ` · ${unitLabel}` : ''}</AppText>
        {!combineTitle && unitLabel ? <AppText variant="label">{unitLabel}</AppText> : null}
        {seller ? <AppText variant="caption">Comprador: {r.buyer?.name ?? 'No disponible'}</AppText> : null}
        <AppText variant="label">Precio fijado: {money(r.unitPrice)}</AppText>
      </View>
    </View>
    <PickupLocation reservation={r} />
    {active ? <><AppText variant="label" style={styles.clock}>Apartado vence en {countdown(r.expiresAt, now)}</AppText><AppText variant="caption">Vence: {formatReservationDate(r.expiresAt)}</AppText></> : null}
    {r.resolvedAt ? <AppText variant="caption">Resuelta el {formatReservationDate(r.resolvedAt)}</AppText> : null}
    {active ? <>
      {seller && onConfirm ? <PrimaryButton compact title="Confirmar entrega" accessibilityLabel={`Confirmar entrega de ${description} para ${r.buyer?.name ?? 'el comprador'}`} disabled={disabled} onPress={onConfirm} /> : null}
      <View style={styles.actions}>
        {contact && onContact ? <PrimaryButton compact variant="secondary" style={styles.flex} title="WhatsApp" accessibilityLabel={seller ? `Contactar a ${r.buyer?.name ?? 'el comprador'} por WhatsApp sobre ${description}` : `Contactar por WhatsApp sobre ${description}`} disabled={disabled} onPress={onContact} /> : null}
        {!seller && onCancel ? <Pressable accessibilityRole="button" accessibilityLabel={`Cancelar ${description}`} disabled={disabled} style={styles.cancel} onPress={onCancel}><AppText variant="label" style={styles.danger}>Cancelar esta reserva</AppText></Pressable> : null}
      </View>
    </> : null}
  </Card>;
}
const styles = StyleSheet.create({
  productHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.md }, productBody: { flex: 1, minWidth: 0, gap: SPACE.sm },
  photo: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: COLORS.inputBg },
  sellerCard: { padding: SPACE.md, gap: SPACE.xs }, sellerHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }, contactIcon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  card: { padding: SPACE.lg, gap: SPACE.sm }, clock: { color: COLORS.primary }, inactive: { color: COLORS.textMedium },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, flexWrap: 'wrap' }, flex: { flex: 1 }, cancel: { minHeight: 44, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.md, justifyContent: 'center' }, danger: { color: COLORS.error },
});
