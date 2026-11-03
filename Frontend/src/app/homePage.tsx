import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/api.constants';
import { COLORS, RADIUS } from '@/theme';
import PublisherCard from '@/components/Publisher_Card';
import { apiMessage, categories, listPublications, zones, type Category, type Publication, type PublicationType, type Zone } from '@/services/marketplace';

export default function HomePage() {
  const router = useRouter();
  const [type, setType] = useState<PublicationType>('LIVE');
  const [zoneId, setZoneId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async (initial = false) => {
    if (initial) setLoading(true); else setRefreshing(true);
    try { setItems(await listPublications(type, zoneId, categoryId)); setError(''); }
    catch (cause) { setError(apiMessage(cause)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [type, zoneId, categoryId]);
  useEffect(() => { void refresh(true); }, [refresh]);
  useEffect(() => { void zones().then(setZoneOptions).catch(cause => setError(apiMessage(cause))); }, []);
  useEffect(() => { void categories(type).then(setCategoryOptions).catch(cause => setError(apiMessage(cause))); }, [type]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  useFocusEffect(useCallback(() => {
    const socket = io(API_BASE_URL, { autoConnect: true });
    const sync = () => { void refresh(); };
    socket.on('connect', sync);
    socket.on('stock_updated', sync);
    socket.on('publication_expired', sync);
    socket.on('ganga_activated', sync);
    const app = AppState.addEventListener('change', state => { if (state === 'active') sync(); });
    return () => { app.remove(); socket.disconnect(); };
  }, [refresh]));
  const changeType = (next: PublicationType) => { setType(next); setCategoryId(undefined); };
  return <SafeAreaView style={styles.screen}>
    <View style={styles.top}>
      <Text style={styles.heading}>TapCampus</Text>
      <View style={styles.nav}><Pressable accessibilityRole="button" onPress={() => router.push('/reservations')}><Text style={styles.link}>Reservas</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/sales')}><Text style={styles.link}>Mis Ventas</Text></Pressable></View>
    </View>
    <View style={styles.tabs}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: type === 'LIVE' }} style={[styles.tab, type === 'LIVE' && styles.activeTab]} onPress={() => changeType('LIVE')}><Text style={styles.tabText}>En Vivo</Text></Pressable>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: type === 'STATIC' }} style={[styles.tab, type === 'STATIC' && styles.activeTab]} onPress={() => changeType('STATIC')}><Text style={styles.tabText}>Estático</Text></Pressable>
    </View>
    <FlatList data={items} keyExtractor={item => item.id}
      renderItem={({ item }) => <PublisherCard item={item} onPress={() => router.push({ pathname: '/publication/[id]', params: { id: item.id } })} />}
      contentContainerStyle={styles.list} refreshing={refreshing} onRefresh={() => void refresh()}
      ListHeaderComponent={<View>
        <Text style={styles.filterLabel}>Zona</Text>
        <FlatList horizontal data={[{ id: 0, name: 'Todas' }, ...zoneOptions]} keyExtractor={item => String(item.id)} showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Pressable style={[styles.chip, (zoneId ?? 0) === item.id && styles.selectedChip]} onPress={() => setZoneId(item.id || undefined)}><Text style={styles.chipText}>{item.name}</Text></Pressable>} />
        <Text style={styles.filterLabel}>Categoría</Text>
        <FlatList horizontal data={[{ id: 0, name: 'Todas', type }, ...categoryOptions]} keyExtractor={item => String(item.id)} showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Pressable style={[styles.chip, (categoryId ?? 0) === item.id && styles.selectedChip]} onPress={() => setCategoryId(item.id || undefined)}><Text style={styles.chipText}>{item.name}</Text></Pressable>} />
        {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void refresh()}><Text style={styles.link}>Reintentar</Text></Pressable></View> : null}
      </View>}
      ListEmptyComponent={loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.empty}>{error ? 'No se pudieron cargar las publicaciones.' : 'No hay publicaciones para estos filtros.'}</Text>}
    />
    <Pressable style={styles.create} accessibilityRole="button" onPress={() => router.push('/publication/edit')}><Text style={styles.createText}>+ Publicar</Text></Pressable>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  nav: { flexDirection: 'row', gap: 12 },
  heading: { color: COLORS.textDark, fontSize: 24, fontWeight: '800' }, link: { color: COLORS.primaryDark, fontWeight: '700' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 8 }, tab: { flex: 1, alignItems: 'center', padding: 12, borderBottomWidth: 2, borderColor: COLORS.border },
  activeTab: { borderColor: COLORS.primary }, tabText: { color: COLORS.textDark, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 90, flexGrow: 1 }, filterLabel: { color: COLORS.textMedium, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  chip: { backgroundColor: COLORS.white, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  selectedChip: { backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primary }, chipText: { color: COLORS.textDark },
  error: { padding: 12, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, marginBottom: 8 }, errorText: { color: COLORS.error },
  empty: { textAlign: 'center', color: COLORS.textMedium, padding: 30 },
  create: { position: 'absolute', bottom: 28, right: 20, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 22, paddingVertical: 16 },
  createText: { color: COLORS.white, fontWeight: '800' },
});
