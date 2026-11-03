import { mexicanPhone, uabcEmail } from '../src/services/auth-validation';

test('correo UABC exige dominio exacto y parte local', () => {
  expect(uabcEmail(' Alumna@UABC.EDU.MX ')).toBe('alumna@uabc.edu.mx');
  expect(uabcEmail('@uabc.edu.mx')).toBeNull();
  expect(uabcEmail('a@uabc.edu.mx.evil')).toBeNull();
  expect(uabcEmail('a@otro.mx')).toBeNull();
});

test('teléfono de cualquier región admite diez dígitos o +52 y normaliza igual', () => {
  expect(mexicanPhone('6641234567')).toBe('+526641234567');
  expect(mexicanPhone('+52 664 123 4567')).toBe('+526641234567');
  expect(mexicanPhone('5512345678')).toBe('+525512345678');
  expect(mexicanPhone('+525512345678')).toBe('+525512345678');
  expect(mexicanPhone('+15551234567')).toBeNull();
  expect(mexicanPhone('5215512345678')).toBeNull();
});
