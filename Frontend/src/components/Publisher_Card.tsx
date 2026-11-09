import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Card from './Card';
import AppText from './app-text';
import { COLORS, METRICS, RADIUS, SPACE, TYPE } from '@/theme';
import type { Publication } from '@/services/marketplace';
import { countdown, money } from '@/lib/marketplace-presentation';
import PublicationPhoto from './publication-photo';

export default memo(function PublisherCard({ item, onPress, zoneName, now = Date.now() }: { item: Publication; onPress: () => void; zoneName?: string; now?: number }) {
  const previous = item.is_ganga_active && item.price_before_ganga && Number(item.price_before_ganga) > Number(item.price) ? money(item.price_before_ganga) : undefined;
  const status = item.type === 'STATIC' ? 'Catálogo' : `${item.is_ganga_active ? 'Ganga' : 'Disponible'}${item.end_time ? ` · termina en ${countdown(item.end_time, now)}` : ' ahora'}`;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title}`} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
    <Card style={styles.card}>
      <PublicationPhoto uri={item.image_url} title={item.title} style={styles.image} />
      <View style={styles.body}>
        <AppText variant="badge">{status}</AppText>
        <AppText variant="label" style={styles.title}>{item.title}</AppText>
        <AppText variant="price">{money(item.price)}</AppText>
        <AppText variant="caption">{zoneName ?? 'Zona no disponible'}</AppText>
        <AppText variant="caption">{previous ? `Antes ${previous} · ` : ''}{item.type === 'LIVE' ? `${item.current_stock} disponibles` : 'Contacto directo'}</AppText>
      </View>
    </Card>
  </Pressable>;
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACE.lg, gap: SPACE.lg },
  image: { width: METRICS.photoWidth, height: METRICS.photoHeight, borderRadius: RADIUS.md, backgroundColor: COLORS.inputBg },
  body: { flex: 1, minWidth: 0, gap: SPACE.xs },
  title: { ...TYPE.label, fontSize: 16, lineHeight: 23 }, pressed: { opacity: 0.75 },
});
