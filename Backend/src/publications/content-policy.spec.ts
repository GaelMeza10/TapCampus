import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLOCKED_TERMS, blockedContentFields, contentTokens, hasBlockedContent } from './content-policy';

describe('Política de contenido v1', () => {
  it.each(BLOCKED_TERMS)('bloquea palabra/frase completa y mayúsculas: %s', term => {
    expect(hasBlockedContent(`Vendo ${term} aquí`)).toBe(true);
    expect(hasBlockedContent(`¡${term.toUpperCase().replaceAll(' ', '-')}!`)).toBe(true);
  });
  it.each([
    'Computadora usada', 'Computación', 'Disputa académica', 'Putois', 'Bata negra',
    'Libro de historia indígena', 'Grupo gay universitario', 'Coca-Cola',
    'Pistola de silicón', 'Heroína de una novela', 'Jota musical', 'm4rihuana', 'ma.rihuana',
  ])('no bloquea términos legítimos/ambiguos o evasiones fuera de v1: %s', text => {
    expect(hasBlockedContent(text)).toBe(false);
  });
  it('normaliza acentos compuestos/descompuestos y preserva ñ y números', () => {
    expect(hasBlockedContent('¡PÉNDEJO!')).toBe(true);
    expect(hasBlockedContent('imbe\u0301cil')).toBe(true);
    expect(contentTokens('AÑO año ANo pingüino 123')).toEqual(['año', 'año', 'ano', 'pinguino', '123']);
  });
  it('devuelve solo campos enviados sin formar frases entre campos ni devolver términos', () => {
    expect(blockedContentFields({ title: 'arma', description: 'de fuego' })).toEqual([]);
    expect(blockedContentFields({ title: 'pendejo', description: 'municiones' })).toEqual(['title', 'description']);
    expect(blockedContentFields({ description: '¡Imbécil!' })).toEqual(['description']);
    expect(blockedContentFields({})).toEqual([]);
  });
  it('coincide exactamente con la lista documentada sin duplicados ni expansión silenciosa', () => {
    const policy = readFileSync(resolve('../specs/0038-filtro-palabras-publicaciones/policy.md'), 'utf8');
    const entries = policy.split(/\r?\n/).filter(line => /^\| (Groserías|Insultos directos|Insultos homofóbicos explícitos|Sustancias del alcance inicial|Objetos del alcance inicial) \|/.test(line))
      .flatMap(line => line.split('|')[2].trim().split(', '));
    expect([...BLOCKED_TERMS]).toEqual(entries);
    expect(new Set(BLOCKED_TERMS).size).toBe(BLOCKED_TERMS.length);
  });
});
