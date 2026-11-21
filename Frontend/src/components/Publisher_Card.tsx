import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Card from './Card';
import AppText from './app-text';
import { COLORS, RADIUS, SPACE, TYPE } from '@/theme';
import type { Publication } from '@/services/marketplace';
import { countdown } from '@/lib/marketplace-presentation';
import PublicationPrice, { GangaBadge } from './publication-price';
import PublicationPhoto from './publication-photo';

export default memo(function PublisherCard({ item, onPress, zoneName, now = Date.now() }: { item: Publication; onPress: () => void; zoneName?: string; now?: number }) {
  const status = `${item.is_ganga_active ? 'Oferta' : 'Disponible'}${item.end_time ? ` · termina en ${countdown(item.end_time, now)}` : ' ahora'}`;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title}`} onPress={onPress} style={({ pressed }) => [styles.touchable, pressed && styles.pressed]}>
    <Card style={[styles.card, item.is_ganga_active && styles.gangaCard]}>
      <PublicationPhoto uri={item.image_url} title={item.title} style={styles.image} />
      <View style={styles.body}>
        {item.is_ganga_active ? <><GangaBadge /><AppText variant="caption">{item.end_time ? `Termina en ${countdown(item.end_time, now)}` : 'Disponible ahora'}</AppText></> : item.type === 'LIVE' ? <AppText variant="badge">{status}</AppText> : null}
        <AppText variant="label" style={styles.title}>{item.title}</AppText>
        <PublicationPrice item={item} compact />
        <AppText variant="caption">{zoneName ?? 'Zona no disponible'}</AppText>
        {item.type === 'LIVE' && <AppText variant="caption">{item.current_stock} disponibles</AppText>}
      </View>
    </Card>
  </Pressable>;
});

const styles = StyleSheet.create({
  touchable: { flex: 1, minWidth: 0 },
  card: { flex: 1, overflow: 'hidden' },
  gangaCard: { backgroundColor: COLORS.gangaSoft },
  image: { width: '100%', aspectRatio: 1, backgroundColor: COLORS.inputBg },
  body: { flex: 1, minWidth: 0, padding: SPACE.md, gap: SPACE.xs },
  title: { ...TYPE.label }, pressed: { opacity: 0.75 },
});
