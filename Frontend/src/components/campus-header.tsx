import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import AppText from './app-text';
import { COLORS, SPACE } from '@/theme';
import { useLayoutFrame } from '@/lib/layout-diagnostics';

// Silueta geométrica decorativa basada en docs/design/refs; no representa un producto.
const campus = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="64" viewBox="0 0 150 64"><path fill="#FFFFFF" opacity=".12" d="M0 39 40 9 66 24 94 0 150 40v24H0z"/><path fill="#FFFFFF" d="M24 31h22V20h49v11h18v29H24zm6 8v4h77v-4z"/><path fill="none" stroke="#FFFFFF" stroke-width="2" d="M128 64V16m0 0q-9-17-17-5m17 5q9-17 20-7m-20 7q-11-8-17 4m17-4q11-8 22 5M10 64V40m0 0Q0 35 0 45m10-5q9-5 12 4"/></svg>')}`;

export function CampusHeader() {
  const diagnostic = useLayoutFrame('campus-header');
  return <View {...diagnostic} style={styles.header}>
    <View style={styles.brand}><AppText variant="brand" style={styles.white}>TapCampus</AppText><AppText variant="caption" style={styles.white}>Campus Ensenada</AppText></View>
    <Image source={{ uri: campus }} style={styles.campus} contentFit="contain" accessible={false} />
  </View>;
}


const styles = StyleSheet.create({
  header: { minHeight: 88, backgroundColor: COLORS.primaryDark, borderBottomLeftRadius: 32, paddingHorizontal: SPACE.page, paddingVertical: SPACE.md, justifyContent: 'center', overflow: 'hidden', marginBottom: SPACE.md },
  brand: { zIndex: 1, alignSelf: 'flex-start' }, white: { color: COLORS.white }, campus: { position: 'absolute', right: 0, bottom: 0, width: 150, height: 64 },
});
