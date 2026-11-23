import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { COLORS, RADIUS } from '@/theme';

// This material is reserved for navigation. Readability wins over transparency.
export default function TabBarMaterial({ children }: { children: ReactNode }) {
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let current = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
      if (current) setReduceTransparency(value);
    }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => { current = false; listener.remove(); };
  }, []);

  const glass = Platform.OS === 'ios' && !reduceTransparency && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  return glass
    ? <GlassView testID="tab-bar-glass" glassEffectStyle="regular" colorScheme="dark" tintColor={COLORS.navigationGlassTint} style={styles.material}>{children}</GlassView>
    : <View testID="tab-bar-solid" style={[styles.material, styles.solid]}>{children}</View>;
}

const styles = StyleSheet.create({
  material: { borderRadius: RADIUS.hero, overflow: 'hidden' },
  solid: { backgroundColor: COLORS.navigationBar },
});
