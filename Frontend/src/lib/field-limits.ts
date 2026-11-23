// Mismos límites que Backend/src/common/field-limits.ts.
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 1000;
export const NAME_MAX = 80;
// bcrypt ignora lo que pase de 72 bytes; el servidor rechaza contraseñas más largas.
export const PASSWORD_MAX_BYTES = 72;

/** Bytes UTF-8 de un texto (un emoji ocupa 4). Sin depender de TextEncoder/Buffer. */
export function utf8Bytes(value: string) {
  let bytes = 0;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}
