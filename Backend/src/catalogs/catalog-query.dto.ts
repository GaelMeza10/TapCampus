import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { PublicationType } from '../generated/prisma/client';

export class CategoryQueryDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(PublicationType)
  type?: PublicationType;
}

export class PublicationQueryDto extends CategoryQueryDto {
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString()
  @MaxLength(100)
  q?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^[1-9]\d*$/.test(value)
      ? Number(value)
      : value,
  )
  @IsInt()
  @Min(1)
  @Max(2147483647)
  zoneId?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^[1-9]\d*$/.test(value)
      ? Number(value)
      : value,
  )
  @IsInt()
  @Min(1)
  @Max(2147483647)
  categoryId?: number;
}

export class EmptyDto {}
