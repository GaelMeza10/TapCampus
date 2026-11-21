import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    const password_hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email,
          phone: dto.phone.startsWith('+52') ? dto.phone : `+52${dto.phone}`,
          password_hash,
        },
      });
      const { password_hash: _hash, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe una cuenta con ese correo');
      }
      throw error;
    }
  }

  buscarPorCorreo(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async actualizarPerfil(id: string, dto: UpdateProfileDto) {
    if (dto.name === undefined && dto.phone === undefined) throw new BadRequestException('Indica un nombre o teléfono para actualizar.');
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone.startsWith('+52') ? dto.phone : `+52${dto.phone}` } : {}),
        },
        select: { id: true, name: true, email: true, phone: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new UnauthorizedException('La sesión ya no es válida.');
      throw error;
    }
  }

  async perfil(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true } });
    if (!user) throw new UnauthorizedException('La sesión ya no es válida.');
    return user;
  }
}
