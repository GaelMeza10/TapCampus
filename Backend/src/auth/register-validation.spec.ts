import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { configureApp } from '../common/configure-app';

describe('POST /auth/register: nombre obligatorio ante entradas adversas', () => {
  let app: INestApplication;
  const registrar = jest.fn().mockResolvedValue({ access_token: 'test-token' });
  const valid = { email: 'fixture@uabc.edu.mx', phone: '6641234567', password: 'fixture-password' };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [AuthController], providers: [{ provide: AuthService, useValue: { registrar } }] }).compile();
    app = module.createNestApplication(); configureApp(app); await app.init();
  });
  beforeEach(() => registrar.mockClear());
  afterAll(async () => { await app.close(); });
  it.each(['   ', '\t\n', '\u00a0', '', null, 123])('rechaza %j con 400 sin llamar al servicio', async name => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({ ...valid, name }).expect(400);
    expect(response.body.message.join(' ')).toContain('nombre');
    expect(registrar).not.toHaveBeenCalled();
  });
  it.each(['  Ana   María Pérez  ', '李', 'Á'.repeat(200)])('normaliza sin recortar el nombre válido', async name => {
    await request(app.getHttpServer()).post('/auth/register').send({ ...valid, name }).expect(201);
    expect(registrar).toHaveBeenCalledWith({ ...valid, name: name.trim().replace(/\s+/g, ' ') });
  });
});
