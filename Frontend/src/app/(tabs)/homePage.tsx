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
import PublisherCard from '@/components/Publisher_Card';
import PublicationPhoto from '@/components/publication-photo';
import PublicationPrice from '@/components/publication-price';
import AppText from '@/components/app-text';
import PrimaryButton from '@/components/PrimaryButton';
import CustomInput from '@/components/CustomInput';
import OptionGrid from '@/components/option-grid';
import { DataState, InlineMessage, Sheet } from '@/components/feedback';
import {
  MarketplaceShell,
  PageHeader,
  PublishButton,
  TypeSelector,
} from '@/components/marketplace-shell';
import { useMarketplaceSync } from '@/hooks/use-marketplace-sync';
import { useClock } from '@/hooks/use-clock';
import {
  apiMessage,
  categories,
  listPublications,
  zones,
  type Category,
  type Publication,
  type PublicationType,
  type Zone,
} from '@/services/marketplace';

type Filters = { zoneId?: number; categoryId?: number };
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
  const [type, setType] = useState<PublicationType>('LIVE');
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [draft, setDraft] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [catalogError, setCatalogError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
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
        const rows = await listPublications(
          type,
          filters.zoneId,
          filters.categoryId,
          query || undefined,
        );
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
    [type, filters.zoneId, filters.categoryId, query],
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
  useMarketplaceSync(refresh, false);

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
    setCategoryOptions([]);
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
    if (next.zoneId !== filters.zoneId || next.categoryId !== filters.categoryId) {
      generation.current++;
      setItems([]);
      setLoading(true);
      setFilters(next);
    }
    setShowFilters(false);
  }

  const zoneName = zoneOptions.find(z => z.id === filters.zoneId)?.name ?? 'Todas las zonas';
  const categoryName =
    categoryOptions.find(c => c.id === filters.categoryId)?.name ?? 'Todas las categorías';
  const title = type === 'LIVE' ? 'Disponibles ahora' : 'Catálogo';
  const searchChanging = searchText.trim().replace(/\s+/g, ' ') !== query;
  const visibleItems = searchChanging
    ? []
    : items.filter(
        p =>
          p.type !== 'LIVE' ||
          ((!p.end_time || new Date(p.end_time).getTime() > now) && (p.current_stock ?? 0) > 0),
      );
  const featured =
    !query && !searchChanging && !filters.zoneId && !filters.categoryId && !loading && !error
      ? visibleItems.find(item => !!item.image_url)
      : undefined;

  function openPublication(item: Publication) {
    router.push({ pathname: '/publication/[id]', params: { id: item.id } });
  }

  return (
    <MarketplaceShell active="explore">
      <FlatList
        key={columns}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.columns : undefined}
        data={visibleItems}
        keyExtractor={item => item.id}
        extraData={now}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <View style={[styles.cell, { width: `${100 / columns}%` }]}>
            <PublisherCard
              item={item}
              zoneName={zoneOptions.find(z => z.id === item.zone_id)?.name}
              now={now}
              onPress={() => openPublication(item)}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshing={refreshing && !loading}
        onRefresh={() => void refresh()}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <PageHeader
              title="TapCampus"
              brand
              contained
            />
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
                  accessibilityState={{ expanded: showFilters }}
                  onPress={() => {
                    setDraft(filters);
                    setShowFilters(true);
                  }}
                  style={({ pressed }) => [
                    styles.filter,
                    (!!filters.zoneId || !!filters.categoryId) && styles.filterActive,
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
              {filters.zoneId || filters.categoryId ? (
                <View style={styles.summary}>
                  <AppText
                    variant="caption"
                    style={styles.summaryText}
                  >
                    {zoneName}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={styles.summaryText}
                  >
                    {categoryName}
                  </AppText>
                </View>
              ) : null}
            </View>
            {featured ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Descubrir ${featured.title}`}
                onPress={() => openPublication(featured)}
                style={({ pressed }) => [
                  styles.featured,
                  featured.is_ganga_active && styles.featuredOffer,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.featuredBody}>
                  <AppText variant="heading">{featured.title}</AppText>
                  <PublicationPrice
                    item={featured}
                    compact
                  />
                  <View style={styles.featuredAction}>
                    <AppText
                      variant="label"
                      style={styles.featuredLink}
                    >
                      Ver publicación
                    </AppText>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={COLORS.primary}
                      accessible={false}
                    />
                  </View>
                </View>
                <PublicationPhoto
                  uri={featured.image_url}
                  title={featured.title}
                  style={styles.featuredPhoto}
                />
              </Pressable>
            ) : null}
            <View style={styles.listHeading}>
              <AppText variant="heading">{query ? 'Resultados' : title}</AppText>
              {error && visibleItems.length > 0 ? (
                <InlineMessage onRetry={() => void refresh()}>{error}</InlineMessage>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading || searchChanging ? (
            <DataState
              kind="loading"
              title={query || searchChanging ? 'Buscando productos…' : 'Cargando publicaciones…'}
            />
          ) : error ? (
            <DataState
              kind="error"
              title="No se pudieron cargar las publicaciones."
              description={error}
              action="Reintentar"
              onAction={() => void refresh()}
            />
          ) : (
            <View style={styles.empty}>
              <DataState
                kind="empty"
                title="Sin resultados"
                description={
                  query
                    ? `No encontramos publicaciones para «${query}». Prueba otro texto o cambia los filtros.`
                    : 'No hay publicaciones que coincidan con tus filtros.'
                }
                action={query ? 'Limpiar búsqueda' : 'Cambiar filtros'}
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
                title={type === 'LIVE' ? 'Ver Catálogo' : 'Ver Disponibles ahora'}
                onPress={() => changeType(type === 'LIVE' ? 'STATIC' : 'LIVE')}
              />
            </View>
          )
        }
      />
      <PublishButton type={type} />
      <Sheet
        visible={showFilters}
        title="Filtros"
        subtitle={`${title} · Zona y categoría`}
        onClose={() => setShowFilters(false)}
        footer={
          <>
            <PrimaryButton
              title="Ver publicaciones"
              onPress={() => apply(draft)}
            />
            <PrimaryButton
              title="Restablecer filtros"
              variant="secondary"
              onPress={() => setDraft({})}
            />
          </>
        }
      >
        {catalogLoading ? (
          <DataState
            kind="loading"
            title="Cargando filtros…"
          />
        ) : catalogError ? (
          <InlineMessage onRetry={() => setCatalogAttempt(n => n + 1)}>
            {catalogError}
          </InlineMessage>
        ) : (
          <>
            <AppText variant="heading">Zona</AppText>
            <OptionGrid
              options={zoneOptions}
              value={draft.zoneId}
              allLabel="Todas"
              onChange={zoneId => setDraft(previous => ({ ...previous, zoneId }))}
            />
            <AppText variant="heading">Categoría</AppText>
            <OptionGrid
              options={categoryOptions}
              value={draft.categoryId}
              allLabel="Todas"
              onChange={categoryId => setDraft(previous => ({ ...previous, categoryId }))}
            />
            <View style={styles.filterSummary}>
              <AppText variant="caption">
                {zoneOptions.find(z => z.id === draft.zoneId)?.name ?? 'Todas las zonas'}
              </AppText>
              <AppText variant="caption">
                {categoryOptions.find(c => c.id === draft.categoryId)?.name ??
                  'Todas las categorías'}
              </AppText>
            </View>
          </>
        )}
      </Sheet>
    </MarketplaceShell>
  );
}

const styles = StyleSheet.create({
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
  summary: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACE.md },
  summaryText: { flexShrink: 1 },
  list: { paddingHorizontal: SPACE.lg, paddingBottom: 88, flexGrow: 1 },
  listHeader: { paddingHorizontal: SPACE.xs },
  listHeading: { gap: SPACE.sm, paddingTop: SPACE.xl, paddingBottom: SPACE.lg },
  columns: { alignItems: 'stretch' },
  cell: { paddingHorizontal: SPACE.xs, paddingBottom: SPACE.md },
  featured: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  featuredOffer: { backgroundColor: COLORS.gangaSoft },
  featuredBody: {
    flex: 1,
    minWidth: 0,
    padding: SPACE.lg,
    gap: SPACE.sm,
    justifyContent: 'center',
  },
  featuredPhoto: {
    width: '42%',
    minHeight: 168,
    alignSelf: 'stretch',
    backgroundColor: COLORS.inputBg,
  },
  featuredAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    flexWrap: 'wrap',
    paddingTop: SPACE.sm,
  },
  featuredLink: { color: COLORS.primary },
  empty: { gap: SPACE.md },
  filterSummary: {
    padding: SPACE.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    gap: SPACE.xs,
  },
  pressed: { opacity: 0.75 },
});
