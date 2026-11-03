import { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Card from '@/components/Card';
import CustomInput from '@/components/CustomInput';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, RADIUS } from '@/theme';
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [type, setType] = useState<PublicationType>('LIVE');
  const [draft, setDraft] = useState<Draft>(empty);
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
  const change = (field: keyof Draft, value: string) => { setDraft(previous => ({ ...previous, [field]: value })); setError(''); };
  useEffect(() => { void zones().then(setZoneOptions).catch(cause => setError(apiMessage(cause))); }, []);
  useEffect(() => { void categories(type).then(setCategoryOptions).catch(cause => setError(apiMessage(cause))); }, [type]);
  useEffect(() => {
    if (!id) return;
    void myPublications().then(rows => {
      const p = rows.find(row => row.id === id);
      if (!p || p.status !== 'ACTIVE') { setError('No puedes editar esta publicación.'); return; }
      setOriginal(p);
      setType(p.type); setZoneId(p.zone_id); setCategoryId(p.category_id); setExistingImage(p.image_url);
      setGangaMode(p.ganga_activation_mode ?? 'MANUAL');
      setDraft({ title: p.title, description: p.description, price: p.price, stock: String(p.current_stock ?? ''),
        start: p.start_time ? localInput(new Date(p.start_time)) : '', end: p.end_time ? localInput(new Date(p.end_time)) : '',
        gangaPrice: p.ganga_min_price ?? '', gangaMinutes: String(p.ganga_minutes_before ?? '') });
    }).catch(cause => setError(apiMessage(cause)));
  }, [id]);
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
    if (type === 'LIVE' && draft.stock && (!/^\d+$/.test(draft.stock) || Number(draft.stock) < (id ? 0 : 1))) { setError('El stock debe ser un entero no negativo; al crear debe ser mayor que cero.'); return; }
    if (!draft.title.trim() || !draft.description.trim() || !zoneId || !categoryId || (!asset && !existingImage)) { setError('Completa título, descripción, foto, zona y categoría.'); return; }
    if (id && !original) { setError('Espera a que cargue la publicación antes de editarla.'); return; }
    if (!validPrice(draft.price)) { setError('El precio debe ser positivo y tener hasta dos decimales.'); return; }
    const start = localDate(draft.start); const end = localDate(draft.end);
    if (type === 'LIVE' && (!/^\d+$/.test(draft.stock) || Number(draft.stock) < (id ? 0 : 1))) { setError('El stock debe ser un entero no negativo; al crear debe ser mayor que cero.'); return; }
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
      router.replace('/sales');
    } catch (cause) { setError(apiMessage(cause)); }
    finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.screen}><KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <Pressable onPress={() => router.back()}><Text style={styles.link}>‹ Volver</Text></Pressable>
      <Text style={styles.title}>{id ? 'Editar publicación' : 'Nueva publicación'}</Text>
      <Card style={styles.card}>
        {!id ? <View style={styles.row}><Pressable onPress={() => { setType('LIVE'); setCategoryId(undefined); }}><Text style={styles.link}>En Vivo {type === 'LIVE' ? '✓' : ''}</Text></Pressable><Pressable onPress={() => { setType('STATIC'); setCategoryId(undefined); }}><Text style={styles.link}>Estático {type === 'STATIC' ? '✓' : ''}</Text></Pressable></View> : null}
        <View style={styles.row}><Pressable onPress={() => void pick('camera')}><Text style={styles.link}>Tomar foto</Text></Pressable><Pressable onPress={() => void pick('gallery')}><Text style={styles.link}>Elegir de galería</Text></Pressable></View>
        {asset || existingImage ? <Image testID="selected-publication-image" source={{ uri: asset?.uri ?? existingImage }} style={styles.image} /> : null}
        <CustomInput accessibilityLabel="Título" placeholder="Título" value={draft.title} onChangeText={value => change('title', value)} />
        <CustomInput accessibilityLabel="Descripción" placeholder="Descripción" value={draft.description} onChangeText={value => change('description', value)} multiline />
        <CustomInput accessibilityLabel="Precio" placeholder="Precio MXN" value={draft.price} onChangeText={value => change('price', value)} keyboardType="decimal-pad" editable={!original?.is_ganga_active} />
        <Text style={styles.label}>Zona</Text><FlatList horizontal data={zoneOptions} keyExtractor={zone => String(zone.id)} renderItem={({ item: zone }) => <Pressable style={[styles.chip, zoneId === zone.id && styles.selected]} onPress={() => setZoneId(zone.id)}><Text>{zone.name}</Text></Pressable>} />
        <Text style={styles.label}>Categoría</Text><FlatList horizontal data={categoryOptions} keyExtractor={category => String(category.id)} renderItem={({ item: category }) => <Pressable style={[styles.chip, categoryId === category.id && styles.selected]} onPress={() => setCategoryId(category.id)}><Text>{category.name}</Text></Pressable>} />
        {type === 'LIVE' ? <>
          <CustomInput accessibilityLabel="Stock disponible" placeholder="Stock disponible" value={draft.stock} onChangeText={value => change('stock', value)} keyboardType="number-pad" />
          <Text style={styles.help}>Horario local: AAAA-MM-DDTHH:mm</Text>
          <CustomInput accessibilityLabel="Inicio" placeholder="AAAA-MM-DDTHH:mm" value={draft.start} onChangeText={value => change('start', value)} />
          <CustomInput accessibilityLabel="Fin" placeholder="AAAA-MM-DDTHH:mm" value={draft.end} onChangeText={value => change('end', value)} />
          <CustomInput accessibilityLabel="Precio ganga opcional" placeholder="Precio ganga opcional" value={draft.gangaPrice} onChangeText={value => change('gangaPrice', value)} keyboardType="decimal-pad" editable={!original?.is_ganga_active} />
          {draft.gangaPrice && !original?.is_ganga_active ? <><View style={styles.row}><Pressable onPress={() => setGangaMode('MANUAL')}><Text style={styles.link}>Manual {gangaMode === 'MANUAL' ? '✓' : ''}</Text></Pressable><Pressable onPress={() => setGangaMode('SCHEDULED')}><Text style={styles.link}>Programada {gangaMode === 'SCHEDULED' ? '✓' : ''}</Text></Pressable></View>
            {gangaMode === 'SCHEDULED' ? <CustomInput accessibilityLabel="Minutos antes del fin" placeholder="Minutos antes del fin" value={draft.gangaMinutes} onChangeText={value => change('gangaMinutes', value)} keyboardType="number-pad" /> : null}</> : null}
        </> : null}
        {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
        <PrimaryButton title={id ? 'Guardar cambios' : 'Publicar'} loading={loading} onPress={() => void submit()} />
      </Card>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, fill: { flex: 1 }, scroll: { padding: 20, gap: 12 },
  title: { color: COLORS.textDark, fontSize: 26, fontWeight: '800' }, card: { padding: 18, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
  link: { color: COLORS.primaryDark, fontWeight: '700', paddingVertical: 8 }, label: { color: COLORS.textDark, fontWeight: '700' },
  chip: { backgroundColor: COLORS.inputBg, borderRadius: RADIUS.full, padding: 10, marginRight: 8 }, selected: { backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primary },
  image: { width: '100%', height: 200, borderRadius: RADIUS.md }, help: { color: COLORS.textMedium, fontSize: 13 },
  error: { backgroundColor: COLORS.errorBg, padding: 12, borderRadius: RADIUS.md }, errorText: { color: COLORS.error },
});
