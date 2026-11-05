import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import PrimaryButton from '../src/components/PrimaryButton';
import CustomInput from '../src/components/CustomInput';
import Card from '../src/components/Card';
import { RADIUS, SHADOW } from '../src/theme';

describe('componentes de fase 4', () => {
  test('el botón comunica carga y bloquea pulsaciones', async () => {
    const press = jest.fn();
    const view = await render(<PrimaryButton title="Entrar" onPress={press} loading />);
    expect(view.getByRole('button').props.accessibilityState).toEqual({ disabled: true, busy: true });
    await fireEvent.press(view.getByRole('button'));
    expect(press).not.toHaveBeenCalled();
  });

  test('el input muestra error arriba y permite revelar contraseña', async () => {
    const view = await render(<CustomInput icon="lock-closed-outline" placeholder="Contraseña" secureTextEntry error="Revisa el dato" />);
    expect(view.getByText('Revisa el dato')).toBeTruthy();
    expect(view.getByPlaceholderText('Contraseña').props.secureTextEntry).toBe(true);
    await fireEvent.press(view.getByRole('button', { name: 'Mostrar contraseña' }));
    await waitFor(() => expect(view.getByPlaceholderText('Contraseña').props.secureTextEntry).toBe(false));
  });

  test('la tarjeta usa el radio y la sombra compartidos', async () => {
    const view = await render(<Card testID="card" />);
    const style = StyleSheet.flatten(view.getByTestId('card').props.style);
    expect(style.borderRadius).toBe(RADIUS.lg);
    expect(style.boxShadow).toBe(SHADOW.card.boxShadow);
  });
});
