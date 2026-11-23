import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
