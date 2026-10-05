import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { UploadsModule } from '../uploads/uploads.module';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { QueueModule } from '../jobs/queue.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    AuthModule,
    CatalogsModule,
    UploadsModule,
    QueueModule,
    RealtimeModule,
  ],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
