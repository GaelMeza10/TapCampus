import { memo, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Card from './Card';
import AppText from './app-text';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import type { Publication } from '@/services/marketplace';
import { countdown, money } from '@/lib/marketplace-presentation';

export default memo(function PublisherCard({ item, onPress, zoneName, now = Date.now(), compact }: { item: Publication; onPress: () => void; zoneName?: string; now?: number; compact?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title}`} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
    {compact ? <Card style={styles.compactCard}>
      <AppText variant="badge" style={item.is_ganga_active && styles.ganga}>{item.is_ganga_active ? 'GANGA · ' : ''}{item.type === 'LIVE' ? `Venta termina en ${countdown(item.end_time, now)}` : 'CATÁLOGO'}</AppText>
      <AppText variant="heading" numberOfLines={2}>{item.title}</AppText>
      {item.is_ganga_active && item.price_before_ganga && Number(item.price_before_ganga) > Number(item.price) ? <AppText variant="caption" style={styles.previous}>{money(item.price_before_ganga)}</AppText> : null}
      <AppText variant="badge">{money(item.price)} · {item.type === 'LIVE' ? `${item.current_stock} disponibles · ` : ''}{zoneName ?? item.seller?.name}</AppText>
    </Card> : <Card style={styles.card}>
      {item.image_url && !imageFailed ? <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" onError={() => setImageFailed(true)} accessibilityLabel={`Foto de ${item.title}`} /> : <View style={[styles.image, styles.fallback]}><AppText variant="caption">Sin imagen</AppText></View>}
      <View style={styles.body}>
        <AppText variant="badge" style={item.is_ganga_active && styles.ganga}>{item.is_ganga_active ? 'GANGA · ' : ''}{item.type === 'LIVE' ? item.end_time ? `Venta termina en ${countdown(item.end_time, now)}` : 'DISPONIBLE AHORA' : 'CATÁLOGO'}</AppText>
        <AppText variant="heading" numberOfLines={2}>{item.title}</AppText>
        <AppText variant="caption" numberOfLines={2}>{zoneName ?? item.seller?.name}</AppText>
        <View style={styles.prices}>{item.is_ganga_active && item.price_before_ganga && Number(item.price_before_ganga) > Number(item.price) ? <AppText variant="caption" style={styles.previous}>{money(item.price_before_ganga)}</AppText> : null}<AppText variant="price">{money(item.price)}</AppText></View>
        <AppText variant="badge">{item.type === 'LIVE' ? `${item.current_stock} disponibles` : 'Ver detalles →'}</AppText>
      </View>
    </Card>}
  </Pressable>;
});
const styles = StyleSheet.create({
  compactCard: { padding: SPACE.lg, gap: SPACE.xs, minHeight: 118 },
  card: { flexDirection: 'row', padding: SPACE.md, gap: SPACE.md, minHeight: 192 }, image: { width: METRICS.photoWidth, height: METRICS.photoHeight, borderRadius: RADIUS.md, backgroundColor: COLORS.primarySoft },
  fallback: { alignItems: 'center', justifyContent: 'center' }, body: { flex: 1, gap: SPACE.sm }, prices: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACE.sm },
  previous: { textDecorationLine: 'line-through' }, ganga: { color: COLORS.ganga }, pressed: { opacity: 0.75 },
});
