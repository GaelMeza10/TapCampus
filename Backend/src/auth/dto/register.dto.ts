import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  Matches,
  MaxLength,
} from 'class-validator';
import { MaxBytes, NAME_MAX, PASSWORD_MAX_BYTES } from '../../common/field-limits';

import EsCorreoInstitucional from '../validators/correo-institucional.validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(NAME_MAX, { message: `El nombre debe tener máximo ${NAME_MAX} caracteres` })
  name: string;

  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  @EsCorreoInstitucional({
    message: 'El correo debe ser institucional (@uabc.edu.mx)',
  })
  email: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @IsString({ message: 'El teléfono debe ser texto' })
  @Matches(/^(?:\+52)?[0-9]{10}$/, {
    message: 'Ingresa diez dígitos mexicanos con o sin +52',
  })
  phone: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @Matches(/\S/, { message: 'La contraseña no puede estar formada solo por espacios' })
  @MaxBytes(PASSWORD_MAX_BYTES, { message: 'La contraseña es demasiado larga (máximo 72 caracteres)' })
  password: string;
}
