import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../app/styles/theme';

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
    //tarjeta
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      {}
      <View style={[styles.cardImage, { backgroundColor: esViva ? '#E8F5EE' : '#F0EDE8' }]}>
        <Ionicons
          name={esViva ? 'fast-food-outline' : 'book-outline'}
          size={32}
          color={COLORS.primary}
        />
        
        <View style={[styles.badge, { backgroundColor: esViva ? COLORS.primary : '#8B7355' }]}>
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
            <Text style={[styles.precio, item.gangaActiva && { color: '#E85D24' }]}>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.card,
  },
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
    color: '#fff',
    letterSpacing: 0.5,
  },
  badgeGanga: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeGangaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E85D24',
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
    backgroundColor: '#E8F5EE',
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