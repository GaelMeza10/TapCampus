import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^(?:\+52)?[0-9]{10}$/, { message: 'Ingresa diez dígitos mexicanos con o sin +52' })
  phone?: string;
}
