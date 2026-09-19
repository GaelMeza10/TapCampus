import {
    IsEmail,
    IsString,
    MinLength,
    IsNotEmpty,
} from 'class-validator';

import EsCorreoInstitucional from '../validators/correo-institucional.validator';


export class RegisterDto {
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsString()
    nombre: string;

    @IsEmail()
    @EsCorreoInstitucional()
    correo: string;

    @IsNotEmpty()
    @IsString()
    telefono: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
    contrasena: string;
}