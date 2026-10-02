import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const specsRoot = join(root, 'specs');
const required = ['spec.md', 'plan.md', 'tasks.md', 'verification.md', 'decisions.md'];
const failures = [];
const requirements = readFileSync(join(root, 'docs', '02_REQUIREMENTS.md'), 'utf8');
const stories = readFileSync(join(root, 'docs', '06_USER_STORIES_AND_TASKS.md'), 'utf8');
const traceability = readFileSync(join(root, 'docs', '10_TRACEABILITY.md'), 'utf8');
const requirementIds = ids(requirements, /\*\*(RF-\d{2}[a-z]?|RNF-\d{2}):/g);
const storyIds = new Set(ids(stories, /\*\*(US-\d{2}[a-z]?)\b/g));

function ids(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

for (const id of requirementIds) {
  if (!traceability.split(/\r?\n/).some((line) => line.startsWith(`| ${id} `))) {
    failures.push(`matriz de trazabilidad: falta ${id}`);
  }
}

for (const name of readdirSync(specsRoot).filter((entry) => /^\d{4}-/.test(entry))) {
  const folder = join(specsRoot, name);
  for (const file of required) {
    if (!existsSync(join(folder, file))) failures.push(`${name}: falta ${file}`);
  }
  if (required.some((file) => !existsSync(join(folder, file)))) continue;

  const spec = readFileSync(join(folder, 'spec.md'), 'utf8');
  const tasks = readFileSync(join(folder, 'tasks.md'), 'utf8');
  const verification = readFileSync(join(folder, 'verification.md'), 'utf8');
  const decisions = readFileSync(join(folder, 'decisions.md'), 'utf8');
  const criteria = ids(spec, /^### (AC-\d+)\b/gm);
  const taskIds = ids(tasks, /^- \[[ x]\] \*\*(T-\d+)\*\*/gm);
  const taskLines = tasks.split(/\r?\n/).filter((line) => /^- \[[ x]\] \*\*T-\d+\*\*/.test(line));
  const verificationRows = verification.split(/\r?\n/).filter((line) => /^\| AC-\d+ \|/.test(line));
  if (criteria.length === 0) failures.push(`${name}: spec.md no define criterios AC`);
  if (taskIds.length === 0) failures.push(`${name}: tasks.md no define tareas T`);
  for (const reference of ids(spec, /\b(RF-\d{2}[a-z]?|RNF-\d{2}|US-\d{2}[a-z]?)\b/g)) {
    if (reference.startsWith('US-') ? !storyIds.has(reference) : !requirementIds.includes(reference)) {
      failures.push(`${name}: spec.md cita ${reference} inexistente`);
    }
  }
  for (const [label, values] of [['AC', criteria], ['T', taskIds]]) {
    if (new Set(values).size !== values.length) failures.push(`${name}: identificador ${label} duplicado`);
  }
  for (const criterion of criteria) {
    if (!taskLines.some((line) => line.includes(criterion))) {
      failures.push(`${name}: ${criterion} no aparece en ninguna tarea`);
    }
    const row = verificationRows.find((line) => line.startsWith(`| ${criterion} |`));
    if (!row || !/EV-\d+/.test(row)) failures.push(`${name}: ${criterion} no tiene fila EV en verification.md`);
  }
  for (const reference of ids(tasks, /\b(AC-\d+)\b/g)) {
    if (!criteria.includes(reference)) failures.push(`${name}: tarea cita ${reference} inexistente`);
  }
  for (const row of verificationRows) {
    const criterion = row.match(/^\| (AC-\d+) \|/)?.[1];
    if (!criteria.includes(criterion)) failures.push(`${name}: verificación cita ${criterion} inexistente`);
  }
  for (const taskId of taskIds) {
    if (!verification.includes(taskId)) failures.push(`${name}: ${taskId} no aparece en verification.md`);
  }
  if (/Estado:\s*\*\*Verificado\*\*/i.test(spec)) {
    if (taskLines.some((line) => line.startsWith('- [ ]')) || /Pendiente|Sin ejecutar|Abierta/i.test(verification + decisions)) {
      failures.push(`${name}: figura Verificado con tareas, decisiones o evidencia pendientes`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`ERROR: ${failure}`);
  process.exitCode = 1;
} else {
  console.log('SDD: estructura e identificadores básicos correctos. La revisión semántica sigue siendo necesaria.');
}
