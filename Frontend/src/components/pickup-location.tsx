import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Reservation } from '@/services/marketplace';
import { COLORS, SPACE } from '@/theme';
import AppText from './app-text';

export const ARRANGED_PICKUP_LABEL = 'Punto de entrega por acordar dentro del campus';

export default function PickupLocation({ reservation }: { reservation: Reservation }) {
  const location = reservation.pickupLocation;
  return <View style={styles.row}>
    <Ionicons name="location-outline" size={20} color={COLORS.primaryDark} accessible={false} />
    <View style={styles.body}>
      <AppText variant="label">{location ? `${location.source === 'LEGACY_CURRENT' ? 'Ubicación de referencia' : 'Ubicación'}: ${location.name}` : 'Ubicación no disponible. Confírmala con el vendedor.'}</AppText>
      {location?.source === 'LEGACY_CURRENT' ? <AppText variant="caption">Esta reserva no guardó el punto original. Confirma dónde recogerla con el vendedor.</AppText> : null}
      {reservation.sellerName ? <AppText variant="caption">Vendedor: {reservation.sellerName}</AppText> : null}
    </View>
  </View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: SPACE.sm, alignItems: 'flex-start' }, body: { flex: 1, minWidth: 0, gap: SPACE.xs } });
