import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { NAME_MAX } from '../../common/field-limits';

export class UpdateProfileDto {
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(NAME_MAX, { message: `El nombre debe tener máximo ${NAME_MAX} caracteres` })
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^(?:\+52)?[0-9]{10}$/, { message: 'Ingresa diez dígitos mexicanos con o sin +52' })
  phone?: string;
}
