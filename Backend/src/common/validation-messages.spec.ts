import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { PublicationsController } from '../publications/publications.controller';
import { PublicationsService } from '../publications/publications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { configureApp } from './configure-app';

describe('Errores de la API en español', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController, PublicationsController],
      providers: [
        { provide: AuthService, useValue: { registrar: jest.fn() } },
        { provide: PublicationsService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (ctx: { switchToHttp: () => { getRequest: () => { user?: unknown } } }) => { ctx.switchToHttp().getRequest().user = { id: 'u1' }; return true; } })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  const english = /\b(must|should|regular expression|Expected|entity too large)\b/i;

  it('campos inválidos sin mensaje propio se explican en español, uno por campo', async () => {
    const response = await request(app.getHttpServer())
      .post('/publications')
      .send({ type: 'NADA', title: '', price: null, category_id: 'x', extra: 1 })
      .expect(400);
    const messages: string[] = response.body.message;
    expect(messages.join(' ')).not.toMatch(english);
    expect(messages).toEqual(expect.arrayContaining([
      'Revisa el tipo de publicación',
      'Revisa la categoría',
      'El campo «extra» no está permitido',
    ]));
    expect(messages.filter(m => m.startsWith('El precio')).length).toBeGreaterThan(0);
  });

  it('JSON mal formado da 400 con mensaje en español', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register').set('Content-Type', 'application/json').send('{"name": "Ana",').expect(400);
    expect(response.body.message).toBe('Los datos enviados no tienen un formato válido.');
  });

  it('cuerpo demasiado grande da 413 con mensaje en español', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register').send({ name: 'a'.repeat(200_000) }).expect(413);
    expect(response.body.message).toContain('demasiado grande');
  });
});
