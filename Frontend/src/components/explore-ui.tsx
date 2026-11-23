import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppText from './app-text';
import PublicationPhoto from './publication-photo';
import ConditionLabel from './condition-label';
import { COLORS, RADIUS, SPACE } from '@/theme';
import { countdown } from '@/lib/marketplace-presentation';
import PublicationPrice, { GangaBadge } from './publication-price';
import { ClosingBadge, StockBadge } from './publication-badges';
import type { Publication, Reservation, Zone } from '@/services/marketplace';

export { CampusHeader } from './campus-header';

export function ExploreChips({ options, value, onChange, allLabel }: { options: Zone[]; value?: number; onChange: (id?: number) => void; allLabel: string }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
    {[{ id: undefined, name: allLabel }, ...options].map(option => <Pressable key={option.id ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: option.id === value }} onPress={() => onChange(option.id)} style={({ pressed }) => [styles.chip, value === option.id && styles.chipSelected, pressed && styles.pressed]}><AppText variant="caption" style={value === option.id ? styles.white : undefined}>{option.name}</AppText></Pressable>)}
  </ScrollView>;
}

export function ActiveReservationBanner({ item, now, onPress }: { item: Reservation; now: number; onPress: () => void }) {
  return <View style={styles.banner}>
    <View style={styles.grow}><AppText variant="label">Reserva activa</AppText><View style={styles.bannerDetails}><AppText style={styles.productName}>{item.publicationTitle}</AppText><AppText variant="countdown" style={new Date(item.expiresAt).getTime() - now <= 300000 ? styles.urgentText : undefined}>{countdown(item.expiresAt, now)}</AppText></View></View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver reserva de ${item.publicationTitle}`} onPress={onPress} style={({ pressed }) => [styles.viewButton, pressed && styles.pressed]}><AppText variant="label" style={styles.white}>Ver</AppText></Pressable>
  </View>;
}

export function ExploreCard({ item, zoneName, now, featured = false, onPress }: { item: Publication; zoneName?: string; now: number; featured?: boolean; onPress: () => void }) {
  const live = item.type === 'LIVE';
  const offer = live && item.is_ganga_active;
  const time = item.end_time ? new Date(item.end_time).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }) : undefined;
  return <Pressable accessibilityRole="button" accessibilityLabel={featured ? `Reservar ${item.title}` : `Ver ${item.title}`} accessibilityHint={featured ? 'Abre el detalle para revisar y confirmar tu reserva.' : undefined} onPress={onPress} style={({ pressed }) => [styles.card, offer && styles.offerCard, pressed && styles.pressed]}>
    <View>
      <PublicationPhoto uri={item.image_url} title={item.title} style={[styles.photo, live && styles.livePhoto, featured && styles.heroPhoto]} />
      <View style={styles.badges} pointerEvents="none">
        <ConditionLabel item={item} />
        {offer ? <GangaBadge /> : null}
        <ClosingBadge item={item} now={now} />
      </View>
    </View>
    <View style={styles.body}>
      <AppText variant={featured ? 'heading' : 'cardTitle'}>{item.title}</AppText>
      <View style={styles.priceRow}>
        <PublicationPrice item={item} prominent={featured} />
        <StockBadge item={item} />
      </View>
      <View style={styles.place}><Ionicons name="location-outline" size={16} color={COLORS.textDark} accessible={false} /><AppText variant="place" style={styles.grow}>{item.pickup_mode === 'ARRANGED' ? 'Entrega por acordar' : zoneName ?? 'Zona no disponible'}{featured && time ? ` · hasta ${time}` : ''}</AppText></View>
      {live ? <AppText variant="caption">{featured ? `Vende ${item.seller?.name ?? 'Vendedor'}` : `${time ? `hasta ${time} · ` : ''}${item.seller?.name ?? 'Vendedor'}`}</AppText> : null}
      {featured ? <View style={styles.reserve}><AppText variant="label" style={styles.white}>Reservar</AppText><Ionicons name="arrow-forward" size={18} color={COLORS.white} accessible={false} /></View> : null}
    </View>
  </Pressable>;
}

export function ExploreSkeleton() {
  return <View accessibilityRole="progressbar" accessibilityLabel="Cargando publicaciones" style={styles.skeletonList}>{[0, 1].map(i => <View key={i} style={styles.skeletonCard}><View style={styles.skeletonPhoto} /><View style={styles.body}><View style={styles.skeletonLine} /><View style={styles.skeletonLine} /></View></View>)}</View>;
}

const styles = StyleSheet.create({
  bannerDetails: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: SPACE.sm }, productName: { flexShrink: 1 },
  white: { color: COLORS.white },
  grow: { flex: 1, minWidth: 0 }, chips: { gap: SPACE.sm, paddingBottom: SPACE.md }, chip: { minHeight: 44, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, borderWidth: 1, borderColor: COLORS.textDark, borderRadius: RADIUS.full, justifyContent: 'center' }, chipSelected: { backgroundColor: COLORS.textDark },
  banner: { marginBottom: SPACE.md, padding: SPACE.md, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', gap: SPACE.md }, viewButton: { minHeight: 44, minWidth: 48, padding: SPACE.md, borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center' }, urgentText: { color: COLORS.error },
  card: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.white }, offerCard: { backgroundColor: COLORS.gangaSoft, borderColor: COLORS.ganga, borderRadius: RADIUS.hero }, photo: { width: '100%', aspectRatio: 1, backgroundColor: COLORS.inputBg }, livePhoto: { aspectRatio: 1.6 }, heroPhoto: { aspectRatio: 2.8 },
  badges: { position: 'absolute', left: SPACE.sm, right: SPACE.sm, top: SPACE.sm, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACE.xs },
  body: { padding: SPACE.md, gap: SPACE.xs }, priceRow: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: SPACE.sm }, place: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.xs }, reserve: { minHeight: 48, padding: SPACE.md, backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.full, alignSelf: 'flex-end', flexDirection: 'row', gap: SPACE.sm, alignItems: 'center' },
  skeletonList: { flexDirection: 'row', gap: SPACE.md }, skeletonCard: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden', backgroundColor: COLORS.white }, skeletonPhoto: { height: 110, backgroundColor: COLORS.inputBg }, skeletonLine: { height: 20, marginBottom: SPACE.sm, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.sm }, pressed: { opacity: 0.75 },
});
