import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo.toLowerCase() },
    });

    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const contrasenaHasheada = await bcrypt.hash(dto.contrasena, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo.toLowerCase(),
        telefono: dto.telefono,
        contrasena: contrasenaHasheada,
      },
    });

    const { contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  async buscarPorCorreo(correo: string) {
    return this.prisma.usuario.findUnique({
      where: { correo: correo.toLowerCase() },
    });
  }
}