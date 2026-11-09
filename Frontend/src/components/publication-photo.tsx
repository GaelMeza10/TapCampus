import { useState } from 'react';
import { Image, type ImageStyle } from 'expo-image';
import { StyleSheet, View, type StyleProp } from 'react-native';
import AppText from './app-text';

/** La fotografía es opcional para leer el producto, también cuando falla su descarga. */
export default function PublicationPhoto({ uri, title, style }: { uri?: string | null; title: string; style: StyleProp<ImageStyle> }) {
  const [failedUri, setFailedUri] = useState<string>();
  if (!uri || uri === failedUri) return <View style={[style, styles.fallback]} accessible accessibilityRole="image" accessibilityLabel={`Foto no disponible de ${title}`}><AppText variant="caption">Sin foto</AppText></View>;
  return <Image source={{ uri }} style={style} contentFit="cover" onError={() => setFailedUri(uri)} accessibilityLabel={`Foto de ${title}`} />;
}

const styles = StyleSheet.create({ fallback: { alignItems: 'center', justifyContent: 'center' } });
