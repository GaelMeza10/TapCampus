import { StyleSheet, View, type ViewProps } from 'react-native';
import { COLORS, RADIUS } from '@/theme';

export default function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
});
