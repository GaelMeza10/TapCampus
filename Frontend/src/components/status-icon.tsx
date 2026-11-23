import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/theme';

export default function StatusIcon({ kind }: { kind: 'success' | 'empty' | 'expired' }) {
  if (kind === 'empty') return <Image source={require('@/assets/icons/search-empty.svg')} style={styles.search} contentFit="contain" accessibilityIgnoresInvertColors />;
  return <View style={[styles.badge, kind === 'expired' && styles.expired]}><Image source={kind === 'success' ? require('@/assets/icons/reservation-confirmed.svg') : require('@/assets/icons/expired-background.svg')} style={[styles.background, kind === 'expired' && styles.expired]} contentFit="contain" />{kind === 'success' ? <Ionicons name="checkmark" size={27} color={COLORS.primary} accessible={false} /> : <Image source={require('@/assets/icons/expired-clock.svg')} style={styles.clock} contentFit="contain" />}</View>;
}
const styles = StyleSheet.create({ badge: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }, background: { position: 'absolute', width: 58, height: 58 }, expired: { width: 72, height: 72 }, clock: { width: 28, height: 28 }, search: { width: 28, height: 28 } });
