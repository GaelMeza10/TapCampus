import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme';
import Card from './Card';

export interface PublicacionMock {
  id: string;
  titulo: string;
  zona: string;
  vendedor: string;
  tipo: 'viva' | 'estatica';
  precio: number;
  gangaActiva: boolean;
  precioGanga?: number | null;
  stock: number;
  horaFin?: string | null;
  categoria: string;
}

export default function TarjetaPublicacion({ item }: { item: PublicacionMock }) {
  const esViva = item.tipo === 'viva';
  const precioMostrar = item.gangaActiva && item.precioGanga ? item.precioGanga : item.precio;

  return (
    <Card style={styles.card}>
      <View style={styles.inner}>
      <View style={[styles.cardImage, esViva ? styles.liveImage : styles.staticImage]}>
        <Ionicons
          name={esViva ? 'fast-food-outline' : 'book-outline'}
          size={32}
          color={COLORS.primary}
        />
        
        <View style={[styles.badge, esViva ? styles.liveBadge : styles.staticBadge]}>
          <Text style={styles.badgeText}>{esViva ? 'EN VIVO' : 'FIJO'}</Text>
        </View>
        
        {item.gangaActiva && (
          <View style={styles.badgeGanga}>
            <Text style={styles.badgeGangaText}>GANGA</Text>
          </View>
        )}
      </View>

      
      <View style={styles.cardBody}>
        <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.textMedium} />
          <Text style={styles.cardMeta}>{item.zona} · {item.vendedor}</Text>
        </View>

        <View style={styles.cardFooter}>
          
          <View>
            {item.gangaActiva && item.precioGanga && (
              <Text style={styles.precioOriginal}>${item.precio}</Text>
            )}
            <Text style={[styles.precio, item.gangaActiva && styles.gangaPrice]}>
              ${precioMostrar}
            </Text>
          </View>

          
          <View style={styles.cardRight}>
            {esViva ? (
              <>
                <View style={styles.stockPill}>
                  <Text style={styles.stockText}>{item.stock} disponibles</Text>
                </View>
                <View style={styles.horaPill}>
                  <Ionicons name="time-outline" size={11} color={COLORS.textMedium} />
                  <Text style={styles.horaText}>{item.horaFin}</Text>
                </View>
              </>
            ) : (
              <View style={styles.stockPill}>
                <Text style={styles.stockText}>{item.categoria}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  inner: {
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
  },
  liveImage: { backgroundColor: COLORS.primarySoft },
  staticImage: { backgroundColor: COLORS.staticSoft },
  liveBadge: { backgroundColor: COLORS.primary },
  staticBadge: { backgroundColor: COLORS.staticAccent },
  gangaPrice: { color: COLORS.ganga },
  cardImage: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  badgeGanga: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.gangaSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeGangaText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.ganga,
  },
  cardBody: {
    padding: 14,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  precio: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  precioOriginal: {
    fontSize: 12,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  stockPill: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  stockText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  horaText: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
});
