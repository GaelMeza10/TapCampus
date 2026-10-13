import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  SectionList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { PUBLICACIONES, ZONAS } from '@/constants/publications';
import TarjetaPublicacion, { PublicacionMock } from '@/components/Publisher_Card';
import { useAuth } from '@/context/AuthContext';

interface Seccion {
  title: string;
  count: number;
  esViva: boolean;
  data: PublicacionMock[];
}
//Buscador y los chips de las zonas 
function ListaHeader({
  busqueda,
  setBusqueda,
  zonaActiva,
  setZonaActiva,
}: {
  busqueda: string;
  setBusqueda: (v: string) => void;
  zonaActiva: string;
  setZonaActiva: (v: string) => void;
}) {
  return (
    <View>
      
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar publicaciones..."
          placeholderTextColor={COLORS.textLight}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      
      <SectionList
        horizontal
        sections={[{ data: ZONAS }]}
        keyExtractor={(zona) => zona}
        renderItem={({ item: zona }) => (
          <TouchableOpacity
            style={[styles.zonaChip, zonaActiva === zona && styles.zonaChipActivo]}
            onPress={() => setZonaActiva(zona)}
          >
            <Text style={[styles.zonaChipText, zonaActiva === zona && styles.zonaChipTextActivo]}>
              {zona}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.zonaScroll}
      />
    </View>
  );
}
//Titulo de cada grupo
const SeccionHeader = React.memo(function SeccionHeader({ seccion }: { seccion: Seccion }) {
  return (
    <View style={styles.seccionHeader}>
      <View style={styles.seccionTituloRow}>
        {seccion.esViva && <View style={styles.dot} />}
        <Text style={styles.seccionTitulo}>{seccion.title}</Text>
      </View>
      <Text style={styles.seccionCount}>
        {seccion.count} {seccion.esViva ? 'activas' : 'artículos'}
      </Text>
    </View>
  );
});
//Cuando no hay articulos
function ListaVacia({ busqueda }: { busqueda: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
      <Text style={styles.emptyText}>
        {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay publicaciones disponibles'}
      </Text>
    </View>
  );
}

export default function HomePage() {
  const [zonaActiva, setZonaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const { logout } = useAuth();
  //filtro publicaciones
  const secciones = useMemo<Seccion[]>(() => {
    const filtradas = PUBLICACIONES.filter((p) => {
      const coincideZona = zonaActiva === 'Todas' || p.zona === zonaActiva;
      const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase());
      return coincideZona && coincideBusqueda;
    });

    const vivas = filtradas.filter((p) => p.tipo === 'viva');
    const estaticas = filtradas.filter((p) => p.tipo === 'estatica');

    return [
      { title: 'En vivo ahora', count: vivas.length, esViva: true, data: vivas },
      { title: 'Material escolar', count: estaticas.length, esViva: false, data: estaticas },
    ];
  }, [zonaActiva, busqueda]);
  
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const renderItem = useCallback(
    ({ item }: { item: PublicacionMock }) => <TarjetaPublicacion item={item} />,
    []
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Seccion }) => <SeccionHeader seccion={section} />,
    []
  );

  const keyExtractor = useCallback((item: PublicacionMock) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitulo}>TapCampus</Text>
        <TouchableOpacity style={styles.headerAvatar} onPress={handleLogout} activeOpacity={0.75}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <SectionList<PublicacionMock, Seccion>
        sections={secciones}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <ListaHeader
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            zonaActiva={zonaActiva}
            setZonaActiva={setZonaActiva}
          />
        }
        ListEmptyComponent={<ListaVacia busqueda={busqueda} />}
        ListFooterComponent={<View style={styles.listFooter} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        getItemLayout={(_data, index) => ({
          length: 182, 
          offset: 182 * index,
          index,
        })}
      />

      
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Navbar
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buscador
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 48,
    ...SHADOW.card,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },

  // Chips de zona
  zonaScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  zonaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  zonaChipActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  zonaChipText: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  zonaChipTextActivo: {
    color: COLORS.white,
  },

  // Header de sección
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  seccionTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seccionCount: {
    fontSize: 12,
    color: COLORS.textMedium,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  listFooter: { height: 100 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
});
