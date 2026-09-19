import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
    ) {}

    async registrar(dto: RegisterDto) {
        const usuario = await this.usuariosService.crear(dto);
        return this.generarToken(usuario.id, usuario.correo);
    }

    async iniciarSesion(dto: LoginDto) {
        const usuario = await this.usuariosService.buscarPorCorreo(dto.correo);
        if (usuario == null) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
        const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.contrasena);
        if(contrasenaValida == false){
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
        return this.generarToken(usuario.id, usuario.correo);
    }

    private generarToken(usuarioId: number, usuarioCorreo: string) {
        const payload = {sub: usuarioId, correo: usuarioCorreo}; // payload es la info q se va a guardar en el token
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}