import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import EditPublication from '../src/app/publication/edit';
import { categories, savePublication, uploadImage } from '../src/services/marketplace';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), replace: jest.fn() }), useLocalSearchParams: () => ({}) }));
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), requestMediaLibraryPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), launchImageLibraryAsync: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({
  zones: jest.fn(async () => [{ id: 1, name: 'FIAD' }]), categories: jest.fn(async (type: string) => type === 'LIVE' ? [{ id: 2, name: 'Comida', type }] : [{ id: 3, name: 'Libros', type }]),
  savePublication: jest.fn(), uploadImage: jest.fn(), apiMessage: () => 'Error de red',
}));

afterEach(async () => { await cleanup(); });
beforeEach(() => jest.clearAllMocks());

test('permiso de cámara denegado muestra error visible y conserva formulario', async () => {
  (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  const view = await render(<EditPublication />);
  fireEvent.press(view.getByText('Tomar foto'));
  await view.findByText('Permite usar la cámara para tomar la foto.');
  expect(savePublication).not.toHaveBeenCalled();
});

test('stock negativo se bloquea antes de subir imagen o llamar API', async () => {
  const view = await render(<EditPublication />);
  fireEvent.changeText(view.getByLabelText('Stock disponible'), '-1');
  await waitFor(() => expect(view.getByLabelText('Stock disponible').props.value).toBe('-1'));
  fireEvent.press(view.getByRole('button', { name: 'Publicar' }));
  await view.findByText(/El stock debe ser un entero no negativo/);
  expect(savePublication).not.toHaveBeenCalled();
});

test('STATIC muestra su categoría y foto elegida sin campos LIVE', async () => {
  (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///libro.jpg', mimeType: 'image/jpeg', fileSize: 1000 }] });
  const view = await render(<EditPublication />);
  fireEvent.press(view.getByText(/Estático/));
  await view.findByText('Libros');
  fireEvent.press(view.getByText('FIAD'));
  fireEvent.press(view.getByText('Libros'));
  fireEvent.press(view.getByText('Elegir de galería'));
  await waitFor(() => expect(view.getByTestId('selected-publication-image').props.source.uri).toBe('file:///libro.jpg'));
  expect(view.queryByLabelText('Stock disponible')).toBeNull();
  expect(view.queryByLabelText('Inicio')).toBeNull();
  expect(uploadImage).not.toHaveBeenCalled();
  expect(savePublication).not.toHaveBeenCalled();
});
