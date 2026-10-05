import { Module } from '@nestjs/common';
import { QueueModule } from './queue.module';
import { JobsService } from './jobs.service';
import { PublicationsModule } from '../publications/publications.module';
import { ReservationsModule } from '../reservations/reservations.module';
@Module({
  imports: [QueueModule, PublicationsModule, ReservationsModule],
  providers: [JobsService],
})
export class JobsModule {}
