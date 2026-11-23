import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import PrimaryButton from './PrimaryButton';

export default function ReservationListState({ loading, error, onRetry, onExplore }: { loading: boolean; error: string; onRetry: () => void; onExplore: () => void }) {
  if (loading) return <View accessible accessibilityLabel="Cargando reservas…" accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={styles.loading}>
    {[0, 1].map(index => <View key={index} style={styles.skeleton} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.product}><View style={styles.photo} /><View style={styles.lines}><View style={styles.line} /><View style={styles.shortLine} /><View style={styles.price} /></View></View>
      <View style={styles.deadline} /><View style={styles.button} />
    </View>)}
  </View>;
  return <View style={styles.state}>
    <View style={styles.symbol}><Ionicons name={error ? 'cloud-offline-outline' : 'receipt-outline'} size={32} color={COLORS.primary} accessible={false} /></View>
    <AppText variant="section" accessibilityRole="header">{error ? 'No pudimos cargar tus reservas' : 'Aún no tienes reservas'}</AppText>
    <AppText style={styles.description}>{error || 'Cuando apartes un producto, aquí verás su precio y el tiempo para recogerlo.'}</AppText>
    <PrimaryButton title={error ? 'Reintentar' : 'Explorar publicaciones'} onPress={error ? onRetry : onExplore} />
  </View>;
}

const styles = StyleSheet.create({
  loading: { gap: SPACE.lg, paddingHorizontal: SPACE.page },
  skeleton: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACE.lg, gap: SPACE.lg },
  product: { flexDirection: 'row', gap: SPACE.lg },
  photo: { width: 104, height: 112, borderRadius: RADIUS.sm, backgroundColor: COLORS.inputBg },
  lines: { flex: 1, gap: SPACE.md, paddingTop: SPACE.xs },
  line: { height: 20, borderRadius: SPACE.xs, backgroundColor: COLORS.inputBg },
  shortLine: { height: 14, width: '65%', borderRadius: SPACE.xs, backgroundColor: COLORS.inputBg },
  price: { height: 28, width: '50%', borderRadius: SPACE.xs, backgroundColor: COLORS.inputBg },
  deadline: { height: 72, borderRadius: RADIUS.sm, backgroundColor: COLORS.inputBg },
  button: { height: 48, borderRadius: RADIUS.full, backgroundColor: COLORS.inputBg },
  state: { paddingVertical: SPACE.xxl, paddingHorizontal: SPACE.page, gap: SPACE.lg },
  symbol: { width: 64, height: 64, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: SPACE.sm },
  description: { color: COLORS.textMedium, maxWidth: 440, marginBottom: SPACE.sm },
});
