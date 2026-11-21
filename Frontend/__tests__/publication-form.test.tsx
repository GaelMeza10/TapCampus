import React from 'react';
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import EditPublication from '../src/app/publication/edit';
import { categories, myPublications, publicationContentError, savePublication, uploadImage, zones } from '../src/services/marketplace';

const mockDismissTo = jest.fn();
const mockParams: { id?: string } = {};
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), dismissTo: mockDismissTo }), useLocalSearchParams: () => mockParams }));
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), requestMediaLibraryPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({
  zones: jest.fn(async () => [{ id: 1, name: 'Ingeniería' }]), categories: jest.fn(async (type: string) => type === 'LIVE' ? [{ id: 2, name: 'Comida', type }] : [{ id: 3, name: 'Libros', type }]),
  savePublication: jest.fn(), uploadImage: jest.fn(), apiMessage: () => 'Error de red',
  myPublications: jest.fn(),
  publicationContentError: jest.fn(),
}));
afterEach(async () => { await cleanup(); });
beforeEach(() => {
  jest.clearAllMocks();
  delete mockParams.id;
  (myPublications as jest.Mock).mockResolvedValue([]);
  (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///libro.jpg', mimeType: 'image/jpeg', fileSize: 1000 }] });
  (uploadImage as jest.Mock).mockResolvedValue('https://api.example/upload.jpg');
  (savePublication as jest.Mock).mockResolvedValue({});
});

test('permiso de cámara denegado muestra error visible y conserva formulario', async () => {
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  const view = await render(<EditPublication />);
  await fireEvent.press(view.getByRole('button', { name: 'Añadir foto del producto' }));
  await fireEvent.press(view.getByRole('button', { name: 'Tomar foto' }));
  await view.findByText('Permite usar la cámara para tomar la foto.');
  await fireEvent.changeText(view.getByLabelText('Título'), 'Borrador conservado');
  expect(view.getByText('Permite usar la cámara para tomar la foto.')).toBeTruthy();
  expect(savePublication).not.toHaveBeenCalled();
});

test('stock negativo se bloquea antes de subir imagen o llamar API', async () => {
  const view = await render(<EditPublication />);
  await fireEvent.changeText(view.getByLabelText('Stock disponible'), '-1');
  await fireEvent.press(view.getByRole('button', { name: 'Publicar' }));
  await view.findByText(/El stock debe ser un entero no negativo/);
  expect(savePublication).not.toHaveBeenCalled();
});

test('Catálogo publica solo sus campos y conserva el borrador ante error', async () => {
  const view = await render(<EditPublication />);
  await fireEvent.press(view.getByRole('tab', { name: 'Catálogo' }));
  await fireEvent.changeText(view.getByLabelText('Título'), 'Libro de cálculo');
  await fireEvent.changeText(view.getByLabelText('Descripción'), 'Usado, completo y sin hojas sueltas.');
  await fireEvent.changeText(view.getByLabelText('Precio'), '180');
  await fireEvent.press(view.getByRole('button', { name: 'Seleccionar zona' }));
  await fireEvent.press(await view.findByRole('radio', { name: 'Ingeniería' }));
  await fireEvent.press(view.getByRole('button', { name: 'Seleccionar categoría' }));
  await fireEvent.press(await view.findByRole('radio', { name: 'Libros' }));
  await fireEvent.press(view.getByRole('button', { name: 'Añadir foto del producto' }));
  await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
  await view.findByTestId('selected-publication-image');
  expect(view.queryByLabelText('Stock disponible')).toBeNull();
  expect(view.queryByRole('button', { name: 'Elegir inicio de venta' })).toBeNull();
  (savePublication as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await view.findByText('Error de red');
  expect(view.getByLabelText('Título').props.value).toBe('Libro de cálculo');
  expect(mockDismissTo).not.toHaveBeenCalled();
  const payload = (savePublication as jest.Mock).mock.calls[0][0];
  expect(payload).toMatchObject({ type: 'STATIC', title: 'Libro de cálculo', zone_id: 1, category_id: 3, price: 180 });
  expect(payload).not.toHaveProperty('initial_stock');
  expect(payload).not.toHaveProperty('start_time');
  expect(payload).not.toHaveProperty('ganga_min_price');
});

test('configurar ganga valida precio, programa y cerrar descarta cambios no guardados', async () => {
  const view = await render(<EditPublication />);
  await fireEvent.changeText(view.getByLabelText('Precio'), '85');
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  await fireEvent.press(view.getByRole('button', { name: 'Programada' }));
  await fireEvent.changeText(view.getByLabelText('Precio de oferta opcional'), '90');
  await fireEvent.changeText(view.getByLabelText('Minutos antes del fin'), '10');
  await fireEvent.press(view.getByRole('button', { name: 'Guardar configuración' }));
  await view.findByText(/El precio mínimo debe ser positivo/);
  await fireEvent.changeText(view.getByLabelText('Precio de oferta opcional'), '65');
  await fireEvent.press(view.getByRole('button', { name: 'Guardar configuración' }));
  await view.findByText('Programada · $65 · 10 min antes del fin');
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  await fireEvent.changeText(view.getByLabelText('Precio de oferta opcional'), '60');
  await fireEvent.press(view.getByRole('button', { name: 'Cerrar panel' }));
  expect(view.getByText('Programada · $65 · 10 min antes del fin')).toBeTruthy();
});

const ownedOffer = (extra = {}) => ({
  id: 'p1', type: 'LIVE', status: 'ACTIVE', title: 'Burrito', description: 'Caliente y completo',
  price: '85.00', image_url: 'https://api.example/upload.jpg', zone_id: 1, category_id: 2,
  initial_stock: 5, current_stock: 3, start_time: '2026-01-01T10:00:25.123Z',
  end_time: '2099-01-01T15:00:25.123Z', is_ganga_active: false,
  ganga_min_price: '65.00', ganga_activation_mode: 'SCHEDULED', ganga_minutes_before: 10,
  ...extra,
});

async function editOffer(extra = {}) {
  mockParams.id = 'p1';
  (myPublications as jest.Mock).mockResolvedValue([ownedOffer(extra)]);
  const view = await render(<EditPublication />);
  await waitFor(() => expect(view.getByLabelText('Título').props.value).toBe('Burrito'));
  return view;
}

test('0037 rechaza precio de oferta igual al normal y señala el campo sin perder el borrador', async () => {
  const view = await render(<EditPublication />);
  await fireEvent.changeText(view.getByLabelText('Título'), 'Producto conservado');
  await fireEvent.changeText(view.getByLabelText('Precio'), '85');
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  await fireEvent.press(view.getByRole('button', { name: 'Manual' }));
  await fireEvent.changeText(view.getByLabelText('Precio de oferta opcional'), '85');
  await fireEvent.press(view.getByRole('button', { name: 'Guardar configuración' }));
  await view.findByText('El precio mínimo debe ser positivo y menor que el precio normal.');
  expect(view.getByLabelText('Precio de oferta opcional').props.value).toBe('85');
  await fireEvent.press(view.getByRole('button', { name: 'Cerrar panel' }));
  expect(view.getByLabelText('Título').props.value).toBe('Producto conservado');
  expect(savePublication).not.toHaveBeenCalled();
});

test('0037 cambia programada a manual con minutos null y conserva instantes originales al guardar', async () => {
  const view = await editOffer();
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  await fireEvent.press(view.getByRole('button', { name: 'Manual' }));
  await fireEvent.press(view.getByRole('button', { name: 'Guardar configuración' }));
  await view.findByText('Manual · $65.00');
  await fireEvent.press(view.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(savePublication).toHaveBeenCalledWith({
    ganga_activation_mode: 'MANUAL', ganga_minutes_before: null,
  }, 'p1'));
  expect(uploadImage).not.toHaveBeenCalled();
});

test('0037 retira configuración con los tres nulls y conserva borrador tras fallo de API', async () => {
  const view = await editOffer();
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  await fireEvent.press(view.getByRole('button', { name: 'Sin oferta' }));
  await fireEvent.press(view.getByRole('button', { name: 'Guardar configuración' }));
  (savePublication as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await fireEvent.press(view.getByRole('button', { name: 'Guardar cambios' }));
  await view.findByText('Error de red');
  expect(savePublication).toHaveBeenCalledWith({
    ganga_min_price: null, ganga_activation_mode: null, ganga_minutes_before: null,
  }, 'p1');
  expect(view.getByLabelText('Título').props.value).toBe('Burrito');
  expect(view.getByTestId('selected-publication-image')).toBeTruthy();
  expect(mockDismissTo).not.toHaveBeenCalled();
});

test('0037 cambia manual a programada sin alterar el resto de la publicación', async () => {
  const view = await editOffer({ ganga_activation_mode: 'MANUAL', ganga_minutes_before: null });
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  await fireEvent.press(view.getByRole('button', { name: 'Programada' }));
  await fireEvent.changeText(view.getByLabelText('Minutos antes del fin'), '10');
  await fireEvent.press(view.getByRole('button', { name: 'Guardar configuración' }));
  await fireEvent.press(view.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(savePublication).toHaveBeenCalledWith({
    ganga_activation_mode: 'SCHEDULED', ganga_minutes_before: 10,
  }, 'p1'));
});

test('0037 oferta activa bloquea precio y todos los modos, incluso legado sin precio previo', async () => {
  const view = await editOffer({ is_ganga_active: true, price: '65.00', price_before_ganga: null });
  expect(view.getByLabelText('Precio').props.editable).toBe(false);
  await fireEvent.press(view.getByText(/Precio de oferta ·/));
  for (const name of ['Sin oferta', 'Manual', 'Programada']) {
    expect(view.getByRole('button', { name }).props.accessibilityState.disabled).toBe(true);
  }
  expect(view.getByLabelText('Precio de oferta opcional').props.editable).toBe(false);
  expect(savePublication).not.toHaveBeenCalled();
});

test('0034 muestra todos los errores y un solo anuncio fuera del formulario desplazable', async () => {
  const view = await render(<EditPublication />);
  await fireEvent.press(view.getByRole('button', { name: 'Publicar' }));
  const notice = await view.findByTestId('publication-form-notice');
  expect(within(notice).getByText('Revisa los campos señalados')).toBeTruthy();
  expect(within(view.getByTestId('publication-form-scroll')).queryByText('Revisa los campos señalados')).toBeNull();
  for (const message of ['Añade una foto del producto.', 'Escribe un título para identificar el producto.', 'Selecciona una categoría.', 'Selecciona una zona.']) expect(view.getByText(message)).toBeTruthy();
  expect(view.getAllByRole('alert')).toHaveLength(1);
  await fireEvent.changeText(view.getByLabelText('Título'), 'Borrador conservado');
  expect(view.queryByText('Escribe un título para identificar el producto.')).toBeNull();
  expect(view.getByText('Selecciona una categoría.')).toBeTruthy();
  await fireEvent.press(view.getByRole('tab', { name: 'Catálogo' }));
  expect(view.queryByText(/El stock debe ser un entero no negativo/)).toBeNull();
  expect(view.getByLabelText('Título').props.value).toBe('Borrador conservado');
  expect(uploadImage).not.toHaveBeenCalled(); expect(savePublication).not.toHaveBeenCalled();
});

async function fillStatic() {
  const view = await render(<EditPublication />);
  await fireEvent.press(view.getByRole('tab', { name: 'Catálogo' }));
  await fireEvent.changeText(view.getByLabelText('Título'), 'Libro de cálculo');
  await fireEvent.changeText(view.getByLabelText('Descripción'), 'Completo y bien conservado');
  await fireEvent.changeText(view.getByLabelText('Precio'), '180');
  await fireEvent.press(view.getByRole('button', { name: 'Seleccionar zona' }));
  await fireEvent.press(await view.findByRole('radio', { name: 'Ingeniería' }));
  await fireEvent.press(view.getByRole('button', { name: 'Seleccionar categoría' }));
  await fireEvent.press(await view.findByRole('radio', { name: 'Libros' }));
  await fireEvent.press(view.getByRole('button', { name: 'Añadir foto del producto' }));
  await fireEvent.press(view.getByRole('button', { name: 'Elegir de galería' }));
  await view.findByTestId('selected-publication-image');
  return view;
}

test('0038 rechazo por ambos textos conserva imagen subida, campos y corrección independiente', async () => {
  const view = await fillStatic();
  (publicationContentError as jest.Mock).mockReturnValueOnce({ message: 'Contenido no permitido: corrige los textos.', fields: ['title', 'description'] });
  (savePublication as jest.Mock).mockRejectedValueOnce(new Error('blocked'));
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await view.findByText('Contenido no permitido: corrige los textos.');
  expect(view.getByText('Revisa el título: contiene una palabra no permitida.')).toBeTruthy();
  expect(view.getByLabelText('Descripción').props.value).toBe('Completo y bien conservado');
  expect(mockDismissTo).not.toHaveBeenCalled();
  await fireEvent.changeText(view.getByLabelText('Título'), 'Título corregido');
  expect(view.queryByText('Revisa el título: contiene una palabra no permitida.')).toBeNull();
  expect(view.getByText('Revisa la descripción: contiene una palabra no permitida.')).toBeTruthy();
  await fireEvent.changeText(view.getByLabelText('Descripción'), 'Descripción corregida');
  expect(view.queryByText('Contenido no permitido: corrige los textos.')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await waitFor(() => expect(mockDismissTo).toHaveBeenCalledTimes(1));
  expect(uploadImage).toHaveBeenCalledTimes(1);
  expect(savePublication).toHaveBeenCalledTimes(2);
});

test('0034 fallo general persiste al escribir y no recarga la publicación ni repite upload', async () => {
  const view = await fillStatic();
  (savePublication as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await view.findByText('Error de red');
  await fireEvent.changeText(view.getByLabelText('Título'), 'Otro título válido');
  expect(view.getByText('Error de red')).toBeTruthy();
  expect(myPublications).not.toHaveBeenCalled();
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await waitFor(() => expect(mockDismissTo).toHaveBeenCalledTimes(1));
  expect(uploadImage).toHaveBeenCalledTimes(1);
});

test('0034 reintentar zona conserva borrador y no vuelve a cargar categorías ni publicación', async () => {
  (zones as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const view = await render(<EditPublication />);
  await view.findByRole('button', { name: 'Reintentar zonas' });
  await fireEvent.changeText(view.getByLabelText('Título'), 'Borrador');
  const categoryCalls = (categories as jest.Mock).mock.calls.length;
  await fireEvent.press(view.getByRole('button', { name: 'Reintentar zonas' }));
  await waitFor(() => expect(view.queryByRole('button', { name: 'Reintentar zonas' })).toBeNull());
  expect(view.getByLabelText('Título').props.value).toBe('Borrador');
  expect(categories).toHaveBeenCalledTimes(categoryCalls);
  expect(myPublications).not.toHaveBeenCalled();
});

test('0034 doble pulsación durante guardado envía una sola solicitud y bloquea edición', async () => {
  const view = await fillStatic();
  let resolveSave: (value: unknown) => void = () => {};
  (savePublication as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { resolveSave = resolve; }));
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await waitFor(() => expect(savePublication).toHaveBeenCalledTimes(1));
  expect(view.getByLabelText('Título').props.editable).toBe(false);
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  expect(savePublication).toHaveBeenCalledTimes(1);
  await act(async () => resolveSave({}));
  await waitFor(() => expect(mockDismissTo).toHaveBeenCalledTimes(1));
});

test('0034 fallo al subir foto conserva selección y aviso al editar; el reintento no publica hasta subir', async () => {
  const view = await fillStatic();
  (uploadImage as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await view.findByText('Error de red');
  expect(savePublication).not.toHaveBeenCalled();
  expect(view.getByTestId('selected-publication-image')).toBeTruthy();
  await fireEvent.changeText(view.getByLabelText('Título'), 'Foto pendiente de subir');
  expect(view.getByText('Error de red')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Publicar artículo' }));
  await waitFor(() => expect(mockDismissTo).toHaveBeenCalledTimes(1));
  expect(uploadImage).toHaveBeenCalledTimes(2);
  expect(savePublication).toHaveBeenCalledTimes(1);
});

test.each([
  { is_ganga_active: true, price: '65.00', price_before_ganga: null },
  { ganga_min_price: '85.00' },
])('0037 permite editar título de oferta activa o configuración histórica igual: %j', async extra => {
  const view = await editOffer(extra);
  await fireEvent.changeText(view.getByLabelText('Título'), 'Título corregido');
  await fireEvent.press(view.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(savePublication).toHaveBeenCalledWith({ title: 'Título corregido' }, 'p1'));
});
