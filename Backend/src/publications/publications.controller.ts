import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { publicOrigin } from '../uploads/public-origin';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmptyDto, PublicationQueryDto } from '../catalogs/catalog-query.dto';
import { CreatePublicationDto, UpdatePublicationDto } from './publication.dto';
import { PublicationsService } from './publications.service';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publications: PublicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreatePublicationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.publications.create(dto, user.id, publicOrigin(request));
  }

  @Get()
  list(@Query() query: PublicationQueryDto) {
    return this.publications.list(query);
  }

  @Get(':id')
  detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.publications.detail(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePublicationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.publications.update(id, dto, user.id, publicOrigin(request));
  }

  @Post(':id/sold')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  sold(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() _body: EmptyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publications.sold(id, user.id);
  }

  @Post(':id/physical-sale')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  physicalSale(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() _body: EmptyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.publications.physicalSale(id, user.id);
  }
}
