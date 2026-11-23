import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsString,
  Matches,
  MaxLength,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  GangaActivationMode,
  PublicationType,
  ProductCondition,
  PickupMode,
} from '../generated/prisma/client';
import { DESCRIPTION_MAX, IsPrice, TITLE_MAX } from '../common/field-limits';

const supplied = (_object: unknown, value: unknown) => value !== undefined;
const nonNull = (_object: unknown, value: unknown) => value !== undefined && value !== null;
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class EditablePublicationDto {
  @ValidateIf(supplied)
  @IsEnum(PickupMode)
  pickup_mode?: PickupMode;

  @ValidateIf(supplied)
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ValidateIf(supplied)
  @Transform(trim)
  @IsString({ message: 'El título debe ser texto' })
  @Matches(/\S/, { message: 'Escribe un título' })
  @MaxLength(TITLE_MAX, { message: `El título debe tener máximo ${TITLE_MAX} caracteres` })
  title?: string;

  @ValidateIf(supplied)
  @Transform(trim)
  @IsString({ message: 'La descripción debe ser texto' })
  @Matches(/\S/, { message: 'Escribe una descripción' })
  @MaxLength(DESCRIPTION_MAX, { message: `La descripción debe tener máximo ${DESCRIPTION_MAX} caracteres` })
  description?: string;

  @ValidateIf(supplied)
  @IsPrice({ message: 'El precio debe ser un número con hasta dos decimales' })
  @Min(0.01, { message: 'El precio mínimo es $0.01' })
  @Max(99999999.99, { message: 'El precio máximo es $99,999,999.99' })
  price?: number;

  @ValidateIf(supplied)
  @IsString()
  @Matches(/\S/)
  image_url?: string;

  @ValidateIf(nonNull)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  zone_id?: number | null;

  @ValidateIf(supplied)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  category_id?: number;

  @ValidateIf(supplied)
  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  start_time?: string;

  @ValidateIf(supplied)
  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  end_time?: string;
}

export class CreatePublicationDto extends EditablePublicationDto {
  @IsEnum(PublicationType)
  type: PublicationType;

  @ValidateIf(supplied)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  initial_stock?: number;

  @ValidateIf(supplied)
  @IsPrice({ message: 'El precio debe ser un número con hasta dos decimales' })
  @Min(0.01, { message: 'El precio mínimo es $0.01' })
  @Max(99999999.99, { message: 'El precio máximo es $99,999,999.99' })
  ganga_min_price?: number;

  @ValidateIf(supplied)
  @IsEnum(GangaActivationMode)
  ganga_activation_mode?: GangaActivationMode;

  @ValidateIf(supplied)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  ganga_minutes_before?: number;
}

export class UpdatePublicationDto extends EditablePublicationDto {
  @ValidateIf(supplied)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  current_stock?: number;

  @ValidateIf(nonNull)
  @IsPrice({ message: 'El precio debe ser un número con hasta dos decimales' })
  @Min(0.01, { message: 'El precio mínimo es $0.01' })
  @Max(99999999.99, { message: 'El precio máximo es $99,999,999.99' })
  ganga_min_price?: number | null;

  @ValidateIf(nonNull)
  @IsEnum(GangaActivationMode)
  ganga_activation_mode?: GangaActivationMode | null;

  @ValidateIf(nonNull)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  ganga_minutes_before?: number | null;
}
