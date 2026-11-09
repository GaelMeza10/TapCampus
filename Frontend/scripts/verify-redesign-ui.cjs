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
let viewportWidth = 390;
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
  await evaluate(`(()=>{const el=[...document.querySelectorAll('[role="${role}"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[aria-hidden="true"],[inert]');}).filter(e=>e.getAttribute('aria-label')?.startsWith(${JSON.stringify(text)})||e.textContent.trim()===${JSON.stringify(text)}||e.textContent.startsWith(${JSON.stringify(text)})).at(-1);if(!el)throw new Error('Control no encontrado: '+${JSON.stringify(text)});el.click();})()`);
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
  assert.equal(geometry.scrollWidth, viewportWidth, 'Desbordamiento horizontal');
  const clipped = await evaluate(`([...document.querySelectorAll('[role="button"],[role="tab"],input,textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&(r.left< -1||r.right>innerWidth+1)}).map(e=>e.getAttribute('aria-label')||e.textContent))`);
  assert.deepEqual(clipped, [], 'Controles fuera del ancho disponible: ' + JSON.stringify(clipped));
  assert(!/Encuentra algo cerca de ti|Tu campus, más cerca|Controla stock y entregas en tiempo real|Cada apartado conserva su precio y plazo|Artículos publicados · contacto directo/.test(geometry.text), 'Subtítulo redundante');
  assert(geometry.font.every(name => /Inter_|ionicons/i.test(name)), 'Fuente distinta del sistema aprobado: ' + geometry.font.join(', '));
  const nav = await evaluate(`(()=>{const roots=[...document.querySelectorAll('[role="tablist"]')].filter(e=>e.querySelector('[aria-label="Explorar"]')&&e.getBoundingClientRect().height>0&&!e.closest('[aria-hidden="true"]'));const root=roots.at(-1);if(!root)return null;const tabs=[...root.querySelectorAll('[role="tab"]')];const selected=tabs.filter(e=>e.getAttribute('aria-selected')==='true');return {count:tabs.length,selected:selected.length,background:selected[0]?getComputedStyle(selected[0]).backgroundColor:null};})()`);
  if(nav) { assert.equal(nav.count,4,'Deben existir cuatro módulos'); assert.equal(nav.selected,1,'Selección de módulo ambigua'); assert.equal(nav.background,'rgba(23, 97, 59, 0.12)','La pestaña activa no tiene fondo translúcido'); }
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
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(15000) })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  socket.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (message.id) { const request = pending.get(message.id); pending.delete(message.id); if (message.error) request.reject(new Error(JSON.stringify(message.error))); else request.resolve(message.result); } else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text); });
  await cdp('Runtime.enable'); await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const shots = [];
  async function open(route, text) { console.log('Revisando ' + route); await cdp('Page.navigate', { url: origin + route }); await until(`document.body.innerText.includes(${JSON.stringify(text)})`); await evaluate('document.fonts.ready.then(()=>true)'); }
  await open('/homePage', 'Torta de pollo'); shots.push(await capture('feed'));
  await type('Buscar productos', 'torta'); await until(`document.body.innerText.includes('Resultados') && !document.body.innerText.includes('Brownie de chocolate') && document.body.innerText.includes('Torta de pollo')`); shots.push(await capture('search-results'));
  await type('Buscar productos', 'sin coincidencias'); await until(`document.body.innerText.includes('No encontramos publicaciones para')`); shots.push(await capture('search-empty'));
  await click('Limpiar texto de búsqueda'); await until(`document.body.innerText.includes('Brownie de chocolate')`);
  await click('Cuenta','tab'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account'));
  await click('Explorar','tab'); await until(`document.body.innerText.includes('Brownie de chocolate')`);
  await click('Filtros.'); await until(`document.body.innerText.includes('Restablecer filtros')`); shots.push(await capture('filters'));
  await open('/login', 'Bienvenido de nuevo'); shots.push(await capture('login'));
  await open('/register', 'Crea tu cuenta'); shots.push(await capture('register'));
  await open('/publication/p1', 'Apartar una unidad'); shots.push(await capture('detail'));
  await click('Apartar una unidad'); await until(`document.body.innerText.includes('¿Quieres apartar una unidad?')`); shots.push(await capture('reservation-confirm'));
  await click('Volver'); await until(`!document.body.innerText.includes('¿Quieres apartar una unidad?')`);
  await click('Apartar una unidad'); await click('Sí, apartar'); await until(`document.body.innerText.includes('Reserva confirmada')`); shots.push(await capture('reservation-success'));
  await click('Apartar otra unidad'); await click('Volver'); assert(await evaluate(`document.body.innerText.includes('Reserva confirmada')`), 'Volver perdió la reserva previa');
  await open('/publication/p1?scenario=reserve-error', 'Apartar una unidad'); await click('Apartar una unidad'); await click('Sí, apartar');
  await until(`document.body.innerText.includes('No se pudo apartar. Inténtalo de nuevo.')`); shots.push(await capture('reservation-confirm-error'));
  await open('/publication/p1?scenario=reserve-sending', 'Apartar una unidad'); await click('Apartar una unidad'); await click('Sí, apartar');
  await until(`document.body.innerText.includes('Apartando…')`); shots.push(await capture('reservation-confirm-sending'));
  await open('/publication/p1?scenario=missing-photo', 'Apartar una unidad');
  assert(await evaluate(`document.body.innerText.includes('Sin foto') && document.body.innerText.includes('$85')`), 'La foto ausente oculta información del producto');
  shots.push(await capture('detail-missing-photo'));
  await open('/reservations', 'Precio fijado'); shots.push(await capture('reservations'));
  await click('Cuenta','tab'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account-from-reservations'));
  await click('Reservas','tab'); await until(`document.body.innerText.includes('Precio fijado')`);
  await open('/reservations?scenario=expired', 'Estado: Vencida'); shots.push(await capture('reservations-expired'));
  await open('/sales', 'Reservas por entregar'); shots.push(await capture('sales'));
  assert(!(await evaluate(`document.body.innerText.includes('Cerrar sesión')`)), 'Cerrar sesión sigue dentro del listado de ventas');
  await click('Cuenta','tab'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account-from-sales'));
  await open('/account?scenario=profile-error', 'No pudimos cargar tu información'); shots.push(await capture('account-error'));
  await evaluate('window.recoverPreview()'); await click('Reintentar'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account-retry'));
  await open('/account?scenario=profile-loading', 'Cargando tu cuenta…'); shots.push(await capture('account-loading'));
  await open('/sales?scenario=ganga', 'GANGA ACTIVA'); shots.push(await capture('sales-ganga'));
  await open('/sales?scenario=finished', 'FINALIZADA'); shots.push(await capture('sales-finished'));
  await open('/sales?type=STATIC', 'Cálculo I'); shots.push(await capture('catalog-sales'));
  await open('/sales?type=STATIC&scenario=sold', 'VENDIDO'); shots.push(await capture('catalog-sold'));
  await open('/publication/edit', 'Nueva publicación'); shots.push(await capture('form-live'));
  await type('Precio', '85'); await click('Precio Ganga'); await click('Programada'); await type('Precio ganga opcional', '65'); await type('Minutos antes del fin', '10'); shots.push(await capture('ganga-config'));
  await open('/publication/edit?type=STATIC', 'Publicar artículo'); shots.push(await capture('form-catalog'));
  await open('/homePage?scenario=empty', 'Sin resultados'); shots.push(await capture('empty'));
  await open('/homePage?scenario=error', 'No se pudieron cargar'); shots.push(await capture('error'));
  await click('Reintentar');
  await open('/login', 'Bienvenido de nuevo'); await click('Iniciar sesión'); await until(`document.body.innerText.includes('Ingresa tu correo')`); shots.push(await capture('login-validation'));
  await open('/publication/edit', 'Nueva publicación');
  await type('Descripción', 'Descripción conservada al corregir el formulario');
  const titleWasHidden = await evaluate(`(()=>{const el=document.querySelector('input[aria-label="Título"]');for(let node=el.parentElement;node;node=node.parentElement){if(node.scrollHeight>node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)){node.scrollTop=node.scrollHeight;return el.getBoundingClientRect().bottom <= node.getBoundingClientRect().top;}}return false;})()`);
  assert(titleWasHidden, 'El escenario no dejó el título fuera de vista');
  await click('Publicar'); await until(`document.body.innerText.includes('Escribe un título')`); shots.push(await capture('form-validation'));
  assert.equal(await evaluate(`document.activeElement?.getAttribute('aria-label')`), 'Título', 'El error no enfoca el título');
  assert(await evaluate(`(()=>{const r=document.activeElement.getBoundingClientRect();return r.top>=205 && r.bottom<760 && document.querySelector('textarea[aria-label="Descripción"]').value==='Descripción conservada al corregir el formulario';})()`), 'La recuperación no muestra el título o pierde la descripción');
  await type('Título', 'Borrador conservado'); await type('Stock disponible', '-1');
  await evaluate(`(()=>{const el=document.querySelector('input[aria-label="Título"]');for(let node=el.parentElement;node;node=node.parentElement){if(node.scrollHeight>node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)){node.scrollTop=node.scrollHeight;break;}}})()`);
  await click('Publicar'); await until(`document.body.innerText.includes('El stock debe ser un entero no negativo')`);
  const recovery = await evaluate(`(()=>{const el=document.querySelector('input[aria-label="Stock disponible"]');const rect=el.getBoundingClientRect();return {focused:document.activeElement===el,top:rect.top,bottom:rect.bottom,title:document.querySelector('input[aria-label="Título"]').value};})()`);
  assert(recovery.focused && recovery.top >= 47 && recovery.bottom < 760, 'El campo con error sigue fuera del área visible: ' + JSON.stringify(recovery));
  assert.equal(recovery.title, 'Borrador conservado', 'La recuperación perdió el borrador');
  shots.push(await capture('form-stock-recovery'));
  await open('/register?scenario=sending', 'Crea tu cuenta');
  await type('Nombre completo', 'Ana'); await type('Correo institucional', 'ana@uabc.edu.mx'); await type('Teléfono', '5512345678'); await type('Contraseña', 'password123'); await click('', 'checkbox'); await click('Crear cuenta');
  await until(`document.body.innerText.includes('Creando cuenta…')`); shots.push(await capture('register-sending'));
  for (const width of [320, 430]) {
    viewportWidth = width;
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
    for (const [route, expected, name] of [['/homePage?scenario=long', 'Torta de pollo', 'feed-long'], ['/publication/p1?scenario=long', 'Apartar una unidad', 'detail-long'], ['/sales', 'Reservas por entregar', 'sales'], ['/register', 'Crea tu cuenta', 'register'], ['/publication/edit', 'Nueva publicación', 'form']]) { await open(route, expected); shots.push(await capture(name + '-' + width)); }
    await open('/publication/p1?scenario=long', 'Apartar una unidad'); await click('Apartar una unidad'); shots.push(await capture('reservation-confirm-long-' + width));
    await open('/reservations?scenario=long', 'Precio fijado'); shots.push(await capture('reservations-photo-long-' + width));
    await open('/account?scenario=long', 'maria.fernanda.garcia.lopez'); shots.push(await capture('account-long-' + width));
    await open('/homePage', 'Torta de pollo'); await type('Buscar productos', 'TORTA'); await until(`document.body.innerText.includes('Resultados') && !document.body.innerText.includes('Brownie de chocolate') && document.body.innerText.includes('Torta de pollo')`); shots.push(await capture('search-results-' + width));
  }
  for (const [width, height, name] of [[375, 812, '375'], [844, 390, 'landscape']]) {
    viewportWidth = width;
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await open('/account', 'ana@uabc.edu.mx');
    await evaluate(`(()=>{const el=document.querySelector('[role="button"][aria-label="Cerrar sesión"]');el?.scrollIntoView({block:'nearest'});})()`);
    const visibleActions = await evaluate(`(()=>{const el=document.querySelector('[role="button"][aria-label="Cerrar sesión"]');if(!el)return false;const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.height>=44;})()`);
    assert(visibleActions, 'Acciones de cuenta recortadas en ' + name);
    shots.push(await capture('account-reduced-' + name));
  }
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
