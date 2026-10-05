import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicationType } from '../generated/prisma/client';

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  zones() {
    return this.prisma.zone.findMany({ orderBy: { id: 'asc' } });
  }
  categories(type?: PublicationType) {
    return this.prisma.category.findMany({
      where: { type },
      orderBy: { id: 'asc' },
    });
  }

  async validate(zoneId?: number, categoryId?: number, type?: PublicationType) {
    if (
      zoneId !== undefined &&
      !(await this.prisma.zone.findUnique({ where: { id: zoneId } }))
    ) {
      throw new BadRequestException('La zona no existe');
    }
    if (categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category || (type !== undefined && category.type !== type)) {
        throw new BadRequestException(
          'La categoría no existe o no corresponde al tipo',
        );
      }
    }
  }
}
