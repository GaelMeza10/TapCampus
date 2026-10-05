import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../jobs/queue.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
@Module({
  imports: [AuthModule, QueueModule, RealtimeModule],
  providers: [ReservationsService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule {}
