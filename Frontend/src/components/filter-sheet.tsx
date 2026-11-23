import { useEffect, useState, type ComponentRef, type RefObject, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADIUS, SPACE } from '@/theme';
import { apiMessage, listPublications, type Publication, type PublicationType, type Zone } from '@/services/marketplace';
import AppText from './app-text';
import PrimaryButton from './PrimaryButton';
import { DataState, InlineMessage, Sheet } from './feedback';
import { PUBLICATION_COPY } from '@/lib/publication-copy';

export type PublicationFilters = { zoneId?: number; categoryId?: number; pickupMode?: 'ARRANGED' };

function Facets({ title, options, value, counts, onChange, extra }: { title: string; options: Zone[]; value?: number | null; counts?: (id?: number) => number; onChange: (id?: number) => void; extra?: ReactNode }) {
  return <View style={styles.section}>
    <AppText variant="heading" accessibilityRole="header">{title}</AppText>
    <AppText variant="caption">Publicaciones disponibles según los otros filtros.</AppText>
    <View accessibilityRole="radiogroup" accessibilityLabel={title} style={styles.chips}>
      {[{ id: undefined, name: title === 'Zona' ? 'Todas las zonas' : 'Todas' }, ...options].map(option => {
        const count = counts?.(option.id);
        const selected = option.id === value;
        const disabled = count === 0 && !selected;
        return <Pressable key={option.id ?? 'all'} accessibilityRole="radio" accessibilityLabel={option.name}
          accessibilityHint={count === undefined ? undefined : `${count} ${count === 1 ? 'publicación disponible' : 'publicaciones disponibles'}`}
          accessibilityState={{ checked: selected, disabled }} disabled={disabled}
          onPress={() => onChange(option.id)} style={({ pressed }) => [styles.chip, selected && styles.selected, disabled && styles.disabled, pressed && styles.pressed]}>
          {selected ? <Ionicons name="checkmark" size={16} color={COLORS.white} accessible={false} /> : null}
          <AppText style={[styles.chipText, selected && styles.white]}>{option.name}{count === undefined ? '' : `  ${count}`}</AppText>
        </Pressable>;
      })}
      {extra}
    </View>
  </View>;
}

export default function FilterSheet({ visible, type, query, zoneOptions, categoryOptions, catalogLoading, catalogError, onRetryCatalog,
  draft, onDraftChange, onApply, onClose, refreshToken, now, returnFocusRef }: {
  visible: boolean; type: PublicationType; query: string; zoneOptions: Zone[]; categoryOptions: Zone[];
  catalogLoading: boolean; catalogError: string; onRetryCatalog: () => void;
  draft: PublicationFilters; onDraftChange: (filters: PublicationFilters) => void; onApply: () => void; onClose: () => void;
  refreshToken: Publication[]; now: number;
  returnFocusRef?: RefObject<ComponentRef<typeof Pressable> | null>;
}) {
  const [rows, setRows] = useState<Publication[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let current = true;
    setRows(undefined); setLoading(true); setError('');
    void listPublications(type, undefined, undefined, query || undefined).then(result => {
      if (current) setRows(result);
    }).catch(cause => { if (current) setError(apiMessage(cause)); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [visible, type, query, refreshToken, attempt]);
  const available = rows?.filter(row => row.type !== 'LIVE' || ((row.current_stock ?? 0) > 0 && (!row.end_time || new Date(row.end_time).getTime() > now)));
  const zones = available?.filter(row => !draft.categoryId || row.category_id === draft.categoryId);
  const matchesLocation = (row: Publication) => draft.pickupMode === 'ARRANGED' ? row.pickup_mode === 'ARRANGED' : !draft.zoneId || row.zone_id === draft.zoneId;
  const categories = available?.filter(matchesLocation);
  const count = available?.filter(row => matchesLocation(row) && (!draft.categoryId || row.category_id === draft.categoryId)).length;
  const arrangedCount = zones?.filter(row => row.pickup_mode === 'ARRANGED').length;
  return <Sheet visible={visible} title="Filtros" appearance="filters" returnFocusRef={returnFocusRef}
    subtitle={`${PUBLICATION_COPY[type].label} · zona y categoría`}
    onClose={onClose} footer={<>
      <PrimaryButton accessibilityLabel="Ver publicaciones" accessibilityHint={count === undefined ? undefined : `${count} ${count === 1 ? 'publicación disponible' : 'publicaciones disponibles'}`} title={count === undefined ? 'Ver publicaciones' : `Ver ${count} ${count === 1 ? 'publicación' : 'publicaciones'}`} onPress={onApply} style={styles.apply} />
      <PrimaryButton title="Restablecer filtros" variant="ghost" onPress={() => onDraftChange({})} style={styles.reset} />
    </>}>
    {catalogLoading ? <DataState kind="loading" title="Cargando filtros…" /> : catalogError ? <InlineMessage onRetry={onRetryCatalog}>{catalogError}</InlineMessage> : <>
      {loading ? <AppText accessibilityRole="progressbar">Actualizando disponibilidad…</AppText> : null}
      {error ? <InlineMessage onRetry={() => setAttempt(n => n + 1)}>No pudimos actualizar los conteos. Puedes aplicar los filtros o reintentar. {error}</InlineMessage> : null}
      <Facets title="Zona" options={zoneOptions} value={draft.pickupMode === 'ARRANGED' ? null : draft.zoneId} counts={zones ? id => zones.filter(row => !id || row.zone_id === id).length : undefined} onChange={zoneId => onDraftChange({ ...draft, zoneId, pickupMode: undefined })}
        extra={type === 'STATIC' ? <Pressable accessibilityRole="radio" accessibilityLabel="Entrega por acordar" accessibilityState={{ checked: draft.pickupMode === 'ARRANGED', disabled: arrangedCount === 0 && draft.pickupMode !== 'ARRANGED' }} disabled={arrangedCount === 0 && draft.pickupMode !== 'ARRANGED'} onPress={() => onDraftChange({ ...draft, zoneId: undefined, pickupMode: 'ARRANGED' })} style={[styles.chip, draft.pickupMode === 'ARRANGED' && styles.selected, arrangedCount === 0 && draft.pickupMode !== 'ARRANGED' && styles.disabled]}><AppText style={draft.pickupMode === 'ARRANGED' && styles.white}>Entrega por acordar{arrangedCount === undefined ? '' : `  ${arrangedCount}`}</AppText></Pressable> : null} />
      <Facets title="Categoría" options={categoryOptions} value={draft.categoryId} counts={categories ? id => categories.filter(row => !id || row.category_id === id).length : undefined} onChange={categoryId => onDraftChange({ ...draft, categoryId })} />
    </>}
  </Sheet>;
}

const styles = StyleSheet.create({
  section: { gap: SPACE.sm }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.sm },
  chip: { minHeight: 48, maxWidth: '100%', borderWidth: 1, borderColor: COLORS.textDark, borderRadius: RADIUS.full, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, flexDirection: 'row', alignItems: 'center', gap: SPACE.xs },
  selected: { backgroundColor: COLORS.textDark }, chipText: { flexShrink: 1 }, white: { color: COLORS.white }, disabled: { opacity: 0.5 }, pressed: { opacity: 0.75 },
  apply: { borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryDark }, reset: { borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.textDark },
});
