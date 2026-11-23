// Read only: retrieves the bounded TapCampus layout trace from a connected Expo Go Hermes runtime.
// Does not collect other console logs, application state, tokens, or profile data.
const { writeFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const port = Number(process.argv[2] || 8081);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Puerto Metro inválido');
(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(4000) })).json();
  const devices = targets.filter(target => target.webSocketDebuggerUrl && /Hermes|React Native/i.test(`${target.description} ${target.title}`));
  if (!devices.length) throw Error('No hay un runtime Hermes conectado a este Metro. Abre TapCampus en Expo Go.');
  const dir = resolve('../specs/0047-usabilidad-y-recogida/evidence/native'); mkdirSync(dir, { recursive: true });
  for (const [index, target] of devices.entries()) {
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    const response = new Promise((yes, no) => {
      const timer = setTimeout(() => no(Error('El runtime no respondió')), 8000);
      socket.addEventListener('error', no, { once: true });
      socket.addEventListener('message', event => {
        const row = JSON.parse(event.data);
        if (row.id === 1) { clearTimeout(timer); yes(row); }
      });
    });
    try {
      await new Promise((yes, no) => { socket.addEventListener('open', yes, { once: true }); socket.addEventListener('error', no, { once: true }); });
      socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: 'JSON.stringify(globalThis.__tapCampusLayoutTrace ?? [])', returnByValue: true } }));
      const result = await response;
      if (result.error || result.result?.exceptionDetails) throw Error('No se pudo leer la traza de layout');
      const trace = JSON.parse(result.result.result.value);
      if (!Array.isArray(trace) || !trace.length) throw Error('Traza vacía: recarga el bundle actualizado y cambia de pestaña.');
      const file = resolve(dir, `layout-${Date.now()}-${index}.json`);
      writeFileSync(file, JSON.stringify({ capturedAt: new Date().toISOString(), source: 'Expo Go / Hermes real', trace }, null, 2));
      console.log(JSON.stringify({ file, samples: trace.length, runtime: trace.find(row => row.event === 'runtime')?.data }));
    } finally { socket.close(); }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
