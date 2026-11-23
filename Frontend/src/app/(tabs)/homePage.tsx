import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import { CampusHeader, ExploreChips, ExploreCard, ExploreSkeleton, ActiveReservationBanner } from '@/components/explore-ui';
import AppText from '@/components/app-text';
import PrimaryButton from '@/components/PrimaryButton';
import CustomInput from '@/components/CustomInput';
import FilterSheet from '@/components/filter-sheet';
import { DataState, InlineMessage, Sheet } from '@/components/feedback';
import {
  MarketplaceShell,
  MARKETPLACE_SCROLL_PROPS,
  TypeSelector,
} from '@/components/marketplace-shell';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { useClock } from '@/hooks/use-clock';
import { PUBLICATION_COPY } from '@/lib/publication-copy';
import {
  apiMessage,
  categories,
  myReservations,
  type Reservation,
  listPublications,
  zones,
  type Category,
  type Publication,
  type PublicationType,
  type Zone,
} from '@/services/marketplace';

type Filters = { zoneId?: number; categoryId?: number; pickupMode?: 'ARRANGED' };
export default function HomePage() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const columns =
    fontScale > 1.2
      ? 1
      : Math.max(
          1,
          Math.min(
            METRICS.gridMaxColumns,
            Math.floor((width - SPACE.page * 2 + SPACE.md) / (METRICS.gridMinWidth + SPACE.md)),
          ),
        );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationError, setReservationError] = useState('');
  const reservationGeneration = useRef(0);
  const [showPublish, setShowPublish] = useState(false);
  const [type, setType] = useState<PublicationType>('LIVE');
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null);
  const filterTrigger = useRef<ComponentRef<typeof Pressable>>(null);
  const [filters, setFilters] = useState<Filters>({});
  const filtered = !!(filters.zoneId || filters.categoryId || filters.pickupMode);
  const [draft, setDraft] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [catalogError, setCatalogError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const catalogFocused = useRef(false);
  const catalogType = useRef(type);
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [depletedNotice, setDepletedNotice] = useState('');
  useEffect(() => {
    if (!depletedNotice) return;
    const timer = setTimeout(() => setDepletedNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [depletedNotice]);
  const generation = useRef(0);
  const observedEnds = useRef(new Set<string>());
  const now = useClock();

  const refresh = useCallback(
    async (initial = false) => {
      // Si coinciden consultas por socket, búsqueda o filtros, solo aplica la más reciente.
      const request = ++generation.current;
      if (initial) setLoading(true);
      else setRefreshing(true);
      try {
        const args = [type, filters.zoneId, filters.categoryId, query || undefined] as const;
        const rows = filters.pickupMode ? await listPublications(...args, filters.pickupMode) : await listPublications(...args);
        if (request === generation.current) {
          setItems(rows);
          setError('');
        }
      } catch (cause) {
        if (request === generation.current) setError(apiMessage(cause));
      } finally {
        if (request === generation.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [type, filters.zoneId, filters.categoryId, filters.pickupMode, query],
  );

  const applySearch = useCallback(
    (value: string) => {
      const next = value.trim().replace(/\s+/g, ' ');
      if (next === query) return;
      generation.current++;
      setItems([]);
      setLoading(true);
      setError('');
      setQuery(next);
    },
    [query],
  );

  useEffect(() => {
    const timer = setTimeout(() => applySearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText, applySearch]);

  function clearSearch() {
    setSearchText('');
    applySearch('');
    searchRef.current?.focus();
  }

  useEffect(() => {
    void refresh(true);
    return () => {
      generation.current++;
    };
  }, [refresh]);

  // Stock, cierre y oferta disparan una consulta del feed con los filtros actuales.
  // false deja la carga inicial al efecto anterior; connect también vuelve a consultar.
  const refreshReservations = useCallback(async () => {
    const request = ++reservationGeneration.current;
    try {
      const rows = await myReservations();
      if (request === reservationGeneration.current) { setReservations(rows); setReservationError(''); }
    } catch {
      if (request === reservationGeneration.current) setReservationError('No se pudieron actualizar tus reservas.');
    }
  }, []);
  useEffect(() => { void refreshReservations(); return () => { reservationGeneration.current++; }; }, [refreshReservations]);
  const syncAll = useCallback(async () => { await Promise.all([refresh(), refreshReservations()]); }, [refresh, refreshReservations]);
  useMarketplaceSync(syncAll, false, id => {
    const product = items.find(item => item.id === id);
    if (product) {
      setItems(previous => previous.filter(item => item.id !== id));
      setDepletedNotice(`${product.title}: sin unidades disponibles. Tus reservas conservan su plazo.`);
    }
  }, () => {
    if (catalogFocused.current) setCatalogAttempt(value => value + 1);
    catalogFocused.current = true;
  });

  // El reloj detecta horarios vencidos y reconsulta sin esperar el evento del socket.
  useEffect(() => {
    const ended = items.filter(
      p =>
        p.type === 'LIVE' &&
        p.end_time &&
        new Date(p.end_time).getTime() <= now &&
        !observedEnds.current.has(`${p.id}:${p.end_time}`),
    );
    for (const p of ended) observedEnds.current.add(`${p.id}:${p.end_time}`);
    if (ended.length) void refresh();
  }, [items, now, refresh]);

  useEffect(() => {
    let current = true;
    setCatalogLoading(true);
    if (catalogType.current !== type) { setCategoryOptions([]); catalogType.current = type; }
    setCatalogError('');
    void Promise.all([zones(), categories(type)])
      .then(([z, c]) => {
        if (current) {
          setZoneOptions(z);
          setCategoryOptions(c);
        }
      })
      .catch(cause => {
        if (current) setCatalogError(apiMessage(cause));
      })
      .finally(() => {
        if (current) setCatalogLoading(false);
      });
    return () => {
      current = false;
    };
  }, [type, catalogAttempt]);

  function changeType(next: PublicationType) {
    if (next === type) return;
    generation.current++;
    setItems([]);
    setLoading(true);
    setError('');
    setType(next);
    setFilters(previous => ({ zoneId: previous.zoneId }));
  }

  function apply(next: Filters) {
    if (next.zoneId !== filters.zoneId || next.categoryId !== filters.categoryId || next.pickupMode !== filters.pickupMode) {
      generation.current++;
      setItems([]);
      setLoading(true);
      setFilters(next);
    }
    setShowFilters(false);
  }

  const zoneName = filters.pickupMode === 'ARRANGED' ? 'Entrega por acordar' : zoneOptions.find(z => z.id === filters.zoneId)?.name ?? 'Todas las zonas';
  const categoryName =
    categoryOptions.find(c => c.id === filters.categoryId)?.name ?? 'Todas las categorías';
  const title = PUBLICATION_COPY[type].label;
  const searchChanging = searchText.trim().replace(/\s+/g, ' ') !== query;
  const visibleItems = searchChanging
    ? []
    : items.filter(
        p =>
          p.type !== 'LIVE' ||
          ((!p.end_time || new Date(p.end_time).getTime() > now) && (p.current_stock ?? 0) > 0),
      );
  const featured = type === 'LIVE' && !searchChanging && !loading && !error
    ? visibleItems.find(item => item.is_ganga_active)
    : undefined;
  const activeReservation = reservations.filter(r => r.status === 'ACTIVE' && new Date(r.expiresAt).getTime() > now)
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())[0];

  function openPublication(item: Publication) {
    router.push({ pathname: '/publication/[id]', params: { id: item.id } });
  }

  return (
    <MarketplaceShell active="explore">
      <FlatList
        {...MARKETPLACE_SCROLL_PROPS}
        maintainVisibleContentPosition={{ minIndexForVisible: 1, autoscrollToTopThreshold: SPACE.page }}
        key={columns}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.columns : undefined}
        data={visibleItems.filter(item => item.id !== featured?.id)}
        keyExtractor={item => item.id}
        extraData={now}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <View style={[styles.cell, columns === 1 ? styles.singleCell : { maxWidth: `${100 / columns}%` }]}>
            <ExploreCard
              item={item}
              zoneName={zoneOptions.find(z => z.id === item.zone_id)?.name}
              now={now}
              onPress={() => openPublication(item)}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshing={refreshing && !loading}
        onRefresh={() => void syncAll()}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <CampusHeader />
            <View style={styles.headerContent}>
            {activeReservation ? <ActiveReservationBanner item={activeReservation} now={now} onPress={() => router.navigate('/reservations')} /> : null}
            {reservationError ? <InlineMessage onRetry={() => void refreshReservations()}>{reservationError}</InlineMessage> : null}
            <View style={styles.controls}>
              <View style={styles.searchRow}>
                <View style={styles.searchField}>
                  <CustomInput
                    ref={searchRef}
                    icon="search-outline"
                    iconColor={COLORS.primary}
                    surface="white"
                    accessibilityLabel="Buscar productos"
                    accessibilityHint="Busca por título o descripción."
                    placeholder="Buscar productos"
                    value={searchText}
                    maxLength={100}
                    autoCapitalize="none"
                    returnKeyType="search"
                    onChangeText={setSearchText}
                    onSubmitEditing={() => {
                      applySearch(searchText);
                      Keyboard.dismiss();
                    }}
                    trailingAction={
                      searchText ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Limpiar texto de búsqueda"
                          onPress={clearSearch}
                          style={styles.clearSearch}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={22}
                            color={COLORS.primary}
                            accessible={false}
                          />
                        </Pressable>
                      ) : undefined
                    }
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Filtros. ${zoneName}. ${categoryName}`}
                  ref={filterTrigger}
                  accessibilityState={{ expanded: showFilters }}
                  onPress={() => {
                    setDraft(filters);
                    setShowFilters(true);
                  }}
                  style={({ pressed }) => [
                    styles.filter,
                    (!!filters.zoneId || !!filters.categoryId || !!filters.pickupMode) && styles.filterActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="options-outline"
                    size={22}
                    color={COLORS.primary}
                    accessible={false}
                  />
                </Pressable>
              </View>
              <TypeSelector
                value={type}
                onChange={changeType}
              />
              <AppText variant="caption">{type === 'LIVE' ? 'Vendedores que están en el campus, con horario y lugar.' : 'Artículos publicados. Contacta al vendedor por WhatsApp.'}</AppText>
              {catalogError ? <InlineMessage onRetry={() => setCatalogAttempt(n => n + 1)}>{catalogError}</InlineMessage> : null}
              <ExploreChips options={type === 'LIVE' ? zoneOptions : categoryOptions} value={type === 'LIVE' ? filters.zoneId : filters.categoryId} allLabel={type === 'LIVE' ? 'Todas las zonas' : 'Todo'} onChange={id => apply({ ...filters, ...(type === 'LIVE' ? { zoneId: id } : { categoryId: id }) })} />
            </View>
            {featured ? <ExploreCard item={featured} zoneName={zoneOptions.find(z => z.id === featured.zone_id)?.name} now={now} featured onPress={() => openPublication(featured)} /> : null}
            <View style={styles.listHeading}>
              {query ? <AppText variant="heading">Resultados</AppText> : null}
              {error && visibleItems.length > 0 ? (
                <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage>
              ) : null}
            </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading || searchChanging ? (
            <View style={styles.empty}><ExploreSkeleton /></View>
          ) : error ? (
            <View style={styles.empty}><DataState
              kind="error"
              title="No se pudieron cargar las publicaciones."
              description={error}
              action="Reintentar"
              onAction={() => void refresh()}
            /></View>
          ) : visibleItems.length === 0 ? (
            <View style={styles.empty}>
              <DataState
                kind="empty"
                title={
                  query || filtered
                    ? 'Sin resultados'
                    : type === 'LIVE'
                      ? 'Nadie vende ahora'
                      : 'Aún no hay productos'
                }
                description={
                  query
                    ? `No encontramos publicaciones para «${query}». Prueba otro texto o cambia los filtros.`
                    : filtered
                      ? 'No hay publicaciones que coincidan con tus filtros.'
                      : type === 'LIVE'
                        ? 'Nadie vende ahora. Mira los productos'
                        : 'Todavía nadie ha publicado productos. Vuelve más tarde o publica el tuyo con Vender.'
                }
                // Sin búsqueda ni filtros no hay nada que limpiar: solo queda el botón de cambiar de pestaña.
                action={query ? 'Limpiar búsqueda' : filtered ? 'Cambiar filtros' : undefined}
                onAction={
                  query
                    ? clearSearch
                    : () => {
                        setDraft(filters);
                        setShowFilters(true);
                      }
                }
              />
              <PrimaryButton
                variant="secondary"
                title={`Ver ${PUBLICATION_COPY[type === 'LIVE' ? 'STATIC' : 'LIVE'].label}`}
                onPress={() => changeType(type === 'LIVE' ? 'STATIC' : 'LIVE')}
              />
            </View>
          ) : undefined
        }
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Vender" onPress={() => setShowPublish(true)} style={({ pressed }) => [styles.sell, pressed && styles.pressed]}><Ionicons name="add" size={24} color={COLORS.white} accessible={false} /><AppText variant="label" style={styles.sellText}>Vender</AppText></Pressable>
      <Sheet visible={showPublish} title="¿Qué quieres publicar?" onClose={() => setShowPublish(false)}>
        {(['LIVE', 'STATIC'] as const).map(publicationType => <View key={publicationType} style={styles.publishOption}>
          <PrimaryButton title={PUBLICATION_COPY[publicationType].label} variant={publicationType === 'LIVE' ? 'primary' : 'secondary'} onPress={() => { setShowPublish(false); router.push({ pathname: '/publication/edit', params: { type: publicationType } }); }} />
          <AppText variant="caption">{PUBLICATION_COPY[publicationType].hint}</AppText>
        </View>)}
      </Sheet>
      {depletedNotice ? <View style={styles.availabilityNotice} accessibilityLiveRegion="polite"><AppText variant="caption">{depletedNotice}</AppText></View> : null}
      <FilterSheet visible={showFilters} type={type} query={query} zoneOptions={zoneOptions} categoryOptions={categoryOptions} returnFocusRef={filterTrigger}
        catalogLoading={catalogLoading} catalogError={catalogError} onRetryCatalog={() => setCatalogAttempt(n => n + 1)}
        draft={draft} onDraftChange={setDraft} onApply={() => apply(draft)} onClose={() => setShowFilters(false)} refreshToken={items} now={now} />
    </MarketplaceShell>
  );
}

const styles = StyleSheet.create({
  availabilityNotice: { position: 'absolute', bottom: 84, left: SPACE.page, right: SPACE.page, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.md, padding: SPACE.md },
  publishOption: { gap: SPACE.xs },
  clearSearch: {
    minWidth: Platform.OS === 'android' ? 48 : 44,
    minHeight: Platform.OS === 'android' ? 48 : 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { gap: SPACE.md, paddingBottom: SPACE.lg },
  searchRow: { flexDirection: 'row', alignItems: 'stretch', gap: SPACE.md },
  searchField: { flex: 1, minWidth: 0 },
  filter: {
    width: METRICS.control,
    minHeight: METRICS.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  list: { paddingBottom: 100, flexGrow: 1 },
  listHeader: {},
  headerContent: { paddingHorizontal: SPACE.page },
  sell: { position: 'absolute', bottom: SPACE.lg, right: SPACE.page, minHeight: 52, paddingHorizontal: SPACE.lg, flexDirection: 'row', gap: SPACE.sm, alignItems: 'center', backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.md },
  sellText: { color: COLORS.white },
  listHeading: { gap: SPACE.sm, paddingBottom: SPACE.md },
  columns: { alignItems: 'stretch', paddingHorizontal: SPACE.page - SPACE.md / 2 },
  cell: { paddingHorizontal: SPACE.md / 2, paddingBottom: SPACE.md, flex: 1 },
  singleCell: { marginHorizontal: SPACE.page - SPACE.md / 2 },
  empty: { gap: SPACE.md, paddingHorizontal: SPACE.page },
  pressed: { opacity: 0.75 },
});
