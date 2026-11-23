import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Login from '../src/app/login';
import { apiMessage } from '../src/services/marketplace';

const mockLogin = jest.fn();
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ login: mockLogin }) }));
jest.mock('expo-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => children }));
beforeEach(() => jest.clearAllMocks());

test.each([null, undefined, {}, { response: {} }, { response: { data: { message: [] } } }])('causa incompleta %j siempre produce un mensaje útil', cause => {
  expect(apiMessage(cause).length).toBeGreaterThan(10);
});

test.each([
  [500, 'Internal server error', 'servidor'], [403, 'Forbidden', 'permiso'],
  [401, 'Unauthorized', 'sesión'], [429, 'Too Many Requests', 'intentos'],
  [404, 'Cannot GET /publications/private', 'disponible'],
] as const)('HTTP %s tiene mensaje comprensible sin texto técnico', (status, message, expected) => {
  const visible = apiMessage({ response: { status, data: { message } } });
  expect(visible).toContain(expected);
  expect(visible).not.toMatch(/Internal|Forbidden|Unauthorized|Cannot GET|Too Many|\/publications/);
});

test('login offline conserva valores y no culpa a las credenciales', async () => {
  mockLogin.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
  const view = await render(<Login />);
  await fireEvent.changeText(view.getByLabelText('Correo institucional'), 'ana@uabc.edu.mx');
  await fireEvent.changeText(view.getByLabelText('Contraseña'), 'password123');
  await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
  expect(await view.findByText(/Revisa tu conexión/)).toBeTruthy();
  expect(view.queryByText('Correo o contraseña incorrectos.')).toBeNull();
  await fireEvent.changeText(view.getByLabelText('Contraseña'), 'otra-password');
  expect(view.getByText(/Revisa tu conexión/)).toBeTruthy();
});

test('editar contraseña no borra el error de correo inválido', async () => {
  const view = await render(<Login />);
  await fireEvent.changeText(view.getByLabelText('Correo institucional'), 'ana@gmail.com');
  await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
  await fireEvent.changeText(view.getByLabelText('Contraseña'), 'password123');
  expect(view.getByLabelText('Correo institucional').props.accessibilityHint).toContain('@uabc.edu.mx');
  expect(mockLogin).not.toHaveBeenCalled();
});

test('413 en inglés se explica en español', () => {
  const { apiMessage } = require('../src/services/error-messages');
  expect(apiMessage({ response: { status: 413, data: { message: 'request entity too large' } } })).toContain('demasiado grandes');
});
