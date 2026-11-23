import { StyleSheet, View } from 'react-native';
import AppText from './app-text';
import { COLORS, RADIUS, SPACE } from '@/theme';
import type { Publication } from '@/services/marketplace';

export default function ConditionLabel({ item }: { item: Pick<Publication, 'type' | 'condition'> }) {
  if (item.type !== 'STATIC' || (item.condition !== 'NEW' && item.condition !== 'USED')) return null;
  return <View style={styles.badge}><AppText variant="badge" style={styles.text}>{item.condition === 'NEW' ? 'Nuevo' : 'Usado'}</AppText></View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.textDark, backgroundColor: COLORS.background },
  text: { color: COLORS.textDark },
});
