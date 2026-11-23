import { StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACE } from '@/theme';
import type { Publication } from '@/services/marketplace';
import AppText from './app-text';

type Availability = Pick<Publication, 'type' | 'current_stock' | 'end_time' | 'status'>;

export function ClosingBadge({ item, now }: { item: Availability; now: number }) {
  const end = item.end_time ? Date.parse(item.end_time) : NaN;
  if (item.type !== 'LIVE' || !Number.isFinite(end)) return null;
  const remaining = end - now;
  const closed = item.status !== 'ACTIVE' || remaining <= 0;
  const minutes = Math.ceil(Math.max(0, remaining) / 60000);
  return <View style={[styles.closing, (closed || minutes <= 15) && styles.urgent]}>
    <AppText variant="badge" style={styles.white}>{closed ? 'Venta finalizada' : `Cierra en ${minutes} min`}</AppText>
  </View>;
}

export function StockBadge({ item }: { item: Availability }) {
  if (item.type !== 'LIVE') return null;
  const stock = item.current_stock;
  const known = typeof stock === 'number' && Number.isInteger(stock) && stock >= 0;
  const low = known && stock <= 2;
  return <View style={[styles.stock, low && styles.low]}>
    <AppText variant="badge" style={low ? styles.lowText : undefined}>{!known ? 'Stock no disponible' : stock === 1 ? 'Queda 1' : `Quedan ${stock}`}</AppText>
  </View>;
}

const styles = StyleSheet.create({
  closing: { alignSelf: 'flex-start', backgroundColor: COLORS.textDark, borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs },
  urgent: { backgroundColor: COLORS.error }, white: { color: COLORS.white },
  stock: { alignSelf: 'flex-start', backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs },
  low: { backgroundColor: COLORS.stockLowBg }, lowText: { color: COLORS.stockLowText },
});
