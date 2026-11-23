import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreatePublicationDto, UpdatePublicationDto } from '../publications/publication.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
const validate = (metatype: new () => object, value: object) => pipe.transform(value, { type: 'body', metatype });
async function messages(metatype: new () => object, value: object): Promise<string> {
  try {
    await validate(metatype, value);
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return ((error as BadRequestException).getResponse() as { message: string[] }).message.join(' | ');
  }
  throw new Error('Se esperaba un error de validación');
}

describe('Precio: valores en notación científica dan 400, nunca 500', () => {
  const base = { type: 'STATIC', title: 'Libro', description: 'Buen estado', image_url: '/uploads/x.jpg', category_id: 1 };
  it.each([1e-7, 1e-10, 5e-324, 0.001, 10.999, 0.1 + 0.2])('rechaza price=%p con mensaje en español', async price => {
    expect(await messages(CreatePublicationDto, { ...base, price })).toMatch(/precio/i);
  });
  it.each([1e-7, 0.005])('rechaza ganga_min_price=%p al crear y al editar', async ganga_min_price => {
    expect(await messages(CreatePublicationDto, { ...base, price: 50, ganga_min_price })).toMatch(/precio/i);
    expect(await messages(UpdatePublicationDto, { ganga_min_price })).toMatch(/precio/i);
  });
  it.each([0.01, 25, 25.5, 99.99, 99999999.99])('acepta price=%p', async price => {
    await expect(validate(CreatePublicationDto, { ...base, price })).resolves.toMatchObject({ price });
  });
});

describe('Longitud máxima de textos', () => {
  const base = { type: 'STATIC', description: 'Buen estado', image_url: '/uploads/x.jpg', category_id: 1, price: 10 };
  it('título: 100 caracteres sí, 101 no', async () => {
    await expect(validate(CreatePublicationDto, { ...base, title: 'a'.repeat(100) })).resolves.toBeDefined();
    expect(await messages(CreatePublicationDto, { ...base, title: 'a'.repeat(101) })).toContain('máximo 100');
  });
  it('descripción: 1000 caracteres sí, 1001 no (también al editar)', async () => {
    await expect(validate(CreatePublicationDto, { ...base, title: 'Libro', description: 'd'.repeat(1000) })).resolves.toBeDefined();
    expect(await messages(UpdatePublicationDto, { description: 'd'.repeat(1001) })).toContain('máximo 1000');
  });
  it('nombre de perfil: 80 sí, 81 no', async () => {
    await expect(validate(UpdateProfileDto, { name: 'n'.repeat(80) })).resolves.toBeDefined();
    expect(await messages(UpdateProfileDto, { name: 'n'.repeat(81) })).toContain('máximo 80');
  });
});

describe('Contraseña de registro', () => {
  const base = { name: 'Ana', email: 'ana@uabc.edu.mx', phone: '6641234567' };
  it.each(['        ', '\t\t\t\t\t\t\t\t'])('rechaza contraseña solo de espacios %j', async password => {
    expect(await messages(RegisterDto, { ...base, password })).toContain('solo por espacios');
  });
  it('acepta 72 bytes y rechaza 73 (bcrypt truncaría)', async () => {
    await expect(validate(RegisterDto, { ...base, password: 'a'.repeat(72) })).resolves.toBeDefined();
    expect(await messages(RegisterDto, { ...base, password: 'a'.repeat(73) })).toContain('demasiado larga');
  });
  it('cuenta bytes, no caracteres: 19 emojis (76 bytes) se rechazan', async () => {
    expect(await messages(RegisterDto, { ...base, password: '😀'.repeat(19) })).toContain('demasiado larga');
  });
});
