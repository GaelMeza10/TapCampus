import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

export default function EsCorreoInstitucional(validationOptions?: ValidationOptions){
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'esCorreoInstitucional',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator:{
                validate(value: unknown){
                    return (
                        typeof value === 'string' && value.toLowerCase().endsWith('@uabc.edu.mx')
                    );
                },
                defaultMessage(args: ValidationArguments){
                    return `${args.property} debe ser un correo institucional (@uabc.edu.mx)`;
                }
            }
        })
    }
}