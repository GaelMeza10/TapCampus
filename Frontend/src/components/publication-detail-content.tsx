import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADIUS, SPACE } from '@/theme';
import type { Publication } from '@/services/marketplace';
import AppText from './app-text';
import PublicationPhoto from './publication-photo';
import PublicationPrice, { GangaBadge } from './publication-price';
import { ClosingBadge, StockBadge } from './publication-badges';
import { PUBLICATION_COPY } from '@/lib/publication-copy';
import ConditionLabel from './condition-label';
import { accountInitials } from './account-ui';
import { ARRANGED_PICKUP_LABEL } from './pickup-location';

export default function PublicationDetailContent({ item, zone, category, now }: { item: Publication; zone?: string; category?: string; now: number }) {
  const { fontScale } = useWindowDimensions();
  const live = item.type === 'LIVE';
  const until = item.end_time ? new Date(item.end_time).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }) : undefined;
  return <View style={styles.content}>
    <View>
      <PublicationPhoto uri={item.image_url} title={item.title} style={[styles.photo, live && styles.livePhoto]} />
      {live ? <View style={styles.closingPosition}><ClosingBadge item={item} now={now} /></View> : null}
    </View>
    <View style={styles.tags}>
      <View style={styles.kind}><AppText variant="badge" style={styles.white}>{PUBLICATION_COPY[item.type].badgeLabel}</AppText></View>
      <ConditionLabel item={item} />
      {category ? <View style={styles.category}><AppText variant="badge" style={styles.muted}>{category}</AppText></View> : null}
      {live && item.is_ganga_active ? <GangaBadge /> : null}
    </View>
    <View style={[styles.titleRow, fontScale > 1.2 && styles.stacked]}>
      <AppText variant="title" accessibilityRole="header" style={[styles.title, fontScale > 1.2 && styles.titleStacked]}>{item.title}</AppText>
      <PublicationPrice item={item} prominent />
    </View>
    <StockBadge item={item} />
    <View style={styles.location}>
      <Ionicons name="location-outline" size={22} color={COLORS.primaryDark} accessible={false} />
      <View style={styles.grow}><AppText variant="caption">{live ? 'Dónde recogerlo' : 'Entrega'}</AppText><AppText variant="label">{item.pickup_mode === 'ARRANGED' ? ARRANGED_PICKUP_LABEL : zone ? `Ubicación: ${zone}` : 'Consulta el punto de entrega con el vendedor.'}</AppText>{live && until ? <AppText variant="place">Hasta {until}</AppText> : null}</View>
    </View>
    <View style={styles.description}><AppText variant="heading" accessibilityRole="header">Descripción</AppText><AppText style={styles.muted}>{item.description}</AppText></View>
    <View style={styles.seller}>
      <View style={styles.avatar} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden><AppText variant="label" style={styles.white}>{accountInitials(item.seller.name)}</AppText></View>
      <View style={styles.grow}><AppText variant="label">{item.seller.name}</AppText><AppText variant="caption">Vendedor</AppText></View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  titleStacked: { flexBasis: 'auto', flexGrow: 0 },
  content: { gap: SPACE.lg }, photo: { width: '100%', aspectRatio: 1.4, borderRadius: RADIUS.hero, backgroundColor: COLORS.inputBg }, livePhoto: { aspectRatio: 1.6 },
  closingPosition: { position: 'absolute', left: SPACE.md, top: SPACE.md, right: SPACE.md },
  white: { color: COLORS.white }, tags: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACE.sm }, kind: { backgroundColor: COLORS.textDark, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs, borderRadius: RADIUS.sm },
  category: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: SPACE.md }, stacked: { flexDirection: 'column' }, title: { flexGrow: 1, flexShrink: 1, flexBasis: 160 },
  grow: { flex: 1, minWidth: 0, gap: SPACE.xs }, location: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.white, padding: SPACE.lg },
  description: { gap: SPACE.sm }, muted: { color: COLORS.textMedium }, seller: { flexDirection: 'row', gap: SPACE.md, alignItems: 'center', paddingVertical: SPACE.xs }, avatar: { width: 44, minHeight: 44, borderRadius: RADIUS.full, padding: SPACE.sm, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
});
