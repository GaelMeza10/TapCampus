import { useEffect, useLayoutEffect, useRef, useState, type ComponentRef, type Ref } from 'react';
import {
  KeyboardAvoidingView,
  AccessibilityInfo,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from '@/components/CustomInput';
import PrimaryButton from '@/components/PrimaryButton';
import { COLORS, METRICS, RADIUS, SPACE, TYPE } from '@/theme';
import { Image as ExpoImage } from 'expo-image';
import SaleTimePicker from '@/components/sale-time-picker';
import OfferDuration from '@/components/offer-duration';
import { maximumOfferMinutes } from '@/components/offer-duration.types';
import AppText from '@/components/app-text';
import OptionGrid from '@/components/option-grid';
import { MARKETPLACE_SCROLL_PROPS, TypeSelector } from '@/components/marketplace-shell';
import { DataState, InlineMessage, Sheet } from '@/components/feedback';
import {
  apiMessage,
  categories,
  myPublications,
  savePublication,
  uploadImage,
  zones,
  type Category,
  publicationContentError,
  type OwnedPublication,
  type PublicationPatch,
  type PublicationPayload,
  type PublicationType,
  type Zone,
} from '@/services/marketplace';
import { formFieldOrder, localDate, localInput, normalizePrice, validPrice, validatePublicationDraft, type PublicationDraft, type PublicationFormErrors, type PublicationFormField } from '@/lib/publication-form-validation';
import { PUBLICATION_COPY } from '@/lib/publication-copy';
import { DESCRIPTION_MAX, TITLE_MAX } from '@/lib/field-limits';

type Draft = PublicationDraft;
const empty: Draft = {
  title: '',
  description: '',
  price: '',
  stock: '',
  start: '',
  end: '',
  gangaPrice: '',
  gangaMinutes: '',
};
function FieldMessage({ message, onRetry, retryLabel = 'Reintentar' }: { message?: string; onRetry?: () => void; retryLabel?: string }) {
  return message ? <View style={styles.fieldMessage}><View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={16} color={COLORS.error} accessible={false} /><AppText style={styles.errorText}>{message}</AppText></View>{onRetry ? <PrimaryButton compact variant="ghost" title={retryLabel} onPress={onRetry} /> : null}</View> : null;
}
function FormPicker({
  label,
  value,
  placeholder,
  icon,
  disabled,
  onPress,
  accessibilityLabel,
  error,
  controlRef,
  onLayout,
}: {
  label: string;
  value?: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  error?: string;
  controlRef?: Ref<ComponentRef<typeof Pressable>>;
  onLayout?: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <View onLayout={onLayout} style={styles.fieldGroup}><Pressable
      ref={controlRef}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? value ?? placeholder}
      accessibilityState={{ disabled }}
      accessibilityHint={error}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.picker,
        error && styles.controlError,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={COLORS.primary}
        accessible={false}
      />
      <View style={styles.pickerBody}>
        <AppText variant="caption">{label}</AppText>
        <AppText
          variant="label"
          style={!value ? styles.muted : undefined}
        >
          {value ?? placeholder}
        </AppText>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={COLORS.textMedium}
        accessible={false}
      />
    </Pressable><FieldMessage message={error} /></View>
  );
}
export default function EditPublication() {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  const params = useLocalSearchParams<{ id?: string | string[]; type?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const routeType = Array.isArray(params.type) ? params.type[0] : params.type;
  const initialType = routeType === 'LIVE' || routeType === 'STATIC' ? routeType : undefined;
  const router = useRouter();
  const [selectedType, setType] = useState<PublicationType>(initialType ?? 'LIVE');
  const type = id ? selectedType : initialType ?? selectedType;
  const [draft, setDraft] = useState<Draft>(() => ({
    ...empty,
    start: localInput(new Date()),
    end: localInput(new Date(Date.now() + 3600000)),
  }));
  const [zoneId, setZoneId] = useState<number>();
  const [pickupMode, setPickupMode] = useState<'SPECIFIC_ZONE' | 'ARRANGED'>('SPECIFIC_ZONE');
  const [categoryId, setCategoryId] = useState<number>();
  const [zoneOptions, setZoneOptions] = useState<Zone[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset>();
  const [existingImage, setExistingImage] = useState('');
  const [original, setOriginal] = useState<OwnedPublication>();
  const [gangaMode, setGangaMode] = useState<'MANUAL' | 'SCHEDULED'>('MANUAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  // Permiso bloqueado ("No volver a preguntar"): el sistema ya no muestra el diálogo.
  const [photoSettings, setPhotoSettings] = useState(false);
  const [zoneError, setZoneError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<PublicationFormErrors>({});
  const [contentMessage, setContentMessage] = useState('');
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const titleRef = useRef<ComponentRef<typeof TextInput>>(null);
  const descriptionRef = useRef<ComponentRef<typeof TextInput>>(null);
  const priceRef = useRef<ComponentRef<typeof TextInput>>(null);
  const stockRef = useRef<ComponentRef<typeof TextInput>>(null);
  const photoRef = useRef<ComponentRef<typeof Pressable>>(null);
  const zoneRef = useRef<ComponentRef<typeof Pressable>>(null);
  const categoryRef = useRef<ComponentRef<typeof Pressable>>(null);
  const conditionRef = useRef<ComponentRef<typeof Pressable>>(null);
  const startRef = useRef<ComponentRef<typeof Pressable>>(null);
  const endRef = useRef<ComponentRef<typeof Pressable>>(null);
  const offerRef = useRef<ComponentRef<typeof Pressable>>(null);
  const fieldPositions = useRef<Partial<Record<PublicationFormField, number>>>({});
  const stockOffset = useRef(0);
  const endOffset = useRef(0);
  const submitting = useRef(false);
  const pendingField = useRef<PublicationFormField | undefined>(undefined);
  const [navigationRequest, setNavigationRequest] = useState(0);
  const [panel, setPanel] = useState<'photo' | 'zone' | 'category' | 'condition' | 'ganga' | 'start' | 'end'>();
  const [config, setConfig] = useState({
    mode: 'NONE' as 'NONE' | 'MANUAL' | 'SCHEDULED',
    price: '',
    minutes: '',
  });
  const [configError, setConfigError] = useState('');
  const [pickedTime, setPickedTime] = useState(new Date());
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>();
  const [editingReady, setEditingReady] = useState(!id);
  const [attempt, setAttempt] = useState(0);
  const [zoneAttempt, setZoneAttempt] = useState(0);
  const [categoryAttempt, setCategoryAttempt] = useState(0);
  const [zoneLoading, setZoneLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const change = (field: keyof Draft, raw: string) => {
    const value = field === 'price' || field === 'gangaPrice' ? normalizePrice(raw) : raw;
    setDraft(previous => ({ ...previous, [field]: value }));
    if (field === 'title' || field === 'description') {
      setServerErrors(previous => ({ ...previous, [field]: undefined }));
    }
  };

  const validation = () => validatePublicationDraft({ draft, type, original, editing: !!id,
    hasPhoto: !!(asset || existingImage), zoneId, pickupMode, categoryId, gangaMode, now: Date.now() });
  const fieldErrors: PublicationFormErrors = { ...(attempted ? validation() : {}), ...Object.fromEntries(Object.entries(serverErrors).filter(([, value]) => value)) };
  const problems: PublicationFormErrors = { ...fieldErrors, ...(photoError ? { photo: photoError } : {}),
    ...(zoneError && !(type === 'STATIC' && pickupMode === 'ARRANGED') ? { zone: zoneError } : {}), ...(categoryError ? { category: categoryError } : {}) };
  const firstError = formFieldOrder.find(field => problems[field]);
  const contentBlocked = !!(serverErrors.title || serverErrors.description);
  const notice = contentBlocked ? contentMessage : firstError ? 'Revisa los campos señalados' : error || loadError;

  function requestField(field?: PublicationFormField) {
    pendingField.current = field;
    if (field) setNavigationRequest(value => value + 1);
  }
  function focusPending() {
    const field = pendingField.current;
    if (!field || panel || fieldPositions.current[field] === undefined) return;
    const target = { photo: photoRef, title: titleRef, description: descriptionRef, condition: conditionRef, category: categoryRef,
      price: priceRef, stock: stockRef, zone: zoneRef, start: startRef, end: endRef, offer: offerRef }[field].current;
    target?.focus();
    if (target && Platform.OS !== 'web') AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
    scrollRef.current?.scrollTo({
      y: Math.max(0, (fieldPositions.current[field] ?? 0) - SPACE.lg),
      animated: false,
    });
    pendingField.current = undefined;
  }
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(focusPending);
    return () => cancelAnimationFrame(frame);
  }, [navigationRequest]);

  useEffect(() => {
    let current = true;
    setZoneLoading(true);
    setZoneError('');
    void zones()
      .then(rows => {
        if (current) setZoneOptions(rows);
      })
      .catch(cause => {
        if (current) setZoneError(apiMessage(cause));
      })
      .finally(() => {
        if (current) setZoneLoading(false);
      });
    return () => {
      current = false;
    };
  }, [zoneAttempt]);

  useEffect(() => {
    if (!id) setCategoryId(undefined);
  }, [id, initialType]);

  useEffect(() => {
    let current = true;
    setCategoryLoading(true);
    setCategoryError('');
    setCategoryOptions([]);
    void categories(type)
      .then(rows => {
        if (current) setCategoryOptions(rows);
      })
      .catch(cause => {
        if (current) setCategoryError(apiMessage(cause));
      })
      .finally(() => {
        if (current) setCategoryLoading(false);
      });
    return () => {
      current = false;
    };
  }, [type, categoryAttempt]);

  useEffect(() => {
    if (!id) return;
    let current = true;
    setEditingReady(false);
    setLoadError('');
    void myPublications()
      .then(rows => {
        if (!current) return;
        const p = rows.find(row => row.id === id);
        if (!p || p.status !== 'ACTIVE') {
          setLoadError('No puedes editar esta publicación.');
          return;
        }
        setOriginal(p);
        setType(p.type);
        setZoneId(p.zone_id ?? undefined);
        setPickupMode(p.pickup_mode ?? 'SPECIFIC_ZONE');
        setCategoryId(p.category_id);
        setExistingImage(p.image_url);
        setGangaMode(p.ganga_activation_mode ?? 'MANUAL');
        setDraft({
          condition: p.condition ?? undefined,
          title: p.title,
          description: p.description,
          price: p.price,
          stock: String(p.current_stock ?? ''),
          start: p.start_time ? localInput(new Date(p.start_time)) : '',
          end: p.end_time ? localInput(new Date(p.end_time)) : '',
          gangaPrice: p.ganga_min_price ?? '',
          gangaMinutes: String(p.ganga_minutes_before ?? ''),
        });
      })
      .catch(cause => {
        if (current) setLoadError(apiMessage(cause));
      })
      .finally(() => {
        if (current) setEditingReady(true);
      });
    return () => {
      current = false;
    };
  }, [id, attempt]);

  async function pick(source: 'camera' | 'gallery') {
    setPhotoError('');
    setPhotoSettings(false);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const blocked = permission.canAskAgain === false;
        setPhotoSettings(blocked);
        setPhotoError(
          blocked
            ? source === 'camera'
              ? 'El permiso de cámara está desactivado. Actívalo en Configuración para tomar la foto.'
              : 'El acceso a tus fotos está desactivado. Actívalo en Configuración para elegir una imagen.'
            : source === 'camera'
              ? 'Permite usar la cámara para tomar la foto.'
              : 'Permite acceder a tus fotos para elegir una imagen.',
        );
        return;
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });
      if (!result.canceled && result.assets[0]) {
        const selected = result.assets[0];
        if (selected.fileSize && selected.fileSize > 5 * 1024 * 1024) {
          setPhotoError('La imagen debe pesar 5 MiB o menos.');
          return;
        }
        if (
          selected.mimeType &&
          !['image/jpeg', 'image/png', 'image/webp'].includes(selected.mimeType)
        ) {
          setPhotoError('Usa una imagen JPEG, PNG o WebP.');
          return;
        }
        setAsset(selected);
        setExistingImage('');
      }
    } catch {
      setPhotoError('No se pudo seleccionar la imagen. Inténtalo de nuevo.');
    }
  }

  async function submit() {
    if (submitting.current || loading) return;
    setAttempted(true);
    const errors = { ...validation(), ...Object.fromEntries(Object.entries(serverErrors).filter(([, value]) => value)) };
    const first = formFieldOrder.find(field => errors[field]);
    if (first) { requestField(first); return; }
    if (id && !original) { setLoadError('Espera a que cargue la publicación antes de editarla.'); return; }
    if ((zoneError && !(type === 'STATIC' && pickupMode === 'ARRANGED')) || categoryError) { requestField(categoryError ? 'category' : 'zone'); return; }
    const start = localDate(draft.start), end = localDate(draft.end);
    submitting.current = true;
    let stage: 'upload' | 'save' = 'upload';
    setLoading(true);
    setError('');
    try {
      setPhotoError('');
      const imageUrl = asset ? await uploadImage(asset) : existingImage;
      if (asset) { setExistingImage(imageUrl); setAsset(undefined); }
      stage = 'save';
      const payload: PublicationPayload = {
        type,
        title: draft.title.trim(),
        description: draft.description.trim(),
        price: Number(draft.price),
        image_url: imageUrl,
        zone_id: type === 'STATIC' && pickupMode === 'ARRANGED' ? null : zoneId!,
        pickup_mode: type === 'STATIC' ? pickupMode : 'SPECIFIC_ZONE',
        category_id: categoryId!,
        ...(type === 'LIVE'
          ? {
              ...(id
                ? { current_stock: Number(draft.stock) }
                : { initial_stock: Number(draft.stock) }),
              start_time: original?.start_time && draft.start === localInput(new Date(original.start_time))
                ? original.start_time : start!.toISOString(),
              end_time: original?.end_time && draft.end === localInput(new Date(original.end_time))
                ? original.end_time : end!.toISOString(),
              ...(draft.gangaPrice
                ? {
                    ganga_min_price: Number(draft.gangaPrice),
                    ganga_activation_mode: gangaMode,
                    ...(gangaMode === 'SCHEDULED'
                      ? { ganga_minutes_before: Number(draft.gangaMinutes) }
                      : {}),
                  }
                : {}),
            }
          : { condition: draft.condition! }),
      };
      if (id && original) {
        const patch: PublicationPatch = {};
        for (const [key, value] of Object.entries(payload)) {
          if (key === 'type' || key === 'initial_stock') continue;
          const before = key === 'pickup_mode' ? original.pickup_mode ?? 'SPECIFIC_ZONE' : original[key as keyof OwnedPublication];
          const equal =
            key === 'price' || key === 'ganga_min_price'
              ? (before == null || value == null ? before === value : Number(before) === value)
              : before === value;
          if (!equal) Object.assign(patch, { [key]: value });
        }
        if (type === 'LIVE' && !draft.gangaPrice && original.ganga_min_price != null) {
          Object.assign(patch, { ganga_min_price: null, ganga_activation_mode: null, ganga_minutes_before: null });
        } else if (type === 'LIVE' && draft.gangaPrice && gangaMode === 'MANUAL' && original.ganga_minutes_before != null) {
          patch.ganga_minutes_before = null;
        }
        if (!Object.keys(patch).length) {
          setError('No hay cambios para guardar.');
          return;
        }
        await savePublication(patch, id);
      } else await savePublication(payload);
      router.dismissTo({ pathname: '/sales', params: { type } });
    } catch (cause) {
      const blocked = publicationContentError(cause);
      if (blocked) {
        setContentMessage(blocked.message);
        setServerErrors(Object.fromEntries(blocked.fields.map(field => [field, field === 'title'
          ? 'Revisa el título: contiene una palabra no permitida.' : 'Revisa la descripción: contiene una palabra no permitida.'])));
        requestField(blocked.fields[0]);
      } else if (stage === 'upload') {
        setPhotoError(apiMessage(cause));
        requestField('photo');
      } else setError(apiMessage(cause));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  function openConfig() {
    setConfig({
      mode: draft.gangaPrice ? gangaMode : 'NONE',
      price: draft.gangaPrice,
      minutes: draft.gangaMinutes,
    });
    setConfigError('');
    setPanel('ganga');
  }

  function saveConfig() {
    if (original?.is_ganga_active) {
      setPanel(undefined);
      return;
    }
    if (config.mode === 'NONE') {
      change('gangaPrice', '');
      change('gangaMinutes', '');
      setPanel(undefined);
      return;
    }
    if (
      !validPrice(config.price) ||
      !validPrice(draft.price) ||
      Number(config.price) >= Number(draft.price)
    ) {
      setConfigError('El precio mínimo debe ser positivo y menor que el precio normal.');
      return;
    }
    const end = localDate(draft.end),
      start = localDate(draft.start);
    if (
      config.mode === 'SCHEDULED' &&
      (!/^\d+$/.test(config.minutes) ||
        Number(config.minutes) < 1 ||
        Number(config.minutes) > 2147483647 ||
        !end ||
        !start ||
        end.getTime() - Number(config.minutes) * 60000 <= Math.max(Date.now(), start.getTime()))
    ) {
      setConfigError('Programa la oferta dentro del horario y en el futuro.');
      return;
    }
    setGangaMode(config.mode);
    change('gangaPrice', config.price);
    change('gangaMinutes', config.mode === 'SCHEDULED' ? config.minutes : '');
    setPanel(undefined);
  }

  function openTime(field: 'start' | 'end') {
    setPickedTime(localDate(draft[field]) ?? new Date());
    setAndroidStep('date');
    setPanel(field);
  }
  const localLabel = (value: string) =>
    localDate(value)?.toLocaleString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }) ?? 'Seleccionar horario';
  const timedPanel = panel === 'start' || panel === 'end';
  const scheduledAt =
    localDate(draft.end) && /^\d+$/.test(config.minutes)
      ? new Date(localDate(draft.end)!.getTime() - Number(config.minutes) * 60000)
      : null;
  const configPriceError = configError.startsWith('El precio mínimo') ? configError : undefined;
  const configScheduleError = configError.startsWith('Programa la oferta') ? configError : undefined;

  return (
    <SafeAreaView testID="publication-editor" style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            accessibilityState={{ disabled: loading }}
            disabled={loading}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={COLORS.primary}
              accessible={false}
            />
            <AppText style={styles.link}>Volver</AppText>
          </Pressable>
          <AppText variant="title" accessibilityRole="header">{id ? 'Editar publicación' : initialType ? PUBLICATION_COPY[initialType].formTitle : 'Nueva publicación'}</AppText>
        </View>
        {notice ? <ScrollView testID="publication-form-notice" style={styles.notice} contentContainerStyle={styles.noticeContent} keyboardShouldPersistTaps="handled">
          <AppText accessibilityRole="alert" style={styles.errorText}>{notice}</AppText>
          {firstError ? <PrimaryButton compact variant="ghost" title="Ir al primer campo" disabled={loading} onPress={() => requestField(firstError)} /> :
            loadError ? <PrimaryButton compact variant="ghost" title="Reintentar carga" onPress={() => setAttempt(n => n + 1)} /> : null}
        </ScrollView> : null}
        <ScrollView
          {...MARKETPLACE_SCROLL_PROPS}
          ref={scrollRef}
          testID="publication-form-scroll"
          style={styles.fill}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          onContentSizeChange={focusPending}
        >
          {!id && !initialType ? <TypeSelector
            value={type}
            disabled={!!id || loading}
            onChange={next => {
              if (next !== type) {
                setType(next);
                setCategoryId(undefined);
              }
            }}
          /> : null}
          {id && !editingReady ? (
            <DataState
              kind="loading"
              title="Cargando publicación…"
            />
          ) : (
            <>
              <View style={styles.fieldGroup} onLayout={event => { fieldPositions.current.photo = event.nativeEvent.layout.y; }}>
              <Pressable
                ref={photoRef}
                accessibilityRole="button"
                disabled={loading}
                accessibilityState={{ disabled: loading }}
                accessibilityHint={problems.photo}
                accessibilityLabel={
                  asset || existingImage ? 'Cambiar foto del producto' : 'Añadir foto del producto'
                }
                style={({ pressed }) => [
                  styles.photo,
                  problems.photo && styles.controlError,
                  !asset && !existingImage && styles.photoEmpty,
                  loading && styles.disabled,
                  pressed && styles.pressed,
                ]}
                onPress={() => setPanel('photo')}
              >
                {asset || existingImage ? (
                  <>
                    <ExpoImage
                      testID="selected-publication-image"
                      source={{ uri: asset?.uri ?? existingImage }}
                      style={styles.image}
                      contentFit="cover"
                    />
                    <View style={styles.photoCaption}>
                      <AppText
                        variant="caption"
                        style={styles.flex}
                      >
                        Foto del {type === 'LIVE' ? 'producto' : 'artículo'}
                      </AppText>
                      <View style={styles.photoAction}>
                        <Ionicons
                          name="camera-outline"
                          size={18}
                          color={COLORS.primary}
                          accessible={false}
                        />
                        <AppText
                          variant="label"
                          style={styles.link}
                        >
                          Cambiar foto
                        </AppText>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={32}
                      color={COLORS.primary}
                      accessible={false}
                    />
                    <AppText variant="heading">
                      Añadir foto del {type === 'LIVE' ? 'producto' : 'artículo'}
                    </AppText>
                    <AppText variant="caption">Cámara o galería · máx. 5 MiB</AppText>
                  </>
                )}
              </Pressable>
              <FieldMessage message={problems.photo} />
              {photoSettings && photoError ? (
                <PrimaryButton
                  title="Abrir configuración"
                  variant="ghost"
                  compact
                  accessibilityHint="Abre los ajustes de la aplicación para conceder el permiso"
                  onPress={() => {
                    Linking.openSettings().catch(() => {
                      setPhotoSettings(false);
                      setPhotoError('No se pudo abrir Configuración. Ábrela desde tu teléfono y concede el permiso a TapCampus.');
                    });
                  }}
                />
              ) : null}
              </View>
              <AppText
                variant="heading"
                accessibilityRole="header"
                style={styles.section}
              >
                Producto
              </AppText>
              <View
                onLayout={event => {
                  fieldPositions.current.title = event.nativeEvent.layout.y;
                }}
              >
                <CustomInput
                  ref={titleRef}
                  label="Título"
                  surface="white"
                  editable={!loading}
                  error={fieldErrors.title}
                  announceError={false}
                  placeholder="¿Qué vendes?"
                  maxLength={TITLE_MAX}
                  value={draft.title}
                  onChangeText={value => change('title', value)}
                />
              </View>
              <View
                onLayout={event => {
                  fieldPositions.current.description = event.nativeEvent.layout.y;
                }}
              >
                <CustomInput
                  ref={descriptionRef}
                  label="Descripción"
                  editable={!loading}
                  error={fieldErrors.description}
                  announceError={false}
                  surface="white"
                  placeholder="Describe el producto y agrega una referencia para la entrega."
                  maxLength={DESCRIPTION_MAX}
                  value={draft.description}
                  onChangeText={value => change('description', value)}
                  multiline
                />
              </View>
              {type === 'STATIC' ? <FormPicker
                label="Condición"
                controlRef={conditionRef}
                onLayout={event => { fieldPositions.current.condition = event.nativeEvent.layout.y; }}
                error={problems.condition}
                value={draft.condition === 'NEW' ? 'Nuevo' : draft.condition === 'USED' ? 'Usado' : undefined}
                placeholder="Seleccionar condición"
                icon="pricetag-outline"
                disabled={loading}
                onPress={() => setPanel('condition')}
              /> : null}
              <FormPicker
                label="Categoría"
                controlRef={categoryRef}
                onLayout={event => { fieldPositions.current.category = event.nativeEvent.layout.y; }}
                error={problems.category}
                value={categoryOptions.find(c => c.id === categoryId)?.name}
                placeholder="Seleccionar categoría"
                icon="grid-outline"
                disabled={loading}
                onPress={() => setPanel('category')}
              />
              {categoryError ? <PrimaryButton compact variant="ghost" title="Reintentar categorías" disabled={loading} onPress={() => setCategoryAttempt(n => n + 1)} /> : null}
              <AppText
                variant="heading"
                accessibilityRole="header"
                style={styles.section}
              >
                {type === 'LIVE' ? 'Precio y disponibilidad' : 'Precio'}
              </AppText>
              <View
                style={[styles.row, stacked && styles.stacked]}
                onLayout={event => {
                  fieldPositions.current.price = event.nativeEvent.layout.y;
                  fieldPositions.current.stock = event.nativeEvent.layout.y + stockOffset.current;
                }}
              >
                <View style={styles.flex}>
                  <CustomInput
                    ref={priceRef}
                    label={type === 'LIVE' ? 'Precio normal' : 'Precio'}
                    accessibilityLabel="Precio"
                    surface="white"
                    style={styles.priceInput}
                    error={fieldErrors.price}
                    announceError={false}
                    placeholder="$0.00"
                    value={draft.price}
                    onChangeText={value => change('price', value)}
                    keyboardType="decimal-pad"
                    editable={!loading && !original?.is_ganga_active}
                  />
                </View>
                {type === 'LIVE' ? (
                  <View
                    style={styles.flex}
                    onLayout={event => {
                      stockOffset.current = event.nativeEvent.layout.y;
                      fieldPositions.current.stock =
                        (fieldPositions.current.price ?? 0) + event.nativeEvent.layout.y;
                    }}
                  >
                    <CustomInput
                      ref={stockRef}
                      label="Stock disponible"
                      surface="white"
                      editable={!loading}
                      error={fieldErrors.stock}
                      announceError={false}
                      placeholder="Unidades"
                      value={draft.stock}
                      onChangeText={value => change('stock', value)}
                      keyboardType="number-pad"
                    />
                  </View>
                ) : null}
              </View>
              <AppText
                variant="heading"
                accessibilityRole="header"
                style={styles.section}
              >
                Entrega
              </AppText>
              <FormPicker
                label="Zona"
                controlRef={zoneRef}
                onLayout={event => { fieldPositions.current.zone = event.nativeEvent.layout.y; }}
                error={problems.zone}
                value={type === 'STATIC' && pickupMode === 'ARRANGED' ? 'Punto de entrega por acordar dentro del campus' : zoneOptions.find(z => z.id === zoneId)?.name}
                placeholder="Seleccionar zona"
                icon="location-outline"
                disabled={loading}
                onPress={() => setPanel('zone')}
              />
              {zoneError ? <PrimaryButton compact variant="ghost" title="Reintentar zonas" disabled={loading} onPress={() => setZoneAttempt(n => n + 1)} /> : null}
              {type === 'LIVE' ? (
                <>
                  <AppText variant="label">Horario de venta</AppText>
                  <View style={[styles.row, stacked && styles.stacked]} onLayout={event => {
                    fieldPositions.current.start = event.nativeEvent.layout.y;
                    fieldPositions.current.end = event.nativeEvent.layout.y + endOffset.current;
                  }}>
                    <View style={styles.flex}>
                      <FormPicker
                        label="Inicio"
                        controlRef={startRef}
                        error={fieldErrors.start}
                        value={localLabel(draft.start)}
                        placeholder="Seleccionar horario"
                        icon="time-outline"
                        disabled={loading}
                        accessibilityLabel="Elegir inicio de venta"
                        onPress={() => openTime('start')}
                      />
                    </View>
                    <View style={styles.flex} onLayout={event => { endOffset.current = event.nativeEvent.layout.y; fieldPositions.current.end = (fieldPositions.current.start ?? 0) + endOffset.current; }}>
                      <FormPicker
                        label="Fin"
                        controlRef={endRef}
                        error={fieldErrors.end}
                        value={localLabel(draft.end)}
                        placeholder="Seleccionar horario"
                        icon="time-outline"
                        disabled={loading}
                        accessibilityLabel="Elegir fin de venta"
                        onPress={() => openTime('end')}
                      />
                    </View>
                  </View>
                  <View style={styles.fieldGroup} onLayout={event => { fieldPositions.current.offer = event.nativeEvent.layout.y; }}><Pressable
                    ref={offerRef}
                    accessibilityRole="button"
                    accessibilityLabel="Precio de oferta"
                    accessibilityState={{ disabled: loading }}
                    accessibilityHint={fieldErrors.offer}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.ganga,
                      fieldErrors.offer && styles.controlError,
                      loading && styles.disabled,
                      pressed && styles.pressed,
                    ]}
                    onPress={openConfig}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={22}
                      color={COLORS.ganga}
                      accessible={false}
                    />
                    <View style={styles.pickerBody}>
                      <AppText
                        variant="label"
                        style={styles.gangaText}
                      >
                        Precio de oferta · {original?.is_ganga_active ? 'Activa' : 'Configurar'}
                      </AppText>
                      <AppText variant="caption">
                        {draft.gangaPrice
                          ? `${gangaMode === 'MANUAL' ? 'Manual' : 'Programada'} · $${draft.gangaPrice}${gangaMode === 'SCHEDULED' ? ` · ${draft.gangaMinutes} min antes del fin` : ''}`
                          : 'Sin configurar · opcional'}
                      </AppText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={COLORS.ganga}
                      accessible={false}
                    />
                  </Pressable>
                  <FieldMessage message={fieldErrors.offer} /></View>
                </>
              ) : (
                <View style={styles.info}>
                  <AppText
                    variant="label"
                    style={styles.link}
                  >
                    Sin stock ni temporizador
                  </AppText>
                  <AppText variant="caption">
                    Los compradores contactan por WhatsApp directamente.
                  </AppText>
                </View>
              )}
            </>
          )}
        </ScrollView>
        <View style={styles.submit}>
          <PrimaryButton
            title={id ? 'Guardar cambios' : type === 'STATIC' ? PUBLICATION_COPY.STATIC.createAction : 'Publicar'}
            loadingTitle={id ? 'Guardando…' : 'Publicando…'}
            disabled={!!id && (!editingReady || !original)}
            loading={loading}
            onPress={() => void submit()}
          />
        </View>
      </KeyboardAvoidingView>
      <Sheet
        visible={panel === 'photo'}
        title="Foto del producto"
        onClose={() => setPanel(undefined)}
      >
        <PrimaryButton
          title="Tomar foto"
          onPress={() => {
            setPanel(undefined);
            void pick('camera');
          }}
        />
        <PrimaryButton
          title="Elegir de galería"
          variant="secondary"
          onPress={() => {
            setPanel(undefined);
            void pick('gallery');
          }}
        />
      </Sheet>
      <Sheet visible={panel === 'condition'} title="Condición del artículo" onClose={() => setPanel(undefined)}>
        <OptionGrid
          options={[{ id: 1, name: 'Nuevo' }, { id: 2, name: 'Usado' }]}
          value={draft.condition === 'NEW' ? 1 : draft.condition === 'USED' ? 2 : undefined}
          onChange={value => {
            setDraft(previous => ({ ...previous, condition: value === 1 ? 'NEW' : 'USED' }));
            setPanel(undefined);
          }}
        />
      </Sheet>
      <Sheet
        visible={panel === 'zone' || panel === 'category'}
        title={panel === 'zone' ? 'Zona' : 'Categoría'}
        onClose={() => setPanel(undefined)}
      >
        {panel === 'zone' && type === 'STATIC' ? <PrimaryButton title="Punto de entrega por acordar dentro del campus" variant={pickupMode === 'ARRANGED' ? 'primary' : 'secondary'} onPress={() => { setPickupMode('ARRANGED'); setZoneId(undefined); setPanel(undefined); }} /> : null}
        {(panel === 'zone' ? zoneLoading : categoryLoading) ? (
          <DataState
            kind="loading"
            title="Cargando opciones…"
          />
        ) : (panel === 'zone' ? zoneOptions : categoryOptions).length === 0 ? (
          <DataState
            kind="error"
            title="No pudimos cargar las opciones"
            action="Reintentar"
            description={panel === 'zone' ? zoneError : categoryError}
            onAction={() => panel === 'zone' ? setZoneAttempt(n => n + 1) : setCategoryAttempt(n => n + 1)}
          />
        ) : (
          <OptionGrid
            key={panel}
            searchLabel={panel === 'category' ? 'Buscar categorías' : 'Buscar zonas'}
            options={panel === 'zone' ? zoneOptions : categoryOptions}
            value={panel === 'zone' ? zoneId : categoryId}
            onChange={value => {
              if (panel === 'zone') { setZoneId(value); setPickupMode('SPECIFIC_ZONE'); }
              else setCategoryId(value);
              setPanel(undefined);
            }}
          />
        )}
      </Sheet>
      <Sheet
        visible={panel === 'ganga'}
        title="Precio de oferta"
        subtitle="El descuento se aplica únicamente a reservas nuevas."
        onClose={() => setPanel(undefined)}
        footer={
          <PrimaryButton
            title={original?.is_ganga_active ? 'Cerrar' : 'Guardar configuración'}
            onPress={saveConfig}
          />
        }
      >
        <View style={[styles.row, stacked && styles.stacked]}>
          {(['NONE', 'MANUAL', 'SCHEDULED'] as const).map(mode => (
            <PrimaryButton
              key={mode}
              title={mode === 'NONE' ? 'Sin oferta' : mode === 'MANUAL' ? 'Manual' : 'Programada'}
              compact
              style={styles.flex}
              variant={config.mode === mode ? 'primary' : 'secondary'}
              disabled={loading || !!original?.is_ganga_active}
              onPress={() => {
                setConfig(previous => ({ ...previous, mode }));
                setConfigError('');
              }}
            />
          ))}
        </View>
        {config.mode !== 'NONE' ? (
          <>
            <CustomInput
              label="Precio mínimo"
              accessibilityLabel="Precio de oferta opcional"
              surface="white"
              placeholder="$65"
              error={configPriceError}
              value={config.price}
              editable={!loading && !original?.is_ganga_active}
              keyboardType="decimal-pad"
              onChangeText={price => {
                setConfig(previous => ({ ...previous, price: normalizePrice(price) }));
                setConfigError('');
              }}
            />
            <AppText variant="caption">
              Precio normal: ${draft.price || '—'}. El mínimo debe ser menor.
            </AppText>
            {config.mode === 'SCHEDULED' ? (
              <>
                <OfferDuration
                  value={Number(config.minutes) || 0}
                  maxMinutes={maximumOfferMinutes(localDate(draft.start)?.getTime() ?? NaN, localDate(draft.end)?.getTime() ?? NaN, Date.now())}
                  error={configScheduleError}
                  disabled={loading || !!original?.is_ganga_active}
                  onChange={minutes => {
                    setConfig(previous => ({ ...previous, minutes: String(minutes) }));
                    setConfigError('');
                  }}
                />
                <View style={styles.info}>
                  <AppText
                    variant="label"
                    style={styles.link}
                  >
                    Activación:{' '}
                    {scheduledAt
                      ? scheduledAt.toLocaleString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Elige la anticipación'}
                  </AppText>
                  <AppText variant="caption">La venta termina {localLabel(draft.end)}.</AppText>
                </View>
              </>
            ) : (
              <View style={styles.info}>
                <AppText
                  variant="label"
                  style={styles.link}
                >
                  Tú decides cuándo activar
                </AppText>
                <AppText variant="caption">
                  Activa la oferta desde Mis ventas mientras la publicación siga en horario.
                </AppText>
              </View>
            )}
          </>
        ) : (
          <AppText variant="caption">
            Puedes publicar con el precio normal. Configurar una oferta es opcional.
          </AppText>
        )}
        {configError && !configPriceError && !configScheduleError ? <InlineMessage>{configError}</InlineMessage> : null}
      </Sheet>
      <Sheet
        visible={timedPanel}
        title={panel === 'start' ? 'Inicio de venta' : 'Fin de venta'}
        onClose={() => setPanel(undefined)}
        footer={
          <PrimaryButton
            title="Guardar horario"
            onPress={() => {
              if (panel === 'start' || panel === 'end') change(panel, localInput(pickedTime));
              setPanel(undefined);
            }}
          />
        }
      >
        <AppText variant="label">{pickedTime.toLocaleString('es-MX')}</AppText>
        {timedPanel && (Platform.OS !== 'android' || androidStep) ? (
          <SaleTimePicker
            value={pickedTime}
            mode={Platform.OS === 'android' ? (androidStep ?? 'date') : 'datetime'}
            onDismiss={() => setAndroidStep(undefined)}
            onValueChange={(_event, value) => {
              if (Platform.OS === 'android' && androidStep === 'date') {
                const next = new Date(pickedTime);
                next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
                setPickedTime(next);
                setAndroidStep('time');
              } else {
                setPickedTime(value);
                setAndroidStep(undefined);
              }
            }}
          />
        ) : null}
        {Platform.OS === 'android' && !androidStep ? (
          <PrimaryButton
            title="Cambiar fecha y hora"
            variant="secondary"
            onPress={() => setAndroidStep('date')}
          />
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: SPACE.sm },
  fieldMessage: { gap: SPACE.sm },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.sm },
  errorText: { color: COLORS.error, flexShrink: 1 },
  controlError: { borderColor: COLORS.error, borderWidth: 1 },
  notice: { flexBasis: 'auto', flexGrow: 0, flexShrink: 0, maxHeight: '30%', marginHorizontal: SPACE.page, marginVertical: SPACE.sm, backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md },
  noticeContent: { padding: SPACE.md, gap: SPACE.xs },
  screen: { flex: 1, backgroundColor: COLORS.background },
  fill: { flex: 1 },
  flex: { flex: 1, gap: SPACE.sm },
  header: { paddingHorizontal: SPACE.page },
  back: {
    minHeight: METRICS.compactControl,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.xs,
  },
  scroll: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: SPACE.page,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.xxl,
    gap: SPACE.lg,
  },
  submit: {
    paddingHorizontal: SPACE.page,
    paddingVertical: SPACE.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  row: { flexDirection: 'row', gap: SPACE.lg },
  stacked: { flexDirection: 'column' },
  link: { color: COLORS.primary },
  muted: { color: COLORS.textMedium },
  section: {
    marginTop: SPACE.lg,
    paddingTop: SPACE.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  photo: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoEmpty: {
    minHeight: 184,
    backgroundColor: COLORS.inputBg,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.sm,
    padding: SPACE.xl,
  },
  image: { width: '100%', aspectRatio: 1.65 },
  photoCaption: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACE.sm,
    padding: SPACE.md,
  },
  photoAction: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm },
  picker: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    padding: SPACE.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerBody: { flex: 1, minWidth: 0, gap: SPACE.xs },
  priceInput: { ...TYPE.heading, color: COLORS.primary },
  ganga: {
    minHeight: METRICS.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.md,
    paddingVertical: SPACE.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACE.sm,
  },
  gangaText: { color: COLORS.ganga },
  disabled: { opacity: 0.55 },
  info: {
    backgroundColor: COLORS.primarySoft,
    padding: SPACE.lg,
    borderRadius: RADIUS.md,
    gap: SPACE.sm,
  },
  pressed: { opacity: 0.75 },
});
