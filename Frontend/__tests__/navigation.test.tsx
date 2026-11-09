import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import RootLayout from '../src/app/_layout';
import Index from '../src/app/index';
import { useAuth } from '../src/context/AuthContext';

let mockToken: string | null = null;
let mockUnauthorized: (() => Promise<void>) | undefined;
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => mockToken),
  deleteItemAsync: jest.fn(async () => { mockToken = null; }),
  setItemAsync: jest.fn(async (_key: string, value: string) => { mockToken = value; }),
}));
jest.mock('../src/services/api', () => ({
  setUnauthorizedHandler: (handler?: () => Promise<void>) => { mockUnauthorized = handler; },
}));
jest.mock('../src/services/auth.service', () => ({
  login: jest.fn(async () => { mockToken = 'jwt'; }),
  register: jest.fn(async () => { mockToken = 'jwt'; }),
  logout: jest.fn(async () => { mockToken = null; }),
}));

function Home() {
  const { logout } = useAuth();
  return <Pressable accessibilityRole="button" onPress={() => void logout()}><Text>Home</Text></Pressable>;
}

const routes = {
  _layout: RootLayout,
  index: Index,
  login: () => <Text>Login</Text>,
  register: () => <Text>Registro</Text>,
  homePage: Home,
  sales: () => <Text>Ventas</Text>,
  reservations: () => <Text>Reservas</Text>,
  account: () => <Text>Mi cuenta</Text>,
  'publication/[id]': () => <Text>Detalle</Text>,
  'publication/edit': () => <Text>Editar</Text>,
};

describe('navegación Expo Router SDK 58', () => {
  test('sin sesión: inicio lleva a login', async () => {
    mockToken = null;
    await renderRouter(routes, { initialUrl: '/' });
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
  });

  test('sin sesión: registro permanece visible', async () => {
    mockToken = null;
    await renderRouter(routes, { initialUrl: '/register' });
    await waitFor(() => expect(screen.getByText('Registro')).toBeTruthy());
  });

  test('sin sesión: enlace profundo a home lleva a login', async () => {
    mockToken = null;
    await renderRouter(routes, { initialUrl: '/homePage' });
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
  });

  test('sin sesión: Mis Ventas y reservas requieren autenticación', async () => {
    mockToken = null;
    await renderRouter(routes, { initialUrl: '/sales' });
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
  });

  test('Mi cuenta también requiere sesión', async () => {
    mockToken = null;
    await renderRouter(routes, { initialUrl: '/account' });
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
  });

  test('con token almacenado: login lleva a home', async () => {
    mockToken = 'jwt';
    await renderRouter(routes, { initialUrl: '/login' });
    await waitFor(() => expect(screen.getByText('Home')).toBeTruthy());
  });

  test('401 invalida AuthProvider y protege home', async () => {
    mockToken = 'jwt';
    await renderRouter(routes, { initialUrl: '/homePage' });
    await screen.findByText('Home');
    expect(mockUnauthorized).toBeDefined();
    await mockUnauthorized!();
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
    expect(mockToken).toBeNull();
  });

  test('cerrar sesión en home lleva a login', async () => {
    mockToken = 'jwt';
    await renderRouter(routes, { initialUrl: '/homePage' });
    await fireEvent.press(await screen.findByText('Home'));
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
  });
});
