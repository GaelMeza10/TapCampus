import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, RADIUS, SHADOW } from './styles/theme';
import { PUBLICACIONES, ZONAS } from '@/constants/publications';
import TarjetaPublicacion from '@/components/Publisher_Card';

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function HomePage() {
  const [zonaActiva, setZonaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  const publicacionesFiltradas = PUBLICACIONES.filter((p) => {
    const coincideZona = zonaActiva === 'Todas' || p.zona === zonaActiva;
    const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideZona && coincideBusqueda;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitulo}>TapCampus</Text>
          </View>
          <TouchableOpacity style={styles.headerAvatar}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar publicaciones..."
            placeholderTextColor={COLORS.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zonaScroll}
        >
          {ZONAS.map((zona) => (
            <TouchableOpacity
              key={zona}
              style={[styles.zonaChip, zonaActiva === zona && styles.zonaChipActivo]}
              onPress={() => setZonaActiva(zona)}
            >
              <Text style={[styles.zonaChipText, zonaActiva === zona && styles.zonaChipTextActivo]}>
                {zona}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.seccionHeader}>
          <View style={styles.seccionTituloRow}>
            <View style={styles.dot} />
            <Text style={styles.seccionTitulo}>En vivo ahora</Text>
          </View>
          <Text style={styles.seccionCount}>
            {publicacionesFiltradas.filter((p) => p.tipo === 'viva').length} activas
          </Text>
        </View>

        {publicacionesFiltradas
          .filter((p) => p.tipo === 'viva')
          .map((item) => (
            <TarjetaPublicacion key={item.id} item={item} />
          ))}

        <View style={[styles.seccionHeader, { marginTop: 8 }]}>
          <Text style={styles.seccionTitulo}>Material escolar</Text>
          <Text style={styles.seccionCount}>
            {publicacionesFiltradas.filter((p) => p.tipo === 'estatica').length} artículos
          </Text>
        </View>

        {publicacionesFiltradas
          .filter((p) => p.tipo === 'estatica')
          .map((item) => (
            <TarjetaPublicacion key={item.id} item={item} />
          ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textMedium,
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
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Buscador
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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

  // Zonas
  zonaScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  zonaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#fff',
  },

  // Sección
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
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
    shadowOpacity: 0.25,
  },
});