import { AxiosError } from 'axios';
import api, { setUnauthorizedHandler } from '../src/services/api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(async () => 'test-token') }));

afterEach(() => setUnauthorizedHandler(undefined));

test.each([
  ['/auth/me', true], ['/reservations/mine', true],
  ['/auth/login', false], ['/auth/register', false],
] as const)('401 de %s respeta si el recurso es privado', async (path, privateResource) => {
  const unauthorized = jest.fn(async () => {});
  setUnauthorizedHandler(unauthorized);
  await expect(api.get(path, { adapter: async config => { throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { data: {}, status: 401, statusText: 'Unauthorized', headers: {}, config }); } })).rejects.toThrow('Unauthorized');
  expect(unauthorized).toHaveBeenCalledTimes(privateResource ? 1 : 0);
});
