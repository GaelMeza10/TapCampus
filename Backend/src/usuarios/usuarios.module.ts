import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Module({
  providers: [UsuariosService], //lo construye.
  exports: [UsuariosService], //se decide que va a compartir.
})
export class UsuariosModule {}
