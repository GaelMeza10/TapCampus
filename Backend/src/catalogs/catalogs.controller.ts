import { Controller, Get, Query } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CategoryQueryDto, EmptyDto } from './catalog-query.dto';

@Controller()
export class CatalogsController {
  constructor(private readonly catalogs: CatalogsService) {}

  @Get('zones')
  zones(@Query() _query: EmptyDto) {
    return this.catalogs.zones();
  }

  @Get('categories')
  categories(@Query() query: CategoryQueryDto) {
    return this.catalogs.categories(query.type);
  }
}
