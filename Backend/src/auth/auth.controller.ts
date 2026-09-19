import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    registrar(@Body() dto: RegisterDto) {
        return this.authService.registrar(dto); 
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // devolvemos 200 en lugar de 201 porque 201 es para cuando se crea un recurso.
    login(@Body() dto: LoginDto) {
        return this.authService.iniciarSesion(dto);
    }
}
