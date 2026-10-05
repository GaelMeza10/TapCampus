import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

describe('UsuariosService', () => {
  const dto = {
    name: 'Fixture',
    email: 'FIXTURE@UABC.EDU.MX',
    phone: '5512345678',
    password: 'fixture-password',
  };
  it('normaliza correo/teléfono, persiste hash y lo retira de la respuesta', async () => {
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockImplementation(async ({ data }) => ({
            id: 'fixture-id',
            ...data,
          })),
      },
    };
    const result = await new UsuariosService(
      db as unknown as PrismaService,
    ).crear(dto);
    const data = db.user.create.mock.calls[0][0].data;
    expect(data.email).toBe('fixture@uabc.edu.mx');
    expect(data.phone).toBe('+525512345678');
    expect(await bcrypt.compare(dto.password, data.password_hash)).toBe(true);
    expect(result).not.toHaveProperty('password_hash');
  });
  it('convierte también el conflicto de unicidad concurrente en 409', async () => {
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError('fixture', {
              code: 'P2002',
              clientVersion: '7.8.0',
            }),
          ),
      },
    };
    await expect(
      new UsuariosService(db as unknown as PrismaService).crear(dto),
    ).rejects.toMatchObject({ status: 409 });
  });
});
