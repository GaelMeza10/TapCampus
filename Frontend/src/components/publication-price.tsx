import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppText from './app-text';
import { COLORS, RADIUS, SPACE } from '@/theme';
import { money } from '@/lib/marketplace-presentation';
import type { Publication } from '@/services/marketplace';

type Price = Pick<Publication, 'price' | 'price_before_ganga' | 'is_ganga_active'>;

export function GangaBadge() {
  return <View style={styles.badge}>
    <Ionicons name="pricetag-outline" size={16} color={COLORS.white} accessible={false} />
    <AppText variant="badge" style={styles.badgeText}>Oferta</AppText>
  </View>;
}

export default function PublicationPrice({ item, compact = false }: { item: Price; compact?: boolean }) {
  const current = Math.round(Number(item.price) * 100);
  const previous = Math.round(Number(item.price_before_ganga) * 100);
  const compare = !!item.is_ganga_active && Number.isFinite(current) && current > 0 && Number.isFinite(previous) && previous > current;
  return <View style={styles.block}>
    <View style={styles.row}>
      <AppText variant={compact ? 'label' : 'price'} accessibilityLabel={`Precio actual: ${money(item.price)}`} style={item.is_ganga_active && styles.ganga}>{money(item.price)}</AppText>
      {compare ? <AppText variant="caption" accessibilityLabel={`Precio anterior: ${money(previous / 100)}`} style={styles.previous}>{money(previous / 100)}</AppText> : null}
    </View>
    {compare ? <AppText variant="caption" style={styles.ganga}>Ahorras {money((previous - current) / 100)}</AppText> : null}
  </View>;
}

const styles = StyleSheet.create({
  block: { gap: SPACE.xs, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: SPACE.sm, rowGap: SPACE.xs },
  previous: { textDecorationLine: 'line-through' },
  ganga: { color: COLORS.ganga },
  badgeText: { color: COLORS.white },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: SPACE.xs, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.ganga },
});
