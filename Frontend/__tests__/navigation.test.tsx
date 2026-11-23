import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, renderRouter, screen, testRouter, waitFor } from 'expo-router/testing-library';
import { useRouter } from 'expo-router';
import RootLayout from '../src/app/_layout';
import MarketplaceTabs from '../src/app/(tabs)/_layout';
import { MarketplaceShell, type MarketTab } from '../src/components/marketplace-shell';
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
  const router = useRouter();
  const [count, setCount] = useState(0);
  return <MarketplaceShell active="explore">
    <Pressable accessibilityRole="button" onPress={() => void logout()}><Text>Home</Text></Pressable>
    <Pressable onPress={() => setCount(value => value + 1)}><Text>Contador {count}</Text></Pressable>
    <Pressable onPress={() => router.push('/publication/p1')}><Text>Abrir detalle</Text></Pressable>
  </MarketplaceShell>;
}

function TabPage({ active, title }: { active: MarketTab; title: string }) {
  const router = useRouter();
  return <MarketplaceShell active={active}><Text>{title}</Text><Pressable onPress={() => router.push('/publication/edit')}><Text>Abrir formulario</Text></Pressable></MarketplaceShell>;
}
function Detail() {
  const router = useRouter();
  return <><Text>Detalle</Text><Pressable onPress={() => router.dismissTo('/reservations')}><Text>Ver mis reservas</Text></Pressable></>;
}
function Edit() {
  const router = useRouter();
  return <><Text>Editar</Text><Pressable onPress={() => router.dismissTo({ pathname: '/sales', params: { type: 'STATIC' } })}><Text>Guardar</Text></Pressable></>;
}

const routes = {
  _layout: RootLayout,
  index: Index,
  login: () => <Text>Login</Text>,
  register: () => <Text>Registro</Text>,
  '(tabs)/_layout': MarketplaceTabs,
  '(tabs)/homePage': Home,
  '(tabs)/sales': () => <TabPage active="sales" title="Ventas" />,
  '(tabs)/reservations': () => <TabPage active="reservations" title="Mis reservas" />,
  '(tabs)/account': () => <TabPage active="account" title="Mi cuenta" />,
  'publication/[id]': Detail,
  'publication/edit': Edit,
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

  test.each(['/sales', '/reservations'])('sin sesión: %s requiere autenticación', async (path) => {
    mockToken = null;
    await renderRouter(routes, { initialUrl: path });
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
    await act(async () => { await mockUnauthorized!(); });
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
    expect(mockToken).toBeNull();
  });

  test('cerrar sesión en home lleva a login', async () => {
    mockToken = 'jwt';
    await renderRouter(routes, { initialUrl: '/homePage' });
    await fireEvent.press(await screen.findByText('Home'));
    await waitFor(() => expect(screen.getByText('Login')).toBeTruthy());
  });

  test('cambios repetidos conservan estado y una sola entrada de pestañas en la pila', async () => {
    mockToken = 'jwt';
    const view = await renderRouter(routes, { initialUrl: '/homePage' });
    await fireEvent.press(await screen.findByText('Contador 0'));
    const before = view.getRouterState()!.routes[0].state!;
    const tabsKey = before.routes.find(route => route.name === '(tabs)')!.key;
    for (const label of ['Reservas', 'Mis ventas', 'Cuenta', 'Explorar', 'Cuenta', 'Reservas', 'Explorar']) {
      await fireEvent.press(screen.getByRole('tab', { name: label }));
      await waitFor(() => expect(screen.getByRole('tab', { name: label }).props.accessibilityState.selected).toBe(true));
      expect(screen.getAllByTestId('marketplace-navigation')).toHaveLength(1);
      const root = view.getRouterState()!.routes[0].state!;
      expect(root.routes).toHaveLength(before.routes.length);
      const group = root.routes.find(route => route.name === '(tabs)')!;
      expect(group.key).toBe(tabsKey);
      expect(group.state?.type).toBe('tab');
      expect(new Set(group.state?.routes.map(route => route.name)).size).toBe(group.state?.routes.length);
    }
    expect(screen.getByText('Contador 1')).toBeTruthy();
    await fireEvent.press(screen.getByRole('tab', { name: 'Explorar' }));
    expect(view.getRouterState()!.routes[0].state!.routes).toHaveLength(before.routes.length);
  });

  test('Atrás desde Cuenta vuelve a Explorar sin recorrer las pestañas visitadas', async () => {
    mockToken = 'jwt';
    await renderRouter(routes, { initialUrl: '/homePage' });
    await screen.findByText('Home');
    await testRouter.navigate('/reservations');
    await testRouter.navigate('/sales');
    await testRouter.navigate('/account');
    await testRouter.back('/homePage');
  });

  test('detalle permite Atrás al origen y Ver mis reservas reutiliza el grupo de pestañas', async () => {
    mockToken = 'jwt';
    const view = await renderRouter(routes, { initialUrl: '/homePage' });
    await screen.findByText('Home');
    const count = view.getRouterState()!.routes[0].state!.routes.length;
    await fireEvent.press(screen.getByText('Abrir detalle'));
    await screen.findByText('Detalle');
    expect(view.getRouterState()!.routes[0].state!.routes).toHaveLength(count + 1);
    await testRouter.back('/homePage');
    await fireEvent.press(screen.getByText('Abrir detalle'));
    await fireEvent.press(await screen.findByText('Ver mis reservas'));
    await screen.findByText('Mis reservas');
    expect(view.getRouterState()!.routes[0].state!.routes).toHaveLength(count);
  });

  test('guardar formulario vuelve a ventas sin duplicar el grupo y transmite el tipo', async () => {
    mockToken = 'jwt';
    const view = await renderRouter(routes, { initialUrl: '/sales' });
    await screen.findByText('Ventas');
    const count = view.getRouterState()!.routes[0].state!.routes.length;
    await fireEvent.press(screen.getByText('Abrir formulario'));
    await fireEvent.press(await screen.findByText('Guardar'));
    await screen.findByText('Ventas');
    expect(view.getRouterState()!.routes[0].state!.routes).toHaveLength(count);
    expect(view.getSearchParams()).toMatchObject({ type: 'STATIC' });
  });

  test('401 desde Cuenta elimina el grupo protegido sin conservar pantallas autenticadas', async () => {
    mockToken = 'jwt';
    const view = await renderRouter(routes, { initialUrl: '/account' });
    await screen.findByText('Mi cuenta');
    await act(async () => { await mockUnauthorized!(); });
    await screen.findByText('Login');
    expect(view.getRouterState()!.routes[0].state!.routes.some(route => route.name === '(tabs)')).toBe(false);
    expect(mockToken).toBeNull();
  });
});
