import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

import EsCorreoInstitucional from '../validators/correo-institucional.validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
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

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  password: string;
}
