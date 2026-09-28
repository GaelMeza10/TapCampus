import {
    IsEmail,
    IsString,
    IsNotEmpty,
} from 'class-validator';

export class LoginDto{

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
    correo: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    contrasena: string;
}