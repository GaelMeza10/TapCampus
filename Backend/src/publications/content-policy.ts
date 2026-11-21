export const CONTENT_POLICY_VERSION = 1;

// Lista exacta de specs/0038-filtro-palabras-publicaciones/policy.md.
export const BLOCKED_TERMS = [
  'chingar', 'chinga', 'chingada', 'chingado', 'chingadas', 'chingados', 'pinche', 'pinches',
  'mierda', 'mierdas', 'carajo', 'puta', 'putas', 'puto', 'putos',
  'pendejo', 'pendeja', 'pendejos', 'pendejas', 'cabron', 'cabrona', 'cabrones', 'cabronas',
  'culero', 'culera', 'culeros', 'culeras', 'idiota', 'idiotas', 'imbecil', 'imbeciles',
  'estupido', 'estupida', 'estupidos', 'estupidas', 'maricon', 'maricones', 'joto', 'jotos',
  'cocaina', 'metanfetamina', 'marihuana', 'arma de fuego', 'armas de fuego', 'municion', 'municiones',
] as const;

export function contentTokens(text: string): string[] {
  const vowels: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
  return text.normalize('NFKC').toLocaleLowerCase('es-MX')
    .replace(/[áéíóúü]/g, vowel => vowels[vowel])
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

const phrases = BLOCKED_TERMS.map(term => contentTokens(term));
export function hasBlockedContent(text: string): boolean {
  const tokens = contentTokens(text);
  return phrases.some(phrase => tokens.some((_, index) =>
    phrase.every((token, offset) => tokens[index + offset] === token)));
}

export function blockedContentFields(data: { title?: string; description?: string }) {
  return (['title', 'description'] as const).filter(field =>
    typeof data[field] === 'string' && hasBlockedContent(data[field]));
}
