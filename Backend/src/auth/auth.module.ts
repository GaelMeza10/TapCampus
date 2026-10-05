import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { jwtSecret } from './jwt-secret';

@Module({
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  imports: [
    UsuariosModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: jwtSecret(),
        signOptions: { expiresIn: '7d', algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
