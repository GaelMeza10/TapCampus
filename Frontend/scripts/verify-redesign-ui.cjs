// Capturas de las pantallas reales con datos aislados, sin iniciar ni modificar la API del usuario.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.local', 'visual');
fs.mkdirSync(output, { recursive: true });
const profile = path.join(output, `chrome-${Date.now()}`);
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const mime = { '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.css': 'text/css' };
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{margin:0;height:100%;width:100%;overflow:hidden}#root{display:flex}</style></head><body><div id="root"></div><script src="/main.js"></script></body></html>';
const requests = [];
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
  if (pathname.startsWith('/socket.io/')) { response.writeHead(404); response.end(); return; }
  let file = path.resolve(output, '.' + pathname);
  if (!file.startsWith(output + path.sep)) file = '';
  if (/^\/uploads\/[\da-f-]+\.png$/.test(pathname)) file = path.resolve(root, '../Backend', '.' + pathname);
  if ((!file || !fs.existsSync(file)) && pathname.startsWith('/assets/')) {
    const base = path.basename(pathname);
    const files = fs.readdirSync(path.join(output, 'assets'), { recursive: true });
    const found = files.find(name => path.basename(name) === base || path.basename(name).startsWith(base.replace(/\.[^.]+$/, '') + '.'));
    if (found) file = path.join(output, 'assets', found);
  }
  if (file && fs.existsSync(file) && fs.statSync(file).isFile()) { response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(response); }
  else if (path.extname(pathname)) { requests.push(pathname); response.writeHead(404); response.end(); }
  else { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(html); }
});
let chrome, socket;
let serial = 0;
const pending = new Map();
const exceptions = [];
async function cdp(method, params = {}) {
  const id = ++serial;
  const result = new Promise((resolve, reject) => { const timer = setTimeout(() => { pending.delete(id); reject(new Error('DevTools sin respuesta: ' + method)); }, 15000); pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } }); });
  socket.send(JSON.stringify({ id, method, params }));
  return result;
}
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.result.description);
  return result.result.value;
}
async function until(expression) {
  const deadline = Date.now() + 20000;
  do { try { if (await evaluate(expression)) return; } catch {} await pause(100); } while (Date.now() < deadline);
  throw new Error('La pantalla no llegó al estado esperado: ' + expression + '\n' + JSON.stringify(exceptions));
}
async function click(text, role = 'button') {
  await evaluate(`(()=>{const el=[...document.querySelectorAll('[role="${role}"]')].find(e=>e.getAttribute('aria-label')?.startsWith(${JSON.stringify(text)})||e.textContent.trim()===${JSON.stringify(text)}||e.textContent.startsWith(${JSON.stringify(text)}));if(!el)throw new Error('Control no encontrado: '+${JSON.stringify(text)});el.click();})()`);
  await pause(200);
}
async function type(label, value) {
  await evaluate(`(()=>{const el=document.querySelector('input[aria-label="${label}"],textarea[aria-label="${label}"]');if(!el)throw new Error('Campo no encontrado');Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await pause(100);
}
async function capture(name) {
  await pause(250);
  const result = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(output, name + '.png'), Buffer.from(result.data, 'base64'));
  const geometry = await evaluate(`({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,font:[...new Set([...document.querySelectorAll('div,a,p,span,input,textarea')].filter(e=>e.childElementCount===0&&(e.textContent.trim()||e.tagName==='INPUT'||e.tagName==='TEXTAREA')).map(e=>getComputedStyle(e).fontFamily))],text:document.body.innerText})`);
  assert.equal(geometry.scrollWidth, 390, 'Desbordamiento horizontal');
  assert(geometry.font.every(name => /Inter_|ionicons/i.test(name)), 'Fuente distinta del sistema aprobado: ' + geometry.font.join(', '));
  return { name, ...geometry };
}
(async () => {
  assert(fs.existsSync(chromePath), 'Define CHROME_PATH con la ruta de Chrome.');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  if (!process.argv.includes('--reuse-bundle')) {
    const build = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'export:embed', '--platform', 'web', '--dev', 'false', '--minify', 'false', '--entry-file', 'scripts/visual-fixture.tsx', '--bundle-output', '.local/visual/main.js', '--assets-dest', '.local/visual/assets', '--max-workers', '2'], { cwd: root, env: { ...process.env, EXPO_PUBLIC_API_URL: origin }, encoding: 'utf8', timeout: 180000, windowsHide: true });
    assert.equal(build.status, 0, build.stdout + build.stderr);
  }
  console.log('Bundle de revisión preparado; iniciando Chrome.');
  chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  const devtools = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; !fs.existsSync(devtools) && i < 150; i++) await pause(100);
  assert(fs.existsSync(devtools), 'Chrome no inició DevTools.');
  const port = fs.readFileSync(devtools, 'utf8').split('\n')[0];
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  socket.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (message.id) { const request = pending.get(message.id); pending.delete(message.id); if (message.error) request.reject(new Error(JSON.stringify(message.error))); else request.resolve(message.result); } else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text); });
  await cdp('Runtime.enable'); await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const shots = [];
  async function open(route, text) { console.log('Revisando ' + route); await cdp('Page.navigate', { url: origin + route }); await until(`document.body.innerText.includes(${JSON.stringify(text)})`); await evaluate('document.fonts.ready.then(()=>true)'); }
  await open('/homePage', 'Torta de pollo'); shots.push(await capture('feed'));
  await click('Filtros.'); await until(`document.body.innerText.includes('Restablecer filtros')`); shots.push(await capture('filters'));
  await open('/login', 'Bienvenido de nuevo'); shots.push(await capture('login'));
  await open('/register', 'Crea tu cuenta'); shots.push(await capture('register'));
  await open('/publication/p1', 'Apartar una unidad'); shots.push(await capture('detail'));
  await click('Apartar una unidad'); await until(`document.body.innerText.includes('Reserva confirmada')`); shots.push(await capture('reservation-success'));
  await open('/reservations', 'Precio fijado'); shots.push(await capture('reservations'));
  await open('/reservations?scenario=expired', 'Estado: Vencida'); shots.push(await capture('reservations-expired'));
  await open('/sales', 'Reservas por entregar'); shots.push(await capture('sales'));
  await open('/sales?scenario=ganga', 'GANGA ACTIVA'); shots.push(await capture('sales-ganga'));
  await open('/sales?scenario=finished', 'FINALIZADA'); shots.push(await capture('sales-finished'));
  await open('/sales?type=STATIC', 'Cálculo I'); shots.push(await capture('catalog-sales'));
  await open('/sales?type=STATIC&scenario=sold', 'VENDIDO'); shots.push(await capture('catalog-sold'));
  await open('/publication/edit', 'Nueva publicación'); shots.push(await capture('form-live'));
  await type('Precio', '85'); await click('Precio Ganga'); await click('Programada'); await type('Precio ganga opcional', '65'); await type('Minutos antes del fin', '10'); shots.push(await capture('ganga-config'));
  await open('/publication/edit?type=STATIC', 'Publicar artículo'); shots.push(await capture('form-catalog'));
  await open('/homePage?scenario=empty', 'Sin resultados'); shots.push(await capture('empty'));
  await open('/homePage?scenario=error', 'No se pudieron cargar'); shots.push(await capture('error'));
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
  assert.equal(requests.length, 0, 'Recursos ausentes: ' + JSON.stringify(requests));
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ viewport: [390, 844], shots, exceptions, missingAssets: requests }, null, 2));
  console.log(`PASS: ${shots.length} capturas, sin desbordamiento horizontal ni recursos ausentes. ${output}`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  socket?.close(); chrome?.kill(); server.closeAllConnections(); server.close();
  if (chrome) await new Promise(resolve => { if (chrome.exitCode !== null) resolve(); else { chrome.once('exit', resolve); setTimeout(resolve, 2000); } });
  // Solo el perfil temporal creado por esta ejecución; verificar su ruta antes de retirar.
  if (path.dirname(profile) === output && path.basename(profile).startsWith('chrome-')) { try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} }
});
