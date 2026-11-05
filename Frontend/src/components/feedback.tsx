import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, METRICS, RADIUS, SPACE } from '@/theme';
import AppText from './app-text';
import Card from './Card';
import PrimaryButton from './PrimaryButton';
import StatusIcon from './status-icon';

export function InlineMessage({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return <View style={styles.error} accessibilityRole="alert"><AppText style={styles.errorText}>{children}</AppText>{onRetry ? <PrimaryButton compact variant="ghost" title="Reintentar" onPress={onRetry} /> : null}</View>;
}

export function DataState({ kind, title, description, action, onAction }: { kind: 'loading' | 'error' | 'empty'; title: string; description?: string; action?: string; onAction?: () => void }) {
  return <Card style={styles.state}>{kind === 'loading' ? <ActivityIndicator color={COLORS.primary} accessibilityLabel="Cargando" /> : kind === 'empty' ? <StatusIcon kind="empty" /> : <AppText variant="title" style={styles.errorText}>!</AppText>}<AppText variant="heading">{title}</AppText>{description ? <AppText variant="caption">{description}</AppText> : null}{action && onAction ? <PrimaryButton title={action} onPress={onAction} /> : null}</Card>;
}

export function ConfirmationDialog({ visible, title, description, confirmTitle, onConfirm, onClose, busy, variant = 'primary', error }: { visible: boolean; title: string; description: string; confirmTitle: string; onConfirm: () => void; onClose: () => void; busy?: boolean; variant?: 'primary' | 'destructive' | 'warning'; error?: string }) {
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={() => { if (!busy) onClose(); }}><View style={styles.shade}><Card style={styles.dialog}><AppText variant="heading">{title}</AppText><AppText variant="caption">{description}</AppText>{error ? <InlineMessage>{error}</InlineMessage> : null}<PrimaryButton title={confirmTitle} variant={variant} loading={busy} onPress={onConfirm} /><PrimaryButton compact variant="ghost" title="Volver" disabled={busy} onPress={onClose} /></Card></View></Modal>;
}

export function Sheet({ visible, title, subtitle, children, onClose, footer }: { visible: boolean; title: string; subtitle?: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}><KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={styles.sheetShade}><Pressable style={styles.backdrop} accessible={false} onPress={onClose} /><View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACE.md) }]} accessibilityViewIsModal><View style={styles.sheetHead}><View style={styles.sheetHeading}><AppText variant="title">{title}</AppText>{subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}</View><Pressable accessibilityLabel="Cerrar panel" accessibilityRole="button" style={styles.close} onPress={onClose}><AppText variant="section" style={styles.closeText}>×</AppText></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetBody}>{children}</ScrollView>{footer ? <View style={styles.footer}>{footer}</View> : null}</View></View></KeyboardAvoidingView></Modal>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  error: { padding: SPACE.md, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, gap: SPACE.sm }, errorText: { color: COLORS.error },
  state: { padding: SPACE.page, gap: SPACE.lg }, shade: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', padding: SPACE.xl }, dialog: { padding: SPACE.page, gap: SPACE.lg },
  sheetShade: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }, backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  sheet: { maxHeight: '90%', borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, backgroundColor: COLORS.background, paddingTop: SPACE.page },
  sheetHead: { paddingHorizontal: SPACE.page, flexDirection: 'row', gap: SPACE.sm, paddingBottom: SPACE.page }, sheetHeading: { flex: 1, gap: SPACE.sm }, close: { minWidth: METRICS.compactControl, minHeight: METRICS.compactControl, alignItems: 'center', justifyContent: 'center' }, closeText: { color: COLORS.primary },
  sheetBody: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.page, gap: SPACE.lg }, footer: { paddingHorizontal: SPACE.page, paddingTop: SPACE.md, gap: SPACE.sm },
});
