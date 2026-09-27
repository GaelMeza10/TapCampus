import {
    IsEmail,
    IsString,
    IsNotEmpty,
} from 'class-validator';

export class LoginDto{

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail()
    correo: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    contrasena: string;
}