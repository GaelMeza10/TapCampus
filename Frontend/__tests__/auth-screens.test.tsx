import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Login from '../src/app/login';
import Register from '../src/app/register';

const mockLogin = jest.fn();
const mockRegister = jest.fn();
jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ login: mockLogin, register: mockRegister }) }));
jest.mock('expo-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => children }));
beforeEach(() => jest.clearAllMocks());

test('registro atribuye dominio y teléfono al campo correcto, sin perder los datos', async () => {
  const view = await render(<Register />);
  await fireEvent.changeText(view.getByLabelText('Nombre completo'), 'Ana');
  await fireEvent.changeText(view.getByLabelText('Correo institucional'), 'ana@gmail.com');
  await fireEvent.changeText(view.getByLabelText('Teléfono'), '123');
  await fireEvent.changeText(view.getByLabelText('Contraseña'), 'password123');
  await fireEvent.press(view.getByRole('checkbox'));
  await fireEvent.press(view.getByRole('button', { name: 'Crear cuenta' }));
  expect(view.getByLabelText('Correo institucional').props.accessibilityHint).toContain('@uabc.edu.mx');
  expect(view.getByLabelText('Contraseña').props.accessibilityHint).toBeUndefined();
  await fireEvent.changeText(view.getByLabelText('Correo institucional'), 'ana@uabc.edu.mx');
  await fireEvent.press(view.getByRole('button', { name: 'Crear cuenta' }));
  expect(view.getByLabelText('Teléfono').props.accessibilityHint).toContain('diez dígitos');
  expect(view.getByLabelText('Nombre completo').props.value).toBe('Ana');
  expect(mockRegister).not.toHaveBeenCalled();
});

test('login bloquea edición y doble envío, muestra error real y permite reintentar', async () => {
  let reject!: (error: unknown) => void;
  mockLogin.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; })).mockResolvedValue(undefined);
  const view = await render(<Login />);
  await fireEvent.changeText(view.getByLabelText('Correo institucional'), 'Ana@UABC.EDU.MX');
  await fireEvent.changeText(view.getByLabelText('Contraseña'), 'password123');
  await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
  await view.findByText('Entrando…');
  expect(view.getByLabelText('Correo institucional').props.editable).toBe(false);
  await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
  expect(mockLogin).toHaveBeenCalledTimes(1);
  await act(async () => reject({ response: { data: { message: 'Servicio no disponible. Inténtalo de nuevo.' } } }));
  await view.findByText('Servicio no disponible. Inténtalo de nuevo.');
  expect(view.getByLabelText('Correo institucional').props.value).toBe('Ana@UABC.EDU.MX');
  expect(view.getByLabelText('Contraseña').props.editable).toBe(true);
  await fireEvent.press(view.getByRole('button', { name: 'Iniciar sesión' }));
  await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(2));
  expect(mockLogin).toHaveBeenLastCalledWith({ email: 'ana@uabc.edu.mx', password: 'password123' });
});

test.each([
  ['        ', 'solo por espacios'],
  ['😀'.repeat(19), 'demasiado larga'],
])('registro rechaza la contraseña %j sin enviarla', async (password, message) => {
  const view = await render(<Register />);
  await fireEvent.changeText(view.getByLabelText('Nombre completo'), 'Ana');
  await fireEvent.changeText(view.getByLabelText('Correo institucional'), 'ana@uabc.edu.mx');
  await fireEvent.changeText(view.getByLabelText('Teléfono'), '6641234567');
  await fireEvent.changeText(view.getByLabelText('Contraseña'), password);
  await fireEvent.press(view.getByRole('checkbox'));
  await fireEvent.press(view.getByRole('button', { name: 'Crear cuenta' }));
  expect(view.getByLabelText('Contraseña').props.accessibilityHint).toContain(message);
  expect(mockRegister).not.toHaveBeenCalled();
});

test('registro limita nombre y contraseña', async () => {
  const view = await render(<Register />);
  expect(view.getByLabelText('Nombre completo').props.maxLength).toBe(80);
  expect(view.getByLabelText('Contraseña').props.maxLength).toBe(72);
});
