import { formFieldOrder, validatePublicationDraft } from '../src/lib/publication-form-validation';
import type { OwnedPublication } from '../src/services/marketplace';

const valid = {
  draft: { title: 'Burrito', description: 'Caliente', price: '85', stock: '3', start: '2099-01-01T10:00', end: '2099-01-01T12:00', gangaPrice: '', gangaMinutes: '' },
  type: 'LIVE' as const, editing: false, hasPhoto: true, zoneId: 1, categoryId: 1,
  gangaMode: 'SCHEDULED' as const, now: new Date('2099-01-01T09:00').getTime(),
};
test('valida todos los campos aplicables y mantiene orden visual con categoría antes de precio', () => {
  const errors = validatePublicationDraft({ ...valid, hasPhoto: false, zoneId: undefined, categoryId: undefined,
    draft: { ...valid.draft, title: '', description: '', price: '0', stock: '-1', start: 'bad', end: 'bad' } });
  expect(formFieldOrder.filter(field => errors[field])).toEqual(['photo', 'title', 'description', 'category', 'price', 'stock', 'zone', 'start', 'end']);
});
test('STATIC no valida stock/horario/oferta, pero conserva errores de texto/catálogos', () => {
  expect(validatePublicationDraft({ ...valid, type: 'STATIC', draft: { ...valid.draft, condition: 'NEW', stock: '-1', start: '', end: '', gangaPrice: '999' } })).toEqual({});
});
test('precio y horario revalidan la oferta dependiente; corregirlos limpia el error', () => {
  expect(validatePublicationDraft({ ...valid, draft: { ...valid.draft, gangaPrice: '85', gangaMinutes: '10' } })).toHaveProperty('offer');
  expect(validatePublicationDraft({ ...valid, draft: { ...valid.draft, gangaPrice: '65', gangaMinutes: '999' } })).toHaveProperty('offer');
  expect(validatePublicationDraft({ ...valid, draft: { ...valid.draft, gangaPrice: '65', gangaMinutes: '10' } })).toEqual({});
});

test('fin pasado o anterior al inicio se señala en fin y stock cero solo es válido en edición', () => {
  expect(validatePublicationDraft({ ...valid, draft: { ...valid.draft, end: '2099-01-01T08:00', stock: '0' } })).toMatchObject({ end: 'La hora de fin debe estar en el futuro.', stock: expect.any(String) });
  expect(validatePublicationDraft({ ...valid, draft: { ...valid.draft, end: '2099-01-01T09:30' } })).toHaveProperty('end', 'La hora de fin debe ser posterior al inicio.');
  expect(validatePublicationDraft({ ...valid, editing: true, draft: { ...valid.draft, stock: '0' } })).not.toHaveProperty('stock');
});

test('editar solo precio normal no exige reprogramar una oferta cuyo umbral ya pasó', () => {
  const original: OwnedPublication = {
    id: 'p1', type: 'LIVE', title: 'Burrito', description: 'Caliente', price: '85.00', image_url: '/uploads/a.png',
    status: 'ACTIVE', seller_id: 's1', seller: { id: 's1', name: 'Ana' }, zone_id: 1, category_id: 1,
    initial_stock: 3, current_stock: 3, start_time: new Date(valid.draft.start).toISOString(), end_time: new Date(valid.draft.end).toISOString(),
    is_ganga_active: false, ganga_min_price: '65.00', ganga_activation_mode: 'SCHEDULED', ganga_minutes_before: 10,
  };
  expect(validatePublicationDraft({ ...valid, editing: true, original, now: new Date('2099-01-01T11:55').getTime(),
    draft: { ...valid.draft, price: '90', gangaPrice: '65.00', gangaMinutes: '10' } })).toEqual({});
});

test('normalizePrice limpia símbolo, espacios y coma decimal', () => {
  const { normalizePrice, validPrice } = require('../src/lib/publication-form-validation');
  expect(normalizePrice('$1,50')).toBe('1.50');
  expect(validPrice(normalizePrice('$ 180 '))).toBe(true);
  expect(validPrice(normalizePrice('abc'))).toBe(false);
});
