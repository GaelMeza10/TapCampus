import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('envía los DTO ingleses al servicio registrado por DI', async () => {
    const dto = {
      name: 'Fixture',
      email: 'fixture@uabc.edu.mx',
      password: 'password-fixture',
      phone: '6641234567',
    };
    const service = {
      miCuenta: jest.fn().mockResolvedValue({ id: 'current-user' }),
      registrar: jest
        .fn()
        .mockResolvedValue({ access_token: 'register-token' }),
      iniciarSesion: jest
        .fn()
        .mockResolvedValue({ access_token: 'login-token' }),
    };
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    const controller = module.get(AuthController);
    expect(await controller.me({ id: 'current-user', email: 'fixture@uabc.edu.mx' })).toEqual({ id: 'current-user' });
    expect(service.miCuenta).toHaveBeenCalledWith('current-user');
    expect(await controller.registrar(dto)).toEqual({
      access_token: 'register-token',
    });
    expect(service.registrar).toHaveBeenCalledWith(dto);
    expect(
      await controller.login({ email: dto.email, password: dto.password }),
    ).toEqual({ access_token: 'login-token' });
    await module.close();
  });
});
