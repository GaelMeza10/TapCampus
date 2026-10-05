import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { UploadsModule } from '../uploads/uploads.module';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';

@Module({
  imports: [AuthModule, CatalogsModule, UploadsModule],
  controllers: [PublicationsController],
  providers: [PublicationsService],
})
export class PublicationsModule {}
