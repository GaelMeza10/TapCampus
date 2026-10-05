import { resolve } from 'node:path';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_MIME = /^image\/(jpeg|png|webp)$/;
export const IMAGE_PATH = /^\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function uploadsDirectory() {
  return resolve(process.env.UPLOADS_DIR ?? 'uploads');
}
