import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { isUUID } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmptyDto } from '../catalogs/catalog-query.dto';
import { CreateReservationDto } from './reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}
  @Post('reservations')
  async create(
    @Body() body: CreateReservationDto,
    @Headers('idempotency-key') key: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!key || !isUUID(key))
      throw new BadRequestException('Idempotency-Key debe ser UUID');
    const result = await this.reservations.create(
      body.publicationId.toLowerCase(),
      user.id,
      key.toLowerCase(),
    );
    response.status(result.created ? 201 : 200);
    return result.reservation;
  }
  @Get('reservations/mine')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.reservations.mine(user.id);
  }
  @Get('reservations/:id')
  detail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservations.detail(id.toLowerCase(), user.id);
  }
  @Get('publications/:id/reservations')
  sellerList(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservations.sellerList(id.toLowerCase(), user.id);
  }
  @Post('reservations/:id/complete')
  @HttpCode(200)
  complete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() _body: EmptyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservations.resolve(id.toLowerCase(), 'COMPLETED', user.id);
  }
  @Post('reservations/:id/cancel')
  @HttpCode(200)
  cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() _body: EmptyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservations.resolve(id.toLowerCase(), 'CANCELLED', user.id);
  }
}
