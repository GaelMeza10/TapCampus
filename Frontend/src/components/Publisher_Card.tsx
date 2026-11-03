import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { COLORS } from '@/theme';
import type { Publication } from '@/services/marketplace';

export default function PublisherCard({ item, onPress }: { item: Publication; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title}`} onPress={onPress}>
    <Card style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.type}>{item.type === 'LIVE' ? 'EN VIVO' : 'ESTÁTICO'}{item.is_ganga_active ? ' · GANGA' : ''}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta}>{item.seller.name}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>${item.price}</Text>
          {item.type === 'LIVE' ? <Text style={styles.stock}>{item.current_stock} disponibles</Text> : null}
        </View>
      </View>
    </Card>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { marginBottom: 12, overflow: 'hidden' }, image: { width: '100%', height: 150, backgroundColor: COLORS.primarySoft },
  body: { padding: 16, gap: 5 }, type: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  title: { color: COLORS.textDark, fontSize: 17, fontWeight: '700' }, meta: { color: COLORS.textMedium },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: COLORS.primaryDark, fontSize: 20, fontWeight: '800' }, stock: { color: COLORS.textMedium },
});
