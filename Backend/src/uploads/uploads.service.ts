import { BadRequestException, Injectable } from '@nestjs/common';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { IMAGE_PATH, uploadsDirectory } from './uploads.config';

@Injectable()
export class UploadsService {
  async save(file: Express.Multer.File, origin: string) {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const extension = extensions[file.mimetype];
    if (!extension || !file.size)
      throw new BadRequestException('Imagen inválida');
    await mkdir(uploadsDirectory(), { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(join(uploadsDirectory(), filename), file.buffer, {
      flag: 'wx',
    });
    return { image_url: `${origin}/uploads/${filename}` };
  }

  async validateImageUrl(value: string, origin: string) {
    let path = value;
    if (!value.startsWith('/')) {
      try {
        const url = new URL(value);
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.search ||
          url.hash ||
          url.username ||
          url.password
        ) {
          throw new Error();
        }
        if (url.origin !== new URL(origin).origin) {
          throw new Error();
        }
        path = url.pathname;
      } catch {
        throw new BadRequestException(
          'image_url debe referenciar una imagen subida',
        );
      }
    }
    if (!IMAGE_PATH.test(path))
      throw new BadRequestException(
        'image_url debe referenciar una imagen subida',
      );
    try {
      await access(join(uploadsDirectory(), path.slice('/uploads/'.length)));
    } catch {
      throw new BadRequestException('La imagen subida no existe');
    }
  }
}
