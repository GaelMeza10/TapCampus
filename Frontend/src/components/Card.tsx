import { StyleSheet, View, type ViewProps } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '@/theme';

export default function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOW.card },
});
