import { createContext, useCallback, useContext, useEffect, useId, useRef, type ComponentRef } from 'react';
import { AppState, Keyboard, Platform, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Development-only, no user/profile/contact data. Metro receives the same bounded trace.
const enabled = __DEV__ && Platform.OS !== 'web' && process.env.NODE_ENV !== 'test' && process.env.EXPO_PUBLIC_LAYOUT_DIAGNOSTICS !== '0';
// The choice is constant for this runtime; production/test trees need no navigation subscription.
const useDiagnosticFocus = enabled ? useFocusEffect : useEffect;
export const LayoutSceneContext = createContext('standalone');
const frames = new Map<string, { view: ComponentRef<typeof View>; scene: string }>();
let activeTab = '';
const trace: unknown[] = [];
if (enabled) Object.assign(globalThis, { __tapCampusLayoutTrace: trace });
export function recordLayout(event: string, data: unknown) {
  if (!enabled) return;
  const row = { at: Date.now(), event, tab: activeTab, data };
  trace.push(row);
  if (trace.length > 400) trace.shift();
  console.info('[TapCampusLayout]', JSON.stringify(row));
}
function sample(event: string) {
  if (!enabled) return;
  for (const [name, { view, scene }] of frames) {
    if (scene === 'standalone' || scene === activeTab) view.measureInWindow((x, y, width, height) => recordLayout(event, { name, x, y, width, height }));
  }
}
export function useLayoutFrame(name: string, owner?: string) {
  const context = useContext(LayoutSceneContext);
  const scene = owner ?? context;
  const instance = useId();
  const ref = useRef<ComponentRef<typeof View>>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const key = `${name}-${scene}-${instance}`;
    frames.set(key, { view: ref.current, scene });
    return () => { frames.delete(key); };
  }, [name, instance, scene]);
  return enabled ? { ref, onLayout: () => sample('layout'), collapsable: false as const } : {};
}
export function useTabLayoutDiagnostics(tab: string) {
  useDiagnosticFocus(useCallback(() => {
    if (!enabled) return;
    activeTab = tab;
    recordLayout('focus', {});
    const first = setTimeout(() => sample('focus-settled-500ms'), 500);
    const second = setTimeout(() => sample('focus-settled-1200ms'), 1200);
    return () => { clearTimeout(first); clearTimeout(second); recordLayout('blur', { tab }); };
  }, [tab]));
}
export function useViewportDiagnostics(insets: { top: number; bottom: number; left: number; right: number }) {
  const window = useWindowDimensions();
  useEffect(() => { recordLayout('window', window); }, [window.width, window.height, window.fontScale, window.scale]);
  useEffect(() => { recordLayout('safe-area', insets); }, [insets.top, insets.bottom, insets.left, insets.right]);
  useEffect(() => {
    if (!enabled) return;
    const device = require('expo-device') as typeof import('expo-device');
    const constants = (require('expo-constants') as typeof import('expo-constants')).default;
    recordLayout('runtime', { model: device.modelName, os: device.osName, osVersion: device.osVersion, expoGo: constants.expoVersion, sdk: constants.expoConfig?.sdkVersion, rn: Platform.constants.reactNativeVersion });
    const listeners = ['keyboardDidShow', 'keyboardDidHide'].map(event => Keyboard.addListener(event as 'keyboardDidShow' | 'keyboardDidHide', () => { recordLayout(event, {}); sample(event); }));
    const app = AppState.addEventListener('change', state => recordLayout('app-state', { state }));
    return () => { listeners.forEach(listener => listener.remove()); app.remove(); };
  }, []);
}
let lastScroll = 0;
export function recordScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
  if (!enabled || Date.now() - lastScroll < 200) return;
  lastScroll = Date.now();
  const { contentOffset, contentInset, layoutMeasurement, contentSize } = event.nativeEvent;
  recordLayout('scroll', { contentOffset, contentInset, layoutMeasurement, contentSize });
}
