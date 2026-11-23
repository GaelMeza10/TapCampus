import React from 'react';
import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import HomePage from '../src/app/(tabs)/homePage';
import EditPublication from '../src/app/publication/edit';
import Sales from '../src/app/(tabs)/sales';
import { myPublications } from '../src/services/marketplace';

jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: jest.fn() }) }));
jest.mock('socket.io-client', () => ({ io: () => ({ on: jest.fn(), disconnect: jest.fn() }) }));
jest.mock('../src/services/marketplace', () => ({
  listPublications: jest.fn(async () => []), myReservations: jest.fn(async () => []),
  zones: jest.fn(async () => [{ id: 1, name: 'Ingeniería' }]),
  categories: jest.fn(async (type: string) => [{ id: type === 'LIVE' ? 1 : 2, name: type === 'LIVE' ? 'Comida' : 'Libros', type }]),
  myPublications: jest.fn(async () => []), savePublication: jest.fn(), uploadImage: jest.fn(),
  sellerReservations: jest.fn(async () => []),
  apiMessage: () => 'Error de red', publicationContentError: jest.fn(),
}));

test.each([
  ['Ahora en el campus', 'Ahora en el campus', 'LIVE'],
  ['Productos', 'Nuevo producto', 'STATIC'],
])('Vender → %s abre directamente su formulario', async (label, title, type) => {
  const view = await renderRouter({
    _layout: () => <Stack screenOptions={{ headerShown: false, animation: 'none' }} />,
    homePage: HomePage,
    'publication/edit': EditPublication,
  }, { initialUrl: '/homePage' });

  await fireEvent.press(await screen.findByRole('button', { name: 'Vender' }));
  expect(screen.queryByRole('button', { name: 'Venta en vivo' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: label }));
  expect(view).toHavePathname('/publication/edit');
  expect(view).toHaveSearchParams({ type });
  expect(await screen.findByRole('header', { name: title })).toBeTruthy();
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(!!screen.queryByLabelText('Stock disponible')).toBe(type === 'LIVE');
  expect(!!screen.queryByRole('button', { name: 'Seleccionar condición' })).toBe(type === 'STATIC');
  expect(screen.queryByText('Disponibles ahora')).toBeNull();
  expect(screen.queryByText('Catálogo')).toBeNull();
});

test.each([
  ['LIVE', 'Ahora en el campus', 'AHORA EN EL CAMPUS', 'Publicar en el campus'],
  ['STATIC', 'Productos', 'PRODUCTO', 'Publicar producto'],
])('Mis ventas → editar → volver → crear mantiene %s y sus nombres', async (type, label, badge, createAction) => {
  const publication = [{
    id: 'own', type, title: 'Mi publicación', description: 'Descripción', price: '80.00', status: 'ACTIVE',
    seller: { name: 'Ana' }, seller_id: 'seller', image_url: 'https://example.test/photo.png', zone_id: 1,
    category_id: type === 'LIVE' ? 1 : 2, current_stock: type === 'LIVE' ? 3 : null,
    initial_stock: type === 'LIVE' ? 3 : null, condition: type === 'STATIC' ? 'USED' : null,
    start_time: type === 'LIVE' ? new Date(Date.now() - 60000).toISOString() : null,
    end_time: type === 'LIVE' ? new Date(Date.now() + 3600000).toISOString() : null,
    is_ganga_active: false,
  }];
  (myPublications as jest.Mock).mockResolvedValue(publication);
  // Keep the same owned publication available when the editor asks the server for its type.
  const view = await renderRouter({
    _layout: () => <Stack screenOptions={{ headerShown: false, animation: 'none' }} />,
    sales: Sales,
    'publication/edit': EditPublication,
  }, { initialUrl: '/sales?type=' + type });
  expect(await screen.findByText(new RegExp(badge + ' · ACTIVA'))).toBeTruthy();
  expect(screen.getByRole('tab', { name: label }).props.accessibilityState.selected).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'Editar publicación' }));
  expect(await screen.findByRole('header', { name: 'Editar publicación' })).toBeTruthy();
  await screen.findByTestId('selected-publication-image');
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(!!screen.queryByLabelText('Stock disponible')).toBe(type === 'LIVE');
  expect(!!screen.queryByRole('button', { name: 'Usado' })).toBe(type === 'STATIC');
  await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
  expect(view).toHavePathname('/sales');
  expect(screen.getByRole('tab', { name: label }).props.accessibilityState.selected).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: createAction }));
  expect(view).toHaveSearchParams({ type });
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(!!screen.queryByLabelText('Stock disponible')).toBe(type === 'LIVE');
});
