import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import MyAccount from '../src/app/(tabs)/account';
import { BottomNavigation, type MarketTab } from '../src/components/marketplace-shell';
import { myProfile, updateProfile } from '../src/services/auth.service';
import { COLORS } from '../src/theme';
import { accountInitials } from '../src/components/account-ui';

const mockLogout = jest.fn();
const mockNavigate = jest.fn();
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ logout: mockLogout }) }));
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockNavigate }) }));
jest.mock('../src/services/auth.service', () => ({ myProfile: jest.fn(), updateProfile: jest.fn() }));
jest.mock('../src/services/marketplace', () => ({ apiMessage: () => 'Error de conexión' }));
const profile = { id: 'u1', name: 'Ana Pérez', email: 'ana@uabc.edu.mx', phone: '+526641234567' };
beforeEach(() => { jest.clearAllMocks(); (myProfile as jest.Mock).mockReset().mockResolvedValue(profile); (updateProfile as jest.Mock).mockReset().mockResolvedValue(profile); mockLogout.mockReset().mockResolvedValue(undefined); });

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

test('Mi cuenta muestra datos recibidos y edición, sin contraseña ni identificador', async () => {
  const view = await render(<MyAccount />);
  expect(await view.findByText(profile.name)).toBeTruthy();
  expect(view.getByText(profile.email)).toBeTruthy();
  expect(view.getByText(profile.phone)).toBeTruthy();
  expect(view.queryByText('u1')).toBeNull();
  expect(view.queryByText(/Contraseña/)).toBeNull();
  expect(view.getByText('Editar datos')).toBeTruthy();
  expect(view.getByRole('tab', { name: 'Cuenta' }).props.accessibilityState.selected).toBe(true);
  expect(mockLogout).not.toHaveBeenCalled();
});

test('editor conserva correo como texto, valida cambios y Cancelar descarta el borrador', async () => {
  const view = await render(<MyAccount />);
  await fireEvent.press(await view.findByText('Editar datos'));
  expect(view.getByLabelText('Nombre completo').props.value).toBe(profile.name);
  expect(view.getByLabelText('Teléfono').props.value).toBe(profile.phone);
  expect(view.queryByLabelText('Correo institucional')).toBeNull();
  expect(view.getByRole('button', { name: 'Guardar cambios' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.changeText(view.getByLabelText('Nombre completo'), '  ');
  expect(view.getByText('Escribe tu nombre completo.')).toBeTruthy();
  await fireEvent.changeText(view.getByLabelText('Teléfono'), '+15512345678');
  expect(view.getByRole('button', { name: 'Guardar cambios' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(view.getByRole('button', { name: 'Cancelar' }));
  expect(view.getByText(profile.name)).toBeTruthy();
  await fireEvent.press(view.getByText('Editar datos'));
  expect(view.getByLabelText('Teléfono').props.value).toBe(profile.phone);
  expect(updateProfile).not.toHaveBeenCalled();
});

test('fallo conserva borrador, reintento guarda datos normalizados y mantiene sesión', async () => {
  const updated = { ...profile, name: 'Ana María Pérez', phone: '+525512345678' };
  (updateProfile as jest.Mock).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(updated);
  const view = await render(<MyAccount />);
  await fireEvent.press(await view.findByText('Editar datos'));
  await fireEvent.changeText(view.getByLabelText('Nombre completo'), '  Ana   María Pérez  ');
  await fireEvent.changeText(view.getByLabelText('Teléfono'), '55 1234 5678');
  await fireEvent.press(view.getByText('Guardar cambios'));
  expect(await view.findByText(/No se pudieron guardar tus cambios/)).toBeTruthy();
  expect(view.getByLabelText('Nombre completo').props.value).toBe('  Ana   María Pérez  ');
  await fireEvent.press(view.getByText('Guardar cambios'));
  expect(await view.findByText('Datos actualizados.')).toBeTruthy();
  expect(view.getByText(updated.phone)).toBeTruthy();
  expect(view.getByText(updated.name)).toBeTruthy();
  expect(updateProfile).toHaveBeenLastCalledWith({ name: updated.name, phone: updated.phone });
  expect(mockLogout).not.toHaveBeenCalled();
});

test('guardado bloquea duplicados, campos, cancelación, logout y navegación', async () => {
  let done!: (value: typeof profile) => void;
  (updateProfile as jest.Mock).mockImplementation(() => new Promise(resolve => { done = resolve; }));
  const view = await render(<MyAccount />);
  await fireEvent.press(await view.findByText('Editar datos'));
  await fireEvent.changeText(view.getByLabelText('Teléfono'), '3312345678');
  await fireEvent.press(view.getByText('Guardar cambios'));
  await fireEvent.press(view.getByText('Guardando cambios…'));
  expect(view.getByLabelText('Teléfono').props.editable).toBe(false);
  expect(view.getByRole('button', { name: 'Cancelar' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(view.getByText('Cerrar sesión'));
  await fireEvent.press(view.getByRole('tab', { name: 'Explorar' }));
  expect(mockLogout).not.toHaveBeenCalled(); expect(mockNavigate).not.toHaveBeenCalled();
  expect(updateProfile).toHaveBeenCalledTimes(1);
  expect(updateProfile).toHaveBeenCalledWith({ phone: '+523312345678' });
  await act(async () => done({ ...profile, phone: '+523312345678' }));
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
  await fireEvent.press(view.getByText('Editar datos'));
  await fireEvent.press(view.getByText('Cerrar sesión'));
  expect(view.getByText('Cerrando sesión…')).toBeTruthy();
  expect(view.getByLabelText('Nombre completo').props.editable).toBe(false);
  expect(view.getByRole('button', { name: 'Guardar cambios' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(view.getByText('Cerrando sesión…'));
  expect(view.getByRole('tab', { name: 'Explorar' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(view.getByRole('tab', { name: 'Explorar' }));
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockLogout).toHaveBeenCalledTimes(1);
  await act(async () => resolve());
});

test('iniciales proceden del nombre real y admiten acentos/nombres de una palabra', () => {
  expect(accountInitials('  Ana María Pérez  ')).toBe('AP');
  expect(accountInitials('Ángel')).toBe('ÁN');
  expect(accountInitials('Érika de la Cruz')).toBe('ÉC');
  expect(accountInitials('李')).toBe('李');
  expect(accountInitials(' ')).toBe('');
});

test('el esqueleto anuncia carga sin inventar identidad ni campos editables', async () => {
  (myProfile as jest.Mock).mockImplementation(() => new Promise(() => {}));
  const view = await render(<MyAccount />);
  expect(view.getByRole('progressbar').props.accessibilityState.busy).toBe(true);
  expect(view.queryByText(profile.name)).toBeNull();
  expect(view.queryByRole('button', { name: 'Editar datos' })).toBeNull();
  expect(view.getByRole('button', { name: 'Cerrar sesión' }).props.accessibilityState.disabled).toBe(false);
});
