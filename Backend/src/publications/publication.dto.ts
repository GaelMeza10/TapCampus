import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  GangaActivationMode,
  PublicationType,
} from '../generated/prisma/client';

const supplied = (_object: unknown, value: unknown) => value !== undefined;
const nonNull = (_object: unknown, value: unknown) => value !== undefined && value !== null;
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class EditablePublicationDto {
  @ValidateIf(supplied)
  @Transform(trim)
  @IsString()
  @Matches(/\S/)
  title?: string;

  @ValidateIf(supplied)
  @Transform(trim)
  @IsString()
  @Matches(/\S/)
  description?: string;

  @ValidateIf(supplied)
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(99999999.99)
  price?: number;

  @ValidateIf(supplied)
  @IsString()
  @Matches(/\S/)
  image_url?: string;

  @ValidateIf(supplied)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  zone_id?: number;

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
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(99999999.99)
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
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(99999999.99)
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
