import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import PublisherCard from '../src/components/Publisher_Card';
import type { Publication } from '../src/services/marketplace';

const item = { id: 'p1', title: 'Producto con un título largo', type: 'LIVE', price: '25.00', price_before_ganga: '35.00', current_stock: 5, is_ganga_active: true, image_url: 'https://example.test/photo.png' } as Publication;

test('foto fallida conserva precio, ubicación y acción; una URL nueva vuelve a cargar', async () => {
  const press = jest.fn();
  const view = await render(<PublisherCard item={item} zoneName="Biblioteca" onPress={press} />);
  await fireEvent(view.getByLabelText(`Foto de ${item.title}`), 'error', { nativeEvent: { error: 'No se pudo cargar' } });
  expect(view.getByText('Sin foto')).toBeTruthy();
  expect(view.getByText('$25')).toBeTruthy();
  expect(view.getByText('Biblioteca')).toBeTruthy();
  expect(view.getByText('$35')).toBeTruthy();
  expect(view.getByText('Ahorras $10')).toBeTruthy();
  expect(view.getByText('5 disponibles')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: `Ver ${item.title}` }));
  expect(press).toHaveBeenCalledTimes(1);
  await view.rerender(<PublisherCard item={{ ...item, image_url: 'https://example.test/new.png' }} onPress={press} />);
  expect(view.queryByText('Sin foto')).toBeNull();
  expect(view.getByLabelText(`Foto de ${item.title}`)).toBeTruthy();
});
