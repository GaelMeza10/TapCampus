import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Card from './Card';
import AppText from './app-text';
import { COLORS, METRICS, RADIUS, SPACE, TYPE } from '@/theme';
import type { Publication } from '@/services/marketplace';
import { countdown } from '@/lib/marketplace-presentation';
import PublicationPrice, { GangaBadge } from './publication-price';
import PublicationPhoto from './publication-photo';

export default memo(function PublisherCard({ item, onPress, zoneName, now = Date.now() }: { item: Publication; onPress: () => void; zoneName?: string; now?: number }) {
  const status = item.type === 'STATIC' ? 'Catálogo' : `${item.is_ganga_active ? 'Oferta' : 'Disponible'}${item.end_time ? ` · termina en ${countdown(item.end_time, now)}` : ' ahora'}`;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title}`} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
    <Card style={[styles.card, item.is_ganga_active && styles.gangaCard]}>
      <PublicationPhoto uri={item.image_url} title={item.title} style={styles.image} />
      <View style={styles.body}>
        {item.is_ganga_active ? <><GangaBadge /><AppText variant="caption">{item.end_time ? `Termina en ${countdown(item.end_time, now)}` : 'Disponible ahora'}</AppText></> : <AppText variant="badge">{status}</AppText>}
        <AppText variant="label" style={styles.title}>{item.title}</AppText>
        <PublicationPrice item={item} />
        <AppText variant="caption">{zoneName ?? 'Zona no disponible'}</AppText>
        <AppText variant="caption">{item.type === 'LIVE' ? `${item.current_stock} disponibles` : 'Contacto directo'}</AppText>
      </View>
    </Card>
  </Pressable>;
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACE.lg, gap: SPACE.lg },
  gangaCard: { backgroundColor: COLORS.gangaSoft },
  image: { width: METRICS.photoWidth, height: METRICS.photoHeight, borderRadius: RADIUS.md, backgroundColor: COLORS.inputBg },
  body: { flex: 1, minWidth: 0, gap: SPACE.xs },
  title: { ...TYPE.label, fontSize: 16, lineHeight: 23 }, pressed: { opacity: 0.75 },
});
