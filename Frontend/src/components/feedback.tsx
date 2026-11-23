import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { AccessibilityInfo, ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import Card from './Card';
import PrimaryButton from './PrimaryButton';
import StatusIcon from './status-icon';
import { recordLayout } from '@/lib/layout-diagnostics';

export function InlineMessage({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return <View style={styles.error} accessibilityRole="alert"><AppText style={styles.errorText}>{children}</AppText>{onRetry ? <PrimaryButton compact variant="ghost" title="Reintentar" onPress={onRetry} /> : null}</View>;
}

export function ErrorNotice({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return <ScrollView testID="persistent-error" onLayout={event => recordLayout('error-notice', event.nativeEvent.layout)} style={styles.notice} contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false} automaticallyAdjustsScrollIndicatorInsets={false} keyboardShouldPersistTaps="handled"><InlineMessage onRetry={onRetry}>{children}</InlineMessage></ScrollView>;
}

export function DataState({ kind, title, description, action, onAction }: { kind: 'loading' | 'error' | 'empty'; title: string; description?: string; action?: string; onAction?: () => void }) {
  return <Card style={styles.state}>{kind === 'loading' ? <ActivityIndicator color={COLORS.primary} accessibilityLabel="Cargando" /> : kind === 'empty' ? <StatusIcon kind="empty" /> : <Ionicons name="cloud-offline-outline" size={32} color={COLORS.error} accessible={false} />}<AppText variant="heading">{title}</AppText>{description ? <AppText variant="caption">{description}</AppText> : null}{action && onAction ? <PrimaryButton title={action} onPress={onAction} /> : null}</Card>;
}

export function ConfirmationDialog({ visible, title, description, confirmTitle, onConfirm, onClose, busy, variant = 'primary', error, confirmDisabled, loadingTitle, returnFocusRef }: { visible: boolean; title: string; description: string; confirmTitle: string; onConfirm: () => void; onClose: () => void; busy?: boolean; variant?: 'primary' | 'destructive' | 'warning'; error?: string; confirmDisabled?: boolean; loadingTitle?: string; returnFocusRef?: RefObject<ComponentRef<typeof Pressable> | null> }) {
  const insets = useSafeAreaInsets();
  const headingRef = useRef<ComponentRef<typeof View>>(null);
  const wasVisible = useRef(false);
  function restoreFocus() {
    const target = returnFocusRef?.current;
    if (!target) return;
    target.focus();
    if (Platform.OS !== 'web') AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
  }
  useEffect(() => {
    if (wasVisible.current && !visible && Platform.OS !== 'ios') {
      const frame = requestAnimationFrame(restoreFocus);
      wasVisible.current = visible;
      return () => cancelAnimationFrame(frame);
    }
    wasVisible.current = visible;
  }, [visible, returnFocusRef]);
  useEffect(() => {
    if (Platform.OS !== 'web' && visible && (busy || error)) AccessibilityInfo.announceForAccessibility(busy ? loadingTitle ?? confirmTitle : error!);
  }, [visible, busy, error, loadingTitle, confirmTitle]);
  return <Modal testID="confirmation-dialog" transparent visible={visible} animationType="fade" onShow={() => { const target = headingRef.current; if (target) { target.focus(); if (Platform.OS !== 'web') AccessibilityInfo.sendAccessibilityEvent(target, 'focus'); } }} onDismiss={restoreFocus} onRequestClose={() => { if (!busy) onClose(); }}><View accessibilityViewIsModal style={[styles.shade, { paddingTop: Math.max(SPACE.xl, insets.top), paddingBottom: Math.max(SPACE.xl, insets.bottom) }]}><ScrollView contentContainerStyle={styles.dialogScroll} keyboardShouldPersistTaps="handled"><Card style={styles.dialog}><View ref={headingRef} accessible accessibilityRole="header" accessibilityLabel={title} focusable><AppText variant="heading">{title}</AppText></View><AppText variant="caption">{description}</AppText>{error ? <InlineMessage>{error}</InlineMessage> : null}<PrimaryButton title={confirmTitle} variant={variant} loading={busy} loadingTitle={loadingTitle} disabled={confirmDisabled} onPress={onConfirm} /><PrimaryButton compact variant="ghost" title="Volver" disabled={busy} onPress={onClose} /></Card></ScrollView></View></Modal>;
}

export function Sheet({ visible, title, subtitle, children, onClose, footer, dismissDisabled = false, returnFocusRef, appearance = 'default' }: { visible: boolean; title: string; subtitle?: string; children: ReactNode; onClose: () => void; footer?: ReactNode; dismissDisabled?: boolean; appearance?: 'default' | 'filters'; returnFocusRef?: RefObject<ComponentRef<typeof Pressable> | null> }) {
  const insets = useSafeAreaInsets();
  const headingRef = useRef<ComponentRef<typeof View>>(null);
  const wasVisible = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; listener.remove(); };
  }, []);
  function restoreFocus() {
    const target = returnFocusRef?.current;
    if (!target) return;
    target.focus();
    if (Platform.OS !== 'web') AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
  }
  useEffect(() => {
    if (wasVisible.current && !visible && Platform.OS !== 'ios') {
      const frame = requestAnimationFrame(restoreFocus);
      wasVisible.current = visible;
      return () => cancelAnimationFrame(frame);
    }
    wasVisible.current = visible;
  }, [visible, returnFocusRef]);
  function close() { if (!dismissDisabled) onClose(); }
  return <Modal testID="sheet-dialog" transparent visible={visible} animationType={reducedMotion ? 'none' : 'slide'} onShow={() => { const target = headingRef.current; if (target) { target.focus(); if (Platform.OS !== 'web') AccessibilityInfo.sendAccessibilityEvent(target, 'focus'); } }} onDismiss={restoreFocus} onRequestClose={close}><KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={styles.sheetShade}><Pressable style={styles.backdrop} accessible={false} disabled={dismissDisabled} onPress={close} /><View style={[styles.sheet, appearance === 'filters' && styles.filtersSheet, { paddingBottom: Math.max(insets.bottom, SPACE.md) }]} accessibilityViewIsModal>{appearance === 'filters' ? <View style={styles.handle} accessible={false} /> : null}<View style={styles.sheetHead}><View style={styles.sheetHeading}><View ref={headingRef} accessible accessibilityRole="header" accessibilityLabel={title} focusable><AppText variant="title">{title}</AppText></View>{subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}</View><Pressable accessibilityLabel="Cerrar panel" accessibilityRole="button" accessibilityState={{ disabled: dismissDisabled }} disabled={dismissDisabled} style={[styles.close, appearance === 'filters' && styles.filterClose, dismissDisabled && styles.closeDisabled]} onPress={close}><Ionicons name="close-outline" size={24} color={COLORS.textDark} accessible={false} /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetBody}>{children}</ScrollView>{footer ? <View style={[styles.footer, appearance === 'filters' && styles.filterFooter]}>{footer}</View> : null}</View></View></KeyboardAvoidingView></Modal>;
}

