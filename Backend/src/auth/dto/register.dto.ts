import {
    IsEmail,
    IsString,
    MinLength,
    IsNotEmpty,
} from 'class-validator';

import EsCorreoInstitucional from '../validators/correo-institucional.validator';


export class RegisterDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser texto' })
    nombre: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
    @EsCorreoInstitucional({ message: 'El correo debe ser institucional (@uabc.edu.mx)' })
    correo: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsString({ message: 'El teléfono debe ser texto' })
    telefono: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
    contrasena: string;
}