const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const frontend = path.resolve(__dirname, '..');
const project = path.resolve(frontend, '..');

function parse(file, content) {
  return ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}

// Read literal tokens without executing application code.
function constants(file, content) {
  const values = {};
  const value = node => {
    if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) return value(node.expression);
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText().replace(/^['"]|['"]$/g, ''), value(p.initializer)]));
    if (ts.isPropertyAccessExpression(node)) return value(node.expression)?.[node.name.text];
    if (ts.isIdentifier(node)) return values[node.text];
    return undefined;
  };
  for (const statement of parse(file, content).statements) {
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
      if (declaration.initializer) values[declaration.name.getText()] = value(declaration.initializer);
    }
  }
  return values;
}

function section(design, name) {
  const header = design.split(/^---\s*$/m)[1] ?? '';
  return header.match(new RegExp('^' + name + ':\\r?\\n([\\s\\S]*?)(?=^[\\w-]+:|(?![\\s\\S]))', 'm'))?.[1] ?? '';
}

function entries(design, name) {
  return Object.fromEntries([...section(design, name).matchAll(/^  (\w+): "([^"\r\n]+)"\s*$/gm)].map(m => [m[1], m[2]]));
}

function compareDesign(design, themeSource, copySource) {
  const issues = [];
  const theme = constants('theme.js', themeSource);
  const copy = constants('publication-copy.ts', copySource);
  const compare = (where, expected, actual) => {
    if (expected !== actual) issues.push(`${where}: DESIGN.md exige ${JSON.stringify(expected)}; encontrado ${JSON.stringify(actual)}.`);
  };
  for (const [name, token] of [['colors', 'COLORS'], ['rounded', 'RADIUS'], ['spacing', 'SPACE']]) {
    const expected = entries(design, name);
    if (!Object.keys(expected).length) issues.push(`DESIGN.md: bloque ${name} ausente o sin tokens legibles.`);
    for (const [key, raw] of Object.entries(expected)) compare(`${token}.${key}`, name === 'colors' ? raw : Number(raw.replace(/px$/, '')), theme[token]?.[key]);
  }
  const typography = [...section(design, 'typography').matchAll(/^  (\w+): \{ fontFamily: "([^"]+)", fontSize: "(\d+)px", lineHeight: "(\d+)px" \}/gm)];
  if (!typography.length) issues.push('DESIGN.md: tipografía ausente o ilegible.');
  for (const [, key, fontFamily, fontSize, lineHeight] of typography) {
    for (const [property, expected] of Object.entries({ fontFamily, fontSize: Number(fontSize), lineHeight: Number(lineHeight) })) compare(`TYPE.${key}.${property}`, expected, theme.TYPE?.[key]?.[property]);
  }
  const terms = entries(design, 'terminology');
  for (const key of ['live', 'static', 'staticSingular', 'offerBadge']) if (!terms[key]) issues.push(`DESIGN.md: falta terminology.${key}.`);
  compare('PUBLICATION_COPY.LIVE.label', terms.live, copy.PUBLICATION_COPY?.LIVE?.label);
  compare('PUBLICATION_COPY.STATIC.label', terms.static, copy.PUBLICATION_COPY?.STATIC?.label);
  compare('PUBLICATION_COPY.LIVE.badgeLabel', terms.live?.toLocaleUpperCase('es-MX'), copy.PUBLICATION_COPY?.LIVE?.badgeLabel);
  compare('PUBLICATION_COPY.STATIC.badgeLabel', terms.staticSingular?.toLocaleUpperCase('es-MX'), copy.PUBLICATION_COPY?.STATIC?.badgeLabel);
  compare('PUBLICATION_BADGES.offer', terms.offerBadge, copy.PUBLICATION_BADGES?.offer);
  return issues;
}

function inspectSource(file, content, canonicalCopy = new Set()) {
  const source = parse(file, content);
  const issues = [];
  const legacy = /^(?:(?:nueva?|nuevo|editar|crear|publicar|ver)\s+)?(?:ventas? en vivo|en vivo|disponibles ahora|catálogo|con horario|anuncios?)$/iu;
  const isTheme = file === 'theme.js';
  const add = (node, rule) => issues.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}: ${rule}`);
  const visit = node => {
    if (ts.isStringLiteralLike(node) || ts.isJsxText(node)) {
      const text = node.text.trim();
      if (file !== 'lib/publication-copy.ts' && canonicalCopy.has(text)) add(node, 'Texto de tipo duplicado; importar PUBLICATION_COPY/PUBLICATION_BADGES.');
      if (legacy.test(text) || /(?:^|\s)anuncios?(?=\s|[.,:!?]|$)/iu.test(text)) add(node, 'Etiqueta anterior; utilizar PUBLICATION_COPY según DESIGN.md.');
      if (ts.isJsxText(node) && text === 'Oferta') add(node, 'La insignia compartida se llama GANGA; la configuración es Precio de oferta.');
      if (/[‹←↩✓☑]/u.test(text)) add(node, 'Utilizar Ionicons para iconos de acción.');
    }
    if (!isTheme && ts.isPropertyAssignment(node)) {
      const name = node.name.getText();
      if (/color|background|tint/i.test(name) && ts.isStringLiteralLike(node.initializer) && /^(?:#[\da-f]{3,8}|rgba?\()/i.test(node.initializer.text)) add(node, 'Color local; utilizar un token de theme.js.');
      if (name === 'fontFamily' && ts.isStringLiteralLike(node.initializer)) add(node, 'Fuente local; utilizar FONTS/TYPE de theme.js.');
    }
    if (ts.isImportDeclaration(node) && /expo-(?:glass-effect|blur)/.test(node.moduleSpecifier.text) && file !== 'components/tab-bar-material.tsx') add(node, 'Glass/blur permitido únicamente en tab-bar-material.tsx.');
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (file.startsWith('app/(tabs)/') && node.tagName.getText() === 'SafeAreaView') add(node, 'Las tabs comparten MarketplaceViewport; no añadir otra SafeAreaView.');
      if (node.tagName.getText() === 'TypeSelector' && node.attributes.properties.some(p => ts.isJsxAttribute(p) && ['liveLabel', 'staticLabel'].includes(p.name.getText()))) add(node, 'Los nombres del selector proceden del vocabulario compartido.');
    }
    if (ts.isJsxAttribute(node) && /color|tint/i.test(node.name.getText()) && node.initializer) {
      const initializer = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (initializer && ts.isStringLiteralLike(initializer) && /^(?:#[\da-f]{3,8}|rgba?\()/i.test(initializer.text)) add(node, 'Color local; utilizar un token de theme.js.');
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return issues;
}

function readInputs() {
  const read = file => fs.readFileSync(file, 'utf8');
  return { design: read(path.join(project, 'DESIGN.md')), theme: read(path.join(frontend, 'src/theme.js')), copy: read(path.join(frontend, 'src/lib/publication-copy.ts')) };
}

function compareSidecar(sidecar, design, themeSource) {
  const issues = [];
  const colors = constants('theme.js', themeSource).COLORS ?? {};
  const allowed = new Set(Object.values(colors).filter(value => typeof value === 'string').map(value => value.toUpperCase()));
  const terms = entries(design, 'terminology');
  for (const component of sidecar.components ?? []) {
    for (const [color] of (component.css ?? '').matchAll(/#[\da-f]{3,8}\b/gi)) {
      if (!allowed.has(color.toUpperCase())) issues.push(`.impeccable/design.json (${component.name}): color anterior ${color}.`);
    }
    if (component.refersTo === 'type-selected' && (![terms.live, terms.static].every(term => component.html?.includes(term)) || /Disponibles ahora|Catálogo/.test(component.html ?? ''))) issues.push('.impeccable/design.json: selector con nombres anteriores.');
    if (component.refersTo === 'navigation-selected') {
      const nav = component.css?.match(/\.ds-nav\s*\{([^}]+)\}/)?.[1] ?? '';
      if (!nav.includes(`background:${colors.navigationBar}`)) issues.push('.impeccable/design.json: navegación ajena al material/color vigentes.');
    }
  }
  return issues;
}

function inspectStylesheet(file, content, themeSource) {
  const fonts = constants('theme.js', themeSource).FONTS ?? {};
  const issues = [];
  for (const [, property, raw] of content.matchAll(/(--font-[\w-]+|font-family)\s*:\s*([^;{}]+)/g)) {
    if (property.startsWith('--font-') && !['--font-display', '--font-body'].includes(property)) {
      issues.push(`${file}: rol de fuente CSS ajeno a DESIGN.md (${property}).`);
      continue;
    }
    const first = raw.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    const expected = property === '--font-display' ? fonts.display : property === '--font-body' ? fonts.regular : undefined;
    if (expected ? first !== expected : !Object.values(fonts).includes(first) && !/^var\(--font-(?:body|display)\)$/.test(first)) issues.push(`${file}: fuente CSS ajena a theme.js (${raw.trim()}).`);
  }
  return issues;
}

function checkDesign() {
  const { design, theme, copy } = readInputs();
  const issues = compareDesign(design, theme, copy);
  const wording = constants('publication-copy.ts', copy);
  const canonicalCopy = new Set([...Object.values(wording.PUBLICATION_COPY ?? {}).flatMap(Object.values), ...Object.values(wording.PUBLICATION_BADGES ?? {})]);
  const sidecar = path.join(project, '.impeccable/design.json');
  if (fs.existsSync(sidecar)) {
    try { issues.push(...compareSidecar(JSON.parse(fs.readFileSync(sidecar, 'utf8')), design, theme)); }
    catch { issues.push('.impeccable/design.json: índice auxiliar ilegible.'); }
  }
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.css')) issues.push(...inspectStylesheet(path.relative(frontend, file), fs.readFileSync(file, 'utf8'), theme));
      else if (/\.(?:tsx?|js)$/.test(entry.name)) issues.push(...inspectSource(path.relative(path.join(frontend, 'src'), file).replaceAll(path.sep, '/'), fs.readFileSync(file, 'utf8'), canonicalCopy));
    }
  }
  walk(path.join(frontend, 'src'));
  return issues;
}

module.exports = { checkDesign, compareDesign, compareSidecar, inspectSource, inspectStylesheet, readInputs };
if (require.main === module) {
  const issues = checkDesign();
  if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
  else console.log('DESIGN.md: tokens, terminología, iconos, tabs y materiales coherentes en las fuentes.');
}
