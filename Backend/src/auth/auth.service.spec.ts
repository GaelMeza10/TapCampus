import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  const id = '00000000-0000-4000-8000-000000000001';
  const email = 'fixture@uabc.edu.mx';
  it('firma sub UUID y email, con respuesta saneada', async () => {
    const users = { crear: jest.fn().mockResolvedValue({ id, email }) };
    const jwt = new JwtService({ secret: 'fixture-only' });
    const service = new AuthService(users as unknown as UsuariosService, jwt);
    const result = await service.registrar({
      name: 'Fixture',
      email,
      phone: '6641234567',
      password: 'fixture-password',
    });
    expect(Object.keys(result)).toEqual(['access_token']);
    expect(jwt.verify(result.access_token)).toMatchObject({ sub: id, email });
  });
  it('login válido y fallos indistinguibles para usuario inexistente/contraseña incorrecta', async () => {
    const user = {
      id,
      email,
      password_hash: await bcrypt.hash('fixture-password', 4),
    };
    const users = { buscarPorCorreo: jest.fn().mockResolvedValue(user) };
    const service = new AuthService(
      users as unknown as UsuariosService,
      new JwtService({ secret: 'fixture-only' }),
    );
    expect(
      await service.iniciarSesion({ email, password: 'fixture-password' }),
    ).toHaveProperty('access_token');
    await expect(
      service.iniciarSesion({ email, password: 'wrong' }),
    ).rejects.toThrow('Correo o contraseña incorrectos');
    users.buscarPorCorreo.mockResolvedValue(null);
    await expect(
      service.iniciarSesion({ email, password: 'wrong' }),
    ).rejects.toThrow('Correo o contraseña incorrectos');
  });
});