const styles = StyleSheet.create({
  notice: { flexBasis: 'auto', flexGrow: 0, flexShrink: 0, maxHeight: '30%', marginHorizontal: SPACE.page, marginVertical: SPACE.sm },
  filtersSheet: { height: '84%', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.textDark, paddingTop: SPACE.md },
  handle: { width: 44, height: 5, borderRadius: RADIUS.full, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACE.md },
  filterClose: { borderWidth: 1, borderColor: COLORS.textDark, borderRadius: RADIUS.sm, alignSelf: 'flex-start' },
  filterFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, marginHorizontal: SPACE.page, paddingHorizontal: 0 },
  fill: { flex: 1 },
  closeDisabled: { opacity: 0.5 },
  dialogScroll: { flexGrow: 1, justifyContent: 'center' },
  error: { padding: SPACE.md, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, gap: SPACE.sm }, errorText: { color: COLORS.error },
  state: { padding: SPACE.page, gap: SPACE.lg }, shade: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', padding: SPACE.xl }, dialog: { padding: SPACE.page, gap: SPACE.lg },
  sheetShade: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }, backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  sheet: { maxHeight: '90%', borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, backgroundColor: COLORS.background, paddingTop: SPACE.page },
  sheetHead: { paddingHorizontal: SPACE.page, flexDirection: 'row', gap: SPACE.sm, paddingBottom: SPACE.page }, sheetHeading: { flex: 1, gap: SPACE.sm }, close: { minWidth: Platform.OS === 'android' ? 48 : METRICS.compactControl, minHeight: Platform.OS === 'android' ? 48 : METRICS.compactControl, alignItems: 'center', justifyContent: 'center' },
  sheetBody: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.lg }, footer: { paddingHorizontal: SPACE.page, paddingTop: SPACE.md, gap: SPACE.sm },
});
