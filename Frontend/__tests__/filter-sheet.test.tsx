import React, { useState } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import FilterSheet, { type PublicationFilters } from '../src/components/filter-sheet';
import { listPublications, type Publication } from '../src/services/marketplace';

jest.mock('../src/services/marketplace', () => ({ listPublications: jest.fn(), apiMessage: () => 'Error de red' }));
const now = Date.now();
const rows = [[1, 2], [1, 2], [1, 3], [2, 3]].map(([zone_id, category_id], index) => ({ id: String(index), type: 'STATIC', zone_id, category_id }) as Publication);
const onApply = jest.fn(), onClose = jest.fn();
const refreshToken: Publication[] = [];
function Harness({ query = '', visible = true }: { query?: string; visible?: boolean }) {
  const [draft, onDraftChange] = useState<PublicationFilters>({});
  return <FilterSheet visible={visible} type="STATIC" query={query} zoneOptions={[{ id: 1, name: 'Ingeniería' }, { id: 2, name: 'Biblioteca' }, { id: 3, name: 'Gimnasio' }]} categoryOptions={[{ id: 2, name: 'Libros' }, { id: 3, name: 'Electrónica' }]} catalogLoading={false} catalogError="" onRetryCatalog={jest.fn()} draft={draft} onDraftChange={onDraftChange} onApply={onApply} onClose={onClose} refreshToken={refreshToken} now={now} />;
}
beforeEach(() => { jest.clearAllMocks(); (listPublications as jest.Mock).mockResolvedValue(rows); });

test('conteos son intersecciones del servidor; elegir no aplica y restablecer conserva borrador hasta confirmar', async () => {
  const view = await render(<Harness query="libro" />);
  await view.findByText('Ver 4 publicaciones');
  expect(listPublications).toHaveBeenCalledWith('STATIC', undefined, undefined, 'libro');
  expect(view.getByRole('radio', { name: 'Gimnasio' }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(view.getByRole('radio', { name: 'Ingeniería' }));
  expect(view.getByText('Ver 3 publicaciones')).toBeTruthy();
  expect(view.getByRole('radio', { name: 'Electrónica' }).props.accessibilityHint).toBe('1 publicación disponible');
  await fireEvent.press(view.getByRole('radio', { name: 'Electrónica' }));
  expect(view.getByText('Ver 1 publicación')).toBeTruthy();
  expect(view.getByRole('radio', { name: 'Biblioteca' }).props.accessibilityHint).toBe('1 publicación disponible');
  expect(onApply).not.toHaveBeenCalled();
  await fireEvent.press(view.getByRole('button', { name: 'Restablecer filtros' }));
  expect(view.getByText('Ver 4 publicaciones')).toBeTruthy();
  await fireEvent.press(view.getByRole('button', { name: 'Ver publicaciones' }));
  expect(onApply).toHaveBeenCalledTimes(1);
});

test('fallo no inventa ceros y permite aplicar o recuperar conteos', async () => {
  (listPublications as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const view = await render(<Harness />);
  await view.findByText(/No pudimos actualizar los conteos/);
  expect(view.getByRole('radio', { name: 'Gimnasio' }).props.accessibilityState.disabled).toBe(false);
  expect(view.queryByText('Ver 0 publicaciones')).toBeNull();
  await fireEvent.press(view.getByRole('button', { name: 'Reintentar' }));
  await view.findByText('Ver 4 publicaciones');
});

test('al cambiar consulta descarta respuesta anterior y al estar cerrada no consulta', async () => {
  const pending: Record<string, (value: Publication[]) => void> = {};
  (listPublications as jest.Mock).mockImplementation((_type, _zone, _category, q) => new Promise(resolve => { pending[q] = resolve; }));
  const view = await render(<Harness query="anterior" visible={false} />);
  expect(listPublications).not.toHaveBeenCalled();
  await view.rerender(<Harness query="anterior" />);
  await waitFor(() => expect(pending.anterior).toBeDefined());
  await view.rerender(<Harness query="actual" />);
  await act(async () => pending.actual(rows.slice(0, 1)));
  await view.findByText('Ver 1 publicación');
  await act(async () => pending.anterior(rows));
  expect(view.queryByText('Ver 4 publicaciones')).toBeNull();
});
