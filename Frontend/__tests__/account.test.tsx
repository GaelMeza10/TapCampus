import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import MyAccount from '../src/app/account';
import { BottomNavigation, type MarketTab } from '../src/components/marketplace-shell';
import { myProfile } from '../src/services/auth.service';
import { COLORS } from '../src/theme';

const mockLogout = jest.fn();
const mockNavigate = jest.fn();
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: mockLogout }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockNavigate }) }));
jest.mock('../src/services/auth.service', () => ({ myProfile: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({ apiMessage: () => 'Error de conexión' }));
const profile = { id: 'u1', name: 'Ana Pérez', email: 'ana@uabc.edu.mx', phone: '+526641234567' };
beforeEach(() => { jest.clearAllMocks(); (myProfile as jest.Mock).mockReset().mockResolvedValue(profile); mockLogout.mockReset().mockResolvedValue(undefined); });

test.each<[MarketTab, string]>([['explore', 'Explorar'], ['reservations', 'Reservas'], ['sales', 'Mis ventas'], ['account', 'Cuenta']])('módulo %s tiene selección única, fondo translúcido y etiqueta legible', async (active, label) => {
  const view = await render(<BottomNavigation active={active} />);
  const tabs = view.getAllByRole('tab');
  expect(tabs).toHaveLength(4);
  expect(tabs.filter(tab => tab.props.accessibilityState.selected)).toHaveLength(1);
  const selected = view.getByRole('tab', { name: label });
  expect(selected.props.accessibilityState.selected).toBe(true);
  expect(StyleSheet.flatten(selected.props.style).backgroundColor).toBe(COLORS.navigationSelected);
  expect(StyleSheet.flatten(view.getByText(label).props.style).color).toBe(COLORS.primary);
  await fireEvent.press(selected);
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('Cuenta navega a su módulo desde otra pestaña', async () => {
  const view = await render(<BottomNavigation active="explore" />);
  await fireEvent.press(view.getByRole('tab', { name: 'Cuenta' }));
  expect(mockNavigate).toHaveBeenCalledWith('/account');
});

test('Mi cuenta muestra datos recibidos, sin contraseña/identificador ni opciones de edición', async () => {
  const view = await render(<MyAccount />);
  expect(await view.findByText(profile.name)).toBeTruthy();
  expect(view.getByText(profile.email)).toBeTruthy();
  expect(view.getByText(profile.phone)).toBeTruthy();
  expect(view.queryByText('u1')).toBeNull();
  expect(view.queryByText(/Contraseña|Editar/)).toBeNull();
  expect(view.getByRole('tab', { name: 'Cuenta' }).props.accessibilityState.selected).toBe(true);
  expect(mockLogout).not.toHaveBeenCalled();
});

test('carga no inventa información; error permite reintentar', async () => {
  let reject!: (reason: Error) => void;
  (myProfile as jest.Mock).mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
  const view = await render(<MyAccount />);
  expect(view.getByText('Cargando tu cuenta…')).toBeTruthy();
  expect(view.queryByText(profile.name)).toBeNull();
  await act(async () => reject(new Error('offline')));
  expect(await view.findByText('No pudimos cargar tu información')).toBeTruthy();
  await fireEvent.press(view.getByText('Reintentar'));
  expect(await view.findByText(profile.name)).toBeTruthy();
});

test.each([404, 500])('un error técnico %s nunca muestra mensajes del servidor y permite recuperar el perfil', async status => {
  (myProfile as jest.Mock).mockRejectedValueOnce({ response: { status, data: { message: 'Cannot GET /auth/me' } } });
  const view = await render(<MyAccount />);
  expect(await view.findByText('No pudimos cargar tu información')).toBeTruthy();
  expect(view.queryByText(/Cannot GET|\/auth\/me/)).toBeNull();
  expect(view.getByText(/Revisa tu conexión/)).toBeTruthy();
  expect(view.getByRole('button', { name: 'Cerrar sesión' })).toBeTruthy();
  await fireEvent.press(view.getByText('Reintentar'));
  expect(await view.findByText(profile.email)).toBeTruthy();
});

test('cierre fallido conserva datos y permite reintentar', async () => {
  mockLogout.mockRejectedValueOnce(new Error('SecureStore'));
  const view = await render(<MyAccount />);
  await view.findByText(profile.name);
  await fireEvent.press(view.getByText('Cerrar sesión'));
  expect(view.getByText('No se pudo cerrar la sesión. Inténtalo de nuevo.')).toBeTruthy();
  expect(view.getByText(profile.email)).toBeTruthy();
  await fireEvent.press(view.getByText('Cerrar sesión'));
  expect(mockLogout).toHaveBeenCalledTimes(2);
});

test('cierre pendiente bloquea repetición y navegación', async () => {
  let resolve!: () => void;
  mockLogout.mockImplementationOnce(() => new Promise<void>(done => { resolve = done; }));
  const view = await render(<MyAccount />);
  await view.findByText(profile.name);
  await fireEvent.press(view.getByText('Cerrar sesión'));
  expect(view.getByText('Cerrando sesión…')).toBeTruthy();
  await fireEvent.press(view.getByText('Cerrando sesión…'));
  expect(view.getByRole('tab', { name: 'Explorar' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(view.getByRole('tab', { name: 'Explorar' }));
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockLogout).toHaveBeenCalledTimes(1);
  await act(async () => resolve());
});
