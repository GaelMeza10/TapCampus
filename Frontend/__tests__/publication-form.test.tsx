import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import EditPublication from '../src/app/publication/edit';
import { savePublication, uploadImage } from '../src/services/marketplace';

const mockDismissTo = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), dismissTo: mockDismissTo }), useLocalSearchParams: () => ({}) }));
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), requestMediaLibraryPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({
  zones: jest.fn(async () => [{ id: 1, name: 'Ingeniería' }]), categories: jest.fn(async (type: string) => type === 'LIVE' ? [{ id: 2, name: 'Comida', type }] : [{ id: 3, name: 'Libros', type }]),
  savePublication: jest.fn(), uploadImage: jest.fn(), apiMessage: () => 'Error de red',
}));
afterEach(async () => { await cleanup(); });
beforeEach(() => {
  jest.clearAllMocks();
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
