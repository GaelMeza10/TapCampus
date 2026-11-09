import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '@/components/CustomInput';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS, SPACE, TYPE } from '@/theme';
import { Image as ExpoImage } from 'expo-image';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import AppText from '@/components/app-text';
import OptionGrid from '@/components/option-grid';
import { TypeSelector } from '@/components/marketplace-shell';
import { DataState, InlineMessage, Sheet } from '@/components/feedback';
import { apiMessage, categories, myPublications, savePublication, uploadImage, zones, type Category, type Publication, type PublicationPayload, type PublicationType, type Zone } from '@/services/marketplace';

type Draft = { title: string; description: string; price: string; stock: string; start: string; end: string; gangaPrice: string; gangaMinutes: string };
const empty: Draft = { title: '', description: '', price: '', stock: '', start: '', end: '', gangaPrice: '', gangaMinutes: '' };
const validPrice = (value: string) => /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= 99999999.99;
function localDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || localInput(date) !== value ? null : date;
}
function localInput(date: Date) {
  const part = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}
export default function EditPublication() {
  const { id, type: initialType } = useLocalSearchParams<{ id?: string; type?: string }>();
  const router = useRouter();
  const [type, setType] = useState<PublicationType>(initialType === 'STATIC' ? 'STATIC' : 'LIVE');
  const [draft, setDraft] = useState<Draft>(() => ({ ...empty, start: localInput(new Date()), end: localInput(new Date(Date.now() + 3600000)) }));
  const [zoneId, setZoneId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset>();
  const [existingImage, setExistingImage] = useState('');
  const [original, setOriginal] = useState<Publication>();
  const [gangaMode, setGangaMode] = useState<'MANUAL' | 'SCHEDULED'>('MANUAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const titleRef = useRef<ComponentRef<typeof TextInput>>(null);
  const descriptionRef = useRef<ComponentRef<typeof TextInput>>(null);
  const priceRef = useRef<ComponentRef<typeof TextInput>>(null);
  const stockRef = useRef<ComponentRef<typeof TextInput>>(null);
  const fieldPositions = useRef<Partial<Record<keyof Draft, number>>>({});
  const [panel, setPanel] = useState<'photo' | 'zone' | 'category' | 'ganga' | 'start' | 'end'>();
  const [config, setConfig] = useState({ mode: 'NONE' as 'NONE' | 'MANUAL' | 'SCHEDULED', price: '', minutes: '' });
  const [configError, setConfigError] = useState('');
  const [pickedTime, setPickedTime] = useState(new Date());
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>();
  const [editingReady, setEditingReady] = useState(!id);
  const [attempt, setAttempt] = useState(0);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [zoneLoading, setZoneLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const change = (field: keyof Draft, value: string) => { setDraft(previous => ({ ...previous, [field]: value })); setFieldErrors(previous => ({ ...previous, [field]: undefined })); setError(''); };
  function invalid(field: 'title' | 'description' | 'price' | 'stock', message: string) {
    setFieldErrors({ [field]: message }); setError('');
    const inputs = { title: titleRef, description: descriptionRef, price: priceRef, stock: stockRef };
    inputs[field].current?.focus();
    scrollRef.current?.scrollTo({ y: Math.max(0, (fieldPositions.current[field] ?? 0) - SPACE.lg), animated: false });
  }
  useEffect(() => { let current = true; setZoneLoading(true); void zones().then(rows => { if (current) setZoneOptions(rows); }).catch(cause => { if (current) setError(apiMessage(cause)); }).finally(() => { if (current) setZoneLoading(false); }); return () => { current = false; }; }, [catalogAttempt]);
  useEffect(() => { let current = true; setCategoryLoading(true); setCategoryOptions([]); void categories(type).then(rows => { if (current) setCategoryOptions(rows); }).catch(cause => { if (current) setError(apiMessage(cause)); }).finally(() => { if (current) setCategoryLoading(false); }); return () => { current = false; }; }, [type, catalogAttempt]);
  useEffect(() => {
    if (!id) return;
    let current = true;
    setEditingReady(false);
    void myPublications().then(rows => {
      if (!current) return;
      const p = rows.find(row => row.id === id);
      if (!p || p.status !== 'ACTIVE') { setError('No puedes editar esta publicación.'); return; }
      setOriginal(p);
      setType(p.type); setZoneId(p.zone_id); setCategoryId(p.category_id); setExistingImage(p.image_url);
      setGangaMode(p.ganga_activation_mode ?? 'MANUAL');
      setDraft({ title: p.title, description: p.description, price: p.price, stock: String(p.current_stock ?? ''),
        start: p.start_time ? localInput(new Date(p.start_time)) : '', end: p.end_time ? localInput(new Date(p.end_time)) : '',
        gangaPrice: p.ganga_min_price ?? '', gangaMinutes: String(p.ganga_minutes_before ?? '') });
    }).catch(cause => { if (current) setError(apiMessage(cause)); }).finally(() => { if (current) setEditingReady(true); });
    return () => { current = false; };
  }, [id, attempt]);
  async function pick(source: 'camera' | 'gallery') {
    setError('');
    try {
      const permission = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setError(source === 'camera' ? 'Permite usar la cámara para tomar la foto.' : 'Permite acceder a tus fotos para elegir una imagen.'); return; }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const selected = result.assets[0];
        if (selected.fileSize && selected.fileSize > 5 * 1024 * 1024) { setError('La imagen debe pesar 5 MiB o menos.'); return; }
        if (selected.mimeType && !['image/jpeg', 'image/png', 'image/webp'].includes(selected.mimeType)) { setError('Usa una imagen JPEG, PNG o WebP.'); return; }
        setAsset(selected);
      }
    } catch (cause) { setError((cause as Error).message || 'No se pudo seleccionar la imagen.'); }
  }
  async function submit() {
    if (loading) return;
    setFieldErrors({});
    if (type === 'LIVE' && draft.stock && (!/^\d+$/.test(draft.stock) || Number(draft.stock) < (id ? 0 : 1))) { invalid('stock', 'El stock debe ser un entero no negativo; al crear debe ser mayor que cero.'); return; }
    if (!draft.title.trim()) { invalid('title', 'Escribe un título para identificar el producto.'); return; }
    if (!draft.description.trim()) { invalid('description', 'Describe el producto y agrega una referencia para la entrega.'); return; }
    if (!zoneId || !categoryId || (!asset && !existingImage)) { setError('Completa foto, zona y categoría.'); return; }
    if (id && !original) { setError('Espera a que cargue la publicación antes de editarla.'); return; }
    if (!validPrice(draft.price)) { invalid('price', 'El precio debe ser positivo y tener hasta dos decimales.'); return; }
    const start = localDate(draft.start); const end = localDate(draft.end);
    if (type === 'LIVE' && (!/^\d+$/.test(draft.stock) || Number(draft.stock) < (id ? 0 : 1))) { invalid('stock', 'El stock debe ser un entero no negativo; al crear debe ser mayor que cero.'); return; }
    if (type === 'LIVE' && (!start || !end || start >= end || end.getTime() <= Date.now())) { setError('Ingresa inicio y fin locales válidos; el fin debe ser futuro y posterior al inicio.'); return; }
    if (type === 'LIVE' && draft.gangaPrice && (!validPrice(draft.gangaPrice) || Number(draft.gangaPrice) > Number(draft.price))) { setError('El precio ganga debe ser positivo y no superar el precio normal.'); return; }
    if (original?.ganga_min_price && !draft.gangaPrice) { setError('La ganga configurada no se puede quitar; conserva el precio o ajusta sus valores.'); return; }
    if (original?.ganga_activation_mode === 'SCHEDULED' && gangaMode === 'MANUAL') { setError('La ganga programada no se puede cambiar a manual en esta edición.'); return; }
    const changedSchedule = !original || draft.end !== (original.end_time ? localInput(new Date(original.end_time)) : '') ||
      draft.gangaMinutes !== String(original.ganga_minutes_before ?? '') || gangaMode !== original.ganga_activation_mode ||
      draft.gangaPrice !== (original.ganga_min_price ?? '');
    if (type === 'LIVE' && draft.gangaPrice && gangaMode === 'SCHEDULED' && changedSchedule && (!/^\d+$/.test(draft.gangaMinutes) || Number(draft.gangaMinutes) < 1 || !start || !end || end.getTime() - Number(draft.gangaMinutes) * 60000 <= Math.max(start.getTime(), Date.now()))) { setError('Programa la ganga dentro del horario y en el futuro.'); return; }
    setLoading(true); setError('');
    try {
      const imageUrl = asset ? await uploadImage(asset) : existingImage;
      const payload = { type, title: draft.title.trim(), description: draft.description.trim(), price: Number(draft.price), image_url: imageUrl,
        zone_id: zoneId, category_id: categoryId,
        ...(type === 'LIVE' ? { ...(id ? { current_stock: Number(draft.stock) } : { initial_stock: Number(draft.stock) }),
          start_time: start!.toISOString(), end_time: end!.toISOString(),
          ...(draft.gangaPrice ? { ganga_min_price: Number(draft.gangaPrice), ganga_activation_mode: gangaMode,
            ...(gangaMode === 'SCHEDULED' ? { ganga_minutes_before: Number(draft.gangaMinutes) } : {}) } : {}) } : {}) };
      if (id && original) {
        const patch: Partial<PublicationPayload> = {};
        for (const [key, value] of Object.entries(payload)) {
          if (key === 'type' || key === 'initial_stock') continue;
          const before = original[key as keyof Publication];
          const equal = key === 'price' || key === 'ganga_min_price' ? Number(before) === value : before === value;
          if (!equal) Object.assign(patch, { [key]: value });
        }
        if (!Object.keys(patch).length) { setError('No hay cambios para guardar.'); return; }
        await savePublication(patch, id);
      } else await savePublication(payload);
      router.replace({ pathname: '/sales', params: { type } });
    } catch (cause) { setError(apiMessage(cause)); }
    finally { setLoading(false); }
  }

  function openConfig() {
    setConfig({ mode: draft.gangaPrice ? gangaMode : 'NONE', price: draft.gangaPrice, minutes: draft.gangaMinutes });
    setConfigError(''); setPanel('ganga');
  }
  function saveConfig() {
    if (original?.is_ganga_active) { setPanel(undefined); return; }
    if (config.mode === 'NONE') {
      if (original?.ganga_min_price) { setConfigError('La ganga configurada no se puede quitar.'); return; }
      change('gangaPrice', ''); change('gangaMinutes', ''); setPanel(undefined); return;
    }
    if (!validPrice(config.price) || !validPrice(draft.price) || Number(config.price) > Number(draft.price)) { setConfigError('El precio mínimo debe ser positivo y no superar el precio normal.'); return; }
    if (original?.ganga_activation_mode === 'SCHEDULED' && config.mode === 'MANUAL') { setConfigError('La ganga programada no se puede cambiar a manual.'); return; }
    const end = localDate(draft.end), start = localDate(draft.start);
    if (config.mode === 'SCHEDULED' && (!/^\d+$/.test(config.minutes) || Number(config.minutes) < 1 || !end || !start || end.getTime() - Number(config.minutes) * 60000 <= Math.max(Date.now(), start.getTime()))) { setConfigError('Programa la ganga dentro del horario y en el futuro.'); return; }
    setGangaMode(config.mode); change('gangaPrice', config.price); change('gangaMinutes', config.mode === 'SCHEDULED' ? config.minutes : ''); setPanel(undefined);
  }
  function openTime(field: 'start' | 'end') {
    setPickedTime(localDate(draft[field]) ?? new Date()); setAndroidStep('date'); setPanel(field);
  }
  const localLabel = (value: string) => localDate(value)?.toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) ?? 'Seleccionar horario';
  const timedPanel = panel === 'start' || panel === 'end';
  const scheduledAt = localDate(draft.end) && /^\d+$/.test(config.minutes) ? new Date(localDate(draft.end)!.getTime() - Number(config.minutes) * 60000) : null;
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" disabled={loading} style={styles.back} onPress={() => router.back()}><AppText style={styles.link}>‹ Mis ventas</AppText></Pressable>
        <AppText variant="title">{id ? 'Editar publicación' : 'Nueva publicación'}</AppText>
        <TypeSelector value={type} disabled={!!id || loading} onChange={next => { if (next !== type) { setType(next); setCategoryId(undefined); } }} />
      </View>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        {id && !editingReady ? <DataState kind="loading" title="Cargando publicación…" /> : <>
          <Pressable accessibilityRole="button" disabled={loading} accessibilityLabel={asset || existingImage ? 'Cambiar foto del producto' : 'Añadir foto del producto'} style={({ pressed }) => [styles.photo, pressed && styles.pressed]} onPress={() => setPanel('photo')}>
            {asset || existingImage ? <ExpoImage testID="selected-publication-image" source={{ uri: asset?.uri ?? existingImage }} style={styles.image} contentFit="cover" /> : <><AppText style={styles.photoPlus}>+</AppText><View style={styles.photoBody}><AppText variant="label">Añadir foto del {type === 'LIVE' ? 'producto' : 'artículo'}</AppText><AppText variant="caption">Cámara o galería · máx. 5 MiB</AppText></View></>}
          </Pressable>
          <View onLayout={event => { fieldPositions.current.title = event.nativeEvent.layout.y; }}><CustomInput ref={titleRef} label="Título" editable={!loading} error={fieldErrors.title} placeholder="¿Qué vendes?" value={draft.title} onChangeText={value => change('title', value)} /></View>
          <View onLayout={event => { fieldPositions.current.description = event.nativeEvent.layout.y; }}><CustomInput ref={descriptionRef} label="Descripción" editable={!loading} error={fieldErrors.description} surface="white" placeholder="Describe el producto y agrega una referencia para la entrega." value={draft.description} onChangeText={value => change('description', value)} multiline /></View>
          <View style={styles.row} onLayout={event => { fieldPositions.current.price = event.nativeEvent.layout.y; fieldPositions.current.stock = event.nativeEvent.layout.y; }}><View style={styles.flex}><CustomInput ref={priceRef} label={type === 'LIVE' ? 'Precio normal' : 'Precio'} accessibilityLabel="Precio" error={fieldErrors.price} placeholder="$0.00" value={draft.price} onChangeText={value => change('price', value)} keyboardType="decimal-pad" editable={!loading && !original?.is_ganga_active} /></View>{type === 'LIVE' ? <View style={styles.flex}><CustomInput ref={stockRef} label="Stock disponible" editable={!loading} error={fieldErrors.stock} placeholder="Unidades" value={draft.stock} onChangeText={value => change('stock', value)} keyboardType="number-pad" /></View> : null}</View>
          <View style={styles.field}><AppText variant="label" style={styles.muted}>Zona</AppText><PrimaryButton disabled={loading} title={zoneOptions.find(z => z.id === zoneId)?.name ?? 'Seleccionar zona'} variant="field" onPress={() => setPanel('zone')} /></View>
          <View style={styles.field}><AppText variant="label" style={styles.muted}>Categoría</AppText><PrimaryButton disabled={loading} title={categoryOptions.find(c => c.id === categoryId)?.name ?? 'Seleccionar categoría'} variant="field" onPress={() => setPanel('category')} /></View>
          {type === 'LIVE' ? <>
            <AppText variant="label">Horario de venta</AppText>
            <View style={styles.row}><View style={styles.flex}><AppText variant="caption">Inicio</AppText><PrimaryButton disabled={loading} title={localLabel(draft.start)} accessibilityLabel="Elegir inicio de venta" variant="field" onPress={() => openTime('start')} /></View><View style={styles.flex}><AppText variant="caption">Fin</AppText><PrimaryButton disabled={loading} title={localLabel(draft.end)} accessibilityLabel="Elegir fin de venta" variant="field" onPress={() => openTime('end')} /></View></View>
            <Pressable accessibilityRole="button" disabled={loading} style={styles.ganga} onPress={openConfig}><AppText variant="label" style={styles.gangaText}>Precio Ganga · {original?.is_ganga_active ? 'Activa' : 'Configurar →'}</AppText><AppText variant="caption">{draft.gangaPrice ? `${gangaMode === 'MANUAL' ? 'Manual' : 'Programada'} · $${draft.gangaPrice}${gangaMode === 'SCHEDULED' ? ` · ${draft.gangaMinutes} min antes del fin` : ''}` : 'Sin configurar · opcional'}</AppText></Pressable>
          </> : <View style={styles.info}><AppText variant="label" style={styles.link}>Sin stock ni temporizador</AppText><AppText variant="caption">Los compradores contactan por WhatsApp directamente.</AppText></View>}
        </>}
        {error ? <InlineMessage onRetry={id ? () => setAttempt(n => n + 1) : undefined}>{error}</InlineMessage> : null}
      </ScrollView>
      <View style={styles.submit}><PrimaryButton title={id ? 'Guardar cambios' : type === 'STATIC' ? 'Publicar artículo' : 'Publicar'} loadingTitle={id ? 'Guardando…' : 'Publicando…'} disabled={!!id && (!editingReady || !original)} loading={loading} onPress={() => void submit()} /></View>
    </KeyboardAvoidingView>
    <Sheet visible={panel === 'photo'} title="Foto del producto" onClose={() => setPanel(undefined)}><PrimaryButton title="Tomar foto" onPress={() => { setPanel(undefined); void pick('camera'); }} /><PrimaryButton title="Elegir de galería" variant="secondary" onPress={() => { setPanel(undefined); void pick('gallery'); }} /></Sheet>
    <Sheet visible={panel === 'zone' || panel === 'category'} title={panel === 'zone' ? 'Zona' : 'Categoría'} onClose={() => setPanel(undefined)}>
      {(panel === 'zone' ? zoneLoading : categoryLoading) ? <DataState kind="loading" title="Cargando opciones…" /> : (panel === 'zone' ? zoneOptions : categoryOptions).length === 0 ? <DataState kind="error" title="No pudimos cargar las opciones" action="Reintentar" onAction={() => setCatalogAttempt(n => n + 1)} /> : <OptionGrid options={panel === 'zone' ? zoneOptions : categoryOptions} value={panel === 'zone' ? zoneId : categoryId} onChange={value => { if (panel === 'zone') setZoneId(value); else setCategoryId(value); setPanel(undefined); }} />}
    </Sheet>
    <Sheet visible={panel === 'ganga'} title="Precio Ganga" subtitle="El descuento se aplica únicamente a reservas nuevas." onClose={() => setPanel(undefined)} footer={<PrimaryButton title={original?.is_ganga_active ? 'Cerrar' : 'Guardar configuración'} onPress={saveConfig} />}>
      <View style={styles.row}>{(['NONE', 'MANUAL', 'SCHEDULED'] as const).map(mode => <PrimaryButton key={mode} title={mode === 'NONE' ? 'Sin ganga' : mode === 'MANUAL' ? 'Manual' : 'Programada'} compact style={styles.flex} variant={config.mode === mode ? 'primary' : 'secondary'} disabled={!!original?.is_ganga_active || (mode === 'NONE' && !!original?.ganga_min_price) || (mode === 'MANUAL' && original?.ganga_activation_mode === 'SCHEDULED')} onPress={() => { setConfig(previous => ({ ...previous, mode })); setConfigError(''); }} />)}</View>
      {config.mode !== 'NONE' ? <><CustomInput label="Precio mínimo" accessibilityLabel="Precio ganga opcional" surface="white" placeholder="$65" value={config.price} editable={!original?.is_ganga_active} keyboardType="decimal-pad" onChangeText={price => { setConfig(previous => ({ ...previous, price })); setConfigError(''); }} /><AppText variant="caption">Precio normal: ${draft.price || '—'}. El mínimo no puede ser mayor.</AppText>{config.mode === 'SCHEDULED' ? <><CustomInput label="Minutos antes del fin" surface="white" value={config.minutes} keyboardType="number-pad" editable={!original?.is_ganga_active} onChangeText={minutes => { setConfig(previous => ({ ...previous, minutes })); setConfigError(''); }} /><View style={styles.info}><AppText variant="label" style={styles.link}>Activación: {scheduledAt ? scheduledAt.toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Elige los minutos'}</AppText><AppText variant="caption">La venta termina {localLabel(draft.end)}.</AppText></View></> : <View style={styles.info}><AppText variant="label" style={styles.link}>Tú decides cuándo activar</AppText><AppText variant="caption">Activa la ganga desde Mis ventas mientras la publicación siga en horario.</AppText></View>}</> : <AppText variant="caption">Puedes publicar con el precio normal. Configurar una ganga es opcional.</AppText>}
      {configError ? <InlineMessage>{configError}</InlineMessage> : null}
    </Sheet>
    <Sheet visible={timedPanel} title={panel === 'start' ? 'Inicio de venta' : 'Fin de venta'} onClose={() => setPanel(undefined)} footer={<PrimaryButton title="Guardar horario" onPress={() => { if (panel === 'start' || panel === 'end') change(panel, localInput(pickedTime)); setPanel(undefined); }} />}>
      <AppText variant="label">{pickedTime.toLocaleString('es-MX')}</AppText>
      {timedPanel && (Platform.OS !== 'android' || androidStep) ? <DateTimePicker value={pickedTime} mode={Platform.OS === 'android' ? androidStep ?? 'date' : 'datetime'} display={Platform.OS === 'ios' ? 'spinner' : 'default'} locale="es_MX" accentColor={COLORS.primary} onDismiss={() => setAndroidStep(undefined)} onValueChange={(_event, value) => { if (Platform.OS === 'android' && androidStep === 'date') { const next = new Date(pickedTime); next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate()); setPickedTime(next); setAndroidStep('time'); } else { setPickedTime(value); setAndroidStep(undefined); } }} /> : null}
      {Platform.OS === 'android' && !androidStep ? <PrimaryButton title="Cambiar fecha y hora" variant="secondary" onPress={() => setAndroidStep('date')} /> : null}
    </Sheet>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, fill: { flex: 1 }, flex: { flex: 1, gap: SPACE.sm },
  header: { paddingHorizontal: SPACE.page, paddingBottom: SPACE.md, gap: SPACE.md }, back: { minHeight: 44, justifyContent: 'center' },
  scroll: { paddingHorizontal: SPACE.page, paddingTop: SPACE.sm, paddingBottom: SPACE.page, gap: SPACE.lg }, submit: { padding: SPACE.page },
  row: { flexDirection: 'row', gap: SPACE.lg }, field: { gap: SPACE.sm }, link: { color: COLORS.primary }, muted: { color: COLORS.textMedium },
  photo: { backgroundColor: COLORS.white, padding: SPACE.lg, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', minHeight: 84, gap: SPACE.lg, overflow: 'hidden' },
  photoPlus: { ...TYPE.title, color: COLORS.primary }, photoBody: { flex: 1, gap: SPACE.sm }, image: { width: '100%', height: 200, borderRadius: RADIUS.md },
  ganga: { backgroundColor: COLORS.gangaSoft, padding: SPACE.lg, borderRadius: RADIUS.md, gap: SPACE.sm }, gangaText: { color: COLORS.ganga },
  info: { backgroundColor: COLORS.primarySoft, padding: SPACE.lg, borderRadius: RADIUS.md, gap: SPACE.sm }, pressed: { opacity: 0.75 },
});
