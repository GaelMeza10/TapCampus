import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { PublicationsModule } from './publications/publications.module';
import { CatalogsModule } from './catalogs/catalogs.module';

@Module({
  imports: [
    PrismaModule,
    UsuariosModule,
    AuthModule,
    UploadsModule,
    PublicationsModule,
    CatalogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
