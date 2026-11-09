import { Body, Controller, Get, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
//aqui en el controller se definen las rutas
//y se llama al servicio para que haga la logica de negocio
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@CurrentUser() user: AuthenticatedUser) {
        return this.authService.miCuenta(user.id);
    }

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
