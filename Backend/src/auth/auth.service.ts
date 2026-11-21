import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

// en el service se hace la logica de negocio.
@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService, //generar y verificar tokens
  ) {}

  async registrar(dto: RegisterDto) {
    const usuario = await this.usuariosService.crear(dto);
    return this.generarToken(usuario.id, usuario.email);
  }
  //pendiente de mensajes amigables
  async iniciarSesion(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreo(dto.email);
    if (usuario == null) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const contrasenaValida = await bcrypt.compare(
      dto.password,
      usuario.password_hash,
    );
    if (contrasenaValida == false) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return this.generarToken(usuario.id, usuario.email);
  }

  private generarToken(usuarioId: string, usuarioCorreo: string) {
    const payload = { sub: usuarioId, email: usuarioCorreo };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  miCuenta(usuarioId: string) {
    return this.usuariosService.perfil(usuarioId);
  }

  actualizarCuenta(usuarioId: string, dto: UpdateProfileDto) {
    return this.usuariosService.actualizarPerfil(usuarioId, dto);
  }
}
