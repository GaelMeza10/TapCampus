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
  // El bundle conserva el origen de imágenes compilado: al reutilizarlo, servir en ese mismo puerto.
  const cachedOrigin = process.argv.includes('--reuse-bundle')
    ? fs.readFileSync(path.join(output, 'main.js'), 'utf8').match(/const API_BASE_URL = "(http:\/\/127\.0\.0\.1:\d+)"/)?.[1]
    : undefined;
  assert(!process.argv.includes('--reuse-bundle') || cachedOrigin, 'El bundle no contiene un origen local reutilizable; vuelve a generarlo.');
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(cachedOrigin ? Number(new URL(cachedOrigin).port) : 0, '127.0.0.1', resolve); });
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
  if (process.argv.includes('--contact-only')) {
    // Nunca abrir WhatsApp ni enviar mensajes durante la revisión auxiliar.
    const contactVisible = `(()=>{const el=[...document.querySelectorAll('[role="button"]')].find(e=>e.textContent.trim()==='Contactar por WhatsApp');if(!el)return false;const r=el.getBoundingClientRect();return r.height>=48&&r.top>=0&&r.bottom<=innerHeight;})()`;
    for (const [width,height] of [[320,844],[390,844],[430,932],[844,390]]) {
      viewportWidth=width;
      await cdp('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:true});
      await open('/publication/p1?scenario=contact-empty','Apartar una unidad');
      assert(await evaluate(contactVisible),'Contacto previo fuera de vista');
      shots.push(await capture('contact-live-'+width));
      await click('Contactar por WhatsApp');
      assert.equal(await evaluate(`new URL(window.contactPreview.links[0]).searchParams.get('text')`),'Hola, me interesa Torta de pollo en TapCampus. ¿Sigue disponible?');
      assert(!(await evaluate(`document.body.innerText.includes('Reserva confirmada')`)),'Consulta creó una reserva');
      await evaluate('window.contactPreview.fail=true');
      await click('Contactar por WhatsApp');
      await until(`document.body.innerText.includes('No se pudo abrir WhatsApp')`);
      shots.push(await capture('contact-error-'+width));
      await evaluate('window.contactPreview.fail=false');
      await click('Contactar por WhatsApp');
      await until(`!document.body.innerText.includes('No se pudo abrir WhatsApp')`);
      await open('/publication/book','Cálculo I');
      assert(await evaluate(contactVisible),'Contacto STATIC fuera de vista');
      await click('Contactar por WhatsApp');
      assert.equal(await evaluate(`new URL(window.contactPreview.links[0]).searchParams.get('text')`),'Hola, me interesa Cálculo I en TapCampus. ¿Sigue disponible?');
      shots.push(await capture('contact-static-'+width));
    }
    viewportWidth=390;
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await open('/publication/p1?scenario=contact-invisible','Publicación no disponible');
    assert(!(await evaluate(contactVisible)),'Consulta en detalle invisible');
    await click('Contactar por WhatsApp sobre Torta de pollo');
    assert.equal(await evaluate(`new URL(window.contactPreview.links[0]).searchParams.get('text')`),'Hola, reservé Torta de pollo en TapCampus. ¿Podemos coordinar la entrega?');
    shots.push(await capture('contact-reservation-unavailable'));
    await open('/publication/p1?scenario=contact-legacy','Apartar una unidad');
    assert(!(await evaluate(contactVisible)),'Se inventó un contacto de API anterior');
    shots.push(await capture('contact-legacy'));
    await open('/publication/p1?scenario=reserve-sending','Apartar una unidad');
    await click('Apartar una unidad');await click('Sí, apartar');await until(`document.body.innerText.includes('Apartando…')`);
    assert.equal(await evaluate('window.contactPreview.links.length'),0);
    shots.push(await capture('contact-reservation-sending'));
    await open('/publication/p1?scenario=contact-empty&fontScale=1.5','Apartar una unidad');
    await evaluate(`document.querySelectorAll('div,span,p').forEach(e=>{if(e.childElementCount===0&&e.textContent.trim()){const s=getComputedStyle(e);e.style.fontSize=parseFloat(s.fontSize)*1.5+'px';e.style.lineHeight=parseFloat(s.lineHeight)*1.5+'px';}})`);
    assert(await evaluate(contactVisible),'Contacto con texto ampliado fuera de vista');
    shots.push(await capture('contact-large-text'));
    assert.equal(exceptions.length,0,JSON.stringify(exceptions));
    assert.equal(requests.length,0,'Recursos ausentes: '+JSON.stringify(requests));
    fs.writeFileSync(path.join(output,'contact-result.json'),JSON.stringify({shots,exceptions,missingAssets:requests},null,2));
    console.log('PASS: '+shots.length+' capturas auxiliares de contacto. '+output);
    return;
  }
  if (process.argv.includes('--form-errors-only')) {
    async function noticeVisible() {
      assert(await evaluate(`(()=>{const r=document.querySelector('[data-testid="publication-form-notice"]').getBoundingClientRect();return r.height>=40&&r.top>=0&&r.bottom<=innerHeight;})()`), 'Aviso colapsado o fuera de vista');
    }
    for (const [width,height] of [[320,844],[375,812],[430,932],[844,390]]) {
      viewportWidth=width;
      await cdp('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:true});
      await open('/publication/edit','Nueva publicación');
      await click('Publicar'); await until(`document.body.innerText.includes('Revisa los campos señalados')`);
      await noticeVisible(); shots.push(await capture('form-errors-all-'+width));
      await evaluate(`(()=>{const e=document.querySelector('[data-testid="publication-form-scroll"]');e.scrollTop=e.scrollHeight;})()`);
      await until(`document.querySelector('[data-testid="publication-form-scroll"]').scrollTop>0`);
      await noticeVisible(); shots.push(await capture('form-errors-bottom-'+width));
      await open('/publication/edit?id=p1','Editar publicación'); await until(`!!document.querySelector('[data-testid="selected-publication-image"]')`);
      await type('Título',''); await click('Guardar cambios');
      await until(`document.activeElement.getAttribute('aria-label')==='Título'`);
      await noticeVisible();
      assert(await evaluate(`(()=>{const r=document.activeElement.getBoundingClientRect(),n=document.querySelector('[data-testid="publication-form-notice"]').getBoundingClientRect();return r.top>=n.bottom-1&&r.bottom<=innerHeight;})()`),'Campo con error oculto');
      shots.push(await capture('form-errors-focus-'+width));
      await open('/publication/edit?id=p1&scenario=form-content','Editar publicación');
      await type('Título','Texto bloqueado de prueba'); await click('Guardar cambios');
      await until(`document.body.innerText.includes('Se detectó una palabra ofensiva')`);
      await noticeVisible(); shots.push(await capture('form-content-'+width));
      await type('Título','Título corregido');
      assert(!await evaluate(`document.body.innerText.includes('Se detectó una palabra ofensiva')`));
    }
    viewportWidth=375;
    await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
    await open('/publication/edit?id=p1&scenario=form-network','Editar publicación');
    await type('Título','Borrador'); await click('Guardar cambios'); await until(`document.body.innerText.includes('No se pudo guardar.')`);
    await type('Descripción','El fallo general persiste al escribir.');
    await noticeVisible(); shots.push(await capture('form-network-preserved'));
    await open('/publication/edit?scenario=form-zone-error','Nueva publicación');
    await until(`document.body.innerText.includes('Reintentar zonas')`);
    await type('Título','Borrador conservado'); await click('Seleccionar zona');
    shots.push(await capture('form-zone-error')); await click('Reintentar');
    await evaluate('window.recoverPreview()'); await click('Reintentar');
    await until(`!!document.querySelector('[role="radio"]')`); await click('Facultad de Ingeniería','radio');
    assert(await evaluate(`document.querySelector('input[aria-label="Título"]').value==='Borrador conservado'`));
    await open('/publication/edit?fontScale=1.5','Nueva publicación');
    await evaluate(`(()=>{for(const e of document.querySelectorAll('div,input,textarea'))if(e.childElementCount===0){const s=getComputedStyle(e);e.style.fontSize=parseFloat(s.fontSize)*1.5+'px';e.style.lineHeight=parseFloat(s.lineHeight)*1.5+'px';}})()`);
    await click('Publicar'); await noticeVisible(); shots.push(await capture('form-errors-large-text'));
    assert.equal(exceptions.length,0,JSON.stringify(exceptions)); assert.equal(requests.length,0,JSON.stringify(requests));
    fs.writeFileSync(path.join(output,'form-errors-result.json'),JSON.stringify({shots,exceptions,missingAssets:requests},null,2));
    console.log('PASS: '+shots.length+' capturas auxiliares de formulario. '+output); return;
  }
  if (process.argv.includes('--offers-only')) {
    for (const width of [320, 390, 430]) {
      viewportWidth = width;
      await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
      await open('/publication/edit?id=p1&scenario=offer-scheduled', 'Programada · $65.00');
      await click('Precio de oferta');
      shots.push(await capture('offers-scheduled-' + width));
      await click('Manual'); await click('Guardar configuración');
      await until(`document.body.innerText.includes('Manual · $65.00')`);
      await click('Precio de oferta');
      assert(await evaluate(`![...document.querySelectorAll('[role="button"]')].find(e=>e.textContent==='Sin oferta')?.hasAttribute('disabled')`));
      await click('Sin oferta'); await click('Guardar configuración');
      await until(`document.body.innerText.includes('Sin configurar · opcional')`);
      await click('Precio de oferta');
      shots.push(await capture('offers-withdrawn-' + width));
      await click('Manual'); await type('Precio de oferta opcional', '85'); await click('Guardar configuración');
      await until(`document.body.innerText.includes('El precio mínimo debe ser positivo y menor')`);
      shots.push(await capture('offers-equal-error-' + width));
    }
    assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
    assert.equal(requests.length, 0, 'Recursos ausentes: ' + JSON.stringify(requests));
    fs.writeFileSync(path.join(output, 'offers-result.json'), JSON.stringify({ shots, exceptions, missingAssets: requests }, null, 2));
    console.log('PASS: ' + shots.length + ' capturas auxiliares de ofertas. ' + output);
    return;
  }
  if (process.argv.includes('--publication-design-only')) {
    const scrollTo = label => evaluate(`(()=>{const el=document.querySelector('[aria-label="'+${JSON.stringify(label)}+'"]');el?.scrollIntoView({block:'center'});})()`);
    for (const [width, height] of [[320, 844], [375, 812], [390, 844], [430, 932], [844, 390]]) {
      viewportWidth = width;
      await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await open('/publication/edit', 'Nueva publicación');
      shots.push(await capture('publication-new-' + width));
      await scrollTo('Elegir fin de venta'); shots.push(await capture('publication-delivery-' + width));
      await click('Precio de oferta'); await click('Programada'); shots.push(await capture('publication-offer-' + width));
      await click('Cerrar panel');
      await open('/publication/edit?type=STATIC', 'Publicar artículo'); shots.push(await capture('publication-catalog-' + width));
      assert(!await evaluate(`!!document.querySelector('input[aria-label="Stock disponible"]')`), 'Catálogo expone stock');
      await open('/publication/edit?id=p1', 'Editar publicación'); await until(`!!document.querySelector('[data-testid="selected-publication-image"]')`);
      await until(`(()=>{const root=document.querySelector('[data-testid="selected-publication-image"]');const img=root?.tagName==='IMG'?root:root?.querySelector('img');return !!img?.complete&&img.naturalWidth>0;})()`);
      shots.push(await capture('publication-photo-' + width));
      await scrollTo('Descripción'); await type('Descripción', 'Borrador conservado al corregir.'); await type('Título', '');
      await click('Guardar cambios'); await until(`document.body.innerText.includes('Escribe un título')`);
      assert(await evaluate(`(()=>{const r=document.activeElement.getBoundingClientRect();return document.activeElement.getAttribute('aria-label')==='Título'&&r.top>=0&&r.bottom<innerHeight&&document.querySelector('textarea').value==='Borrador conservado al corregir.';})()`), 'Foco o borrador perdido');
      shots.push(await capture('publication-validation-' + width));
      await type('Título', 'Bowl de pollo'); await type('Stock disponible', '-1'); await click('Guardar cambios');
      await until(`document.body.innerText.includes('El stock debe ser un entero no negativo')`);
      assert(await evaluate(`(()=>{const r=document.activeElement.getBoundingClientRect();return document.activeElement.getAttribute('aria-label')==='Stock disponible'&&r.top>=0&&r.bottom<innerHeight;})()`), 'Stock fuera de vista');
      shots.push(await capture('publication-stock-' + width));
    }
    viewportWidth = 390;
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await open('/publication/edit?fontScale=1.5', 'Nueva publicación');
    await evaluate(`(()=>{for(const e of document.querySelectorAll('div,input,textarea')){if(e.childElementCount===0){const s=getComputedStyle(e);e.style.fontSize=parseFloat(s.fontSize)*1.5+'px';e.style.lineHeight=parseFloat(s.lineHeight)*1.5+'px';}}})()`);
    shots.push(await capture('publication-large-text'));
    await scrollTo('Elegir fin de venta'); shots.push(await capture('publication-delivery-large-text'));
    await click('Seleccionar zona'); await until(`!!document.querySelector('[role="radio"]')`); shots.push(await capture('publication-zone'));
    assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
    assert.equal(requests.length, 0, 'Recursos ausentes: ' + JSON.stringify(requests));
    fs.writeFileSync(path.join(output, 'publication-design-result.json'), JSON.stringify({ shots, exceptions, missingAssets: requests }, null, 2));
    console.log(`PASS: ${shots.length} capturas auxiliares de publicación. ${output}`);
    return;
  }
  if (process.argv.includes('--account-edit-only') || process.argv.includes('--account-design-only')) {
    const accountDesign = process.argv.includes('--account-design-only');
    const captureAccount = name => capture(accountDesign ? name.replace(/^account-/, 'account-design-') : name);
    for (const [width, height] of [[320, 844], [375, 812], [430, 932], [844, 390]]) {
      viewportWidth = width;
      await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      if (accountDesign) { await open('/account', 'Editar datos'); shots.push(await captureAccount(`account-profile-${width}`)); }
      await open('/account?scenario=long', 'Editar datos');
      if (accountDesign) shots.push(await captureAccount(`account-long-${width}`));
      await click('Editar datos'); shots.push(await captureAccount(`account-edit-${width}`));
      await type('Nombre completo', 'Ana María Pérez'); await type('Teléfono', '5512345678');
      await evaluate(`document.querySelector('[aria-label="Guardar cambios"]').scrollIntoView({block:'center'})`);
      shots.push(await captureAccount(`account-actions-${width}`));
      await click('Guardar cambios'); await until(`document.body.innerText.includes('Datos actualizados.')`);
      shots.push(await captureAccount(`account-saved-${width}`));
    }
    viewportWidth = 375;
    await cdp('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    for (const scenario of ['profile-save-error', 'profile-save-sending']) {
      await open('/account?scenario=' + scenario, 'Editar datos'); await click('Editar datos'); await type('Teléfono', '3312345678');
      await click('Guardar cambios'); await until(`document.body.innerText.includes(${JSON.stringify(scenario.endsWith('error') ? 'No se pudieron guardar tus cambios' : 'Guardando cambios…')})`);
      shots.push(await captureAccount(`account-${scenario}-375`));
      if (scenario.endsWith('error')) {
        assert.equal(await evaluate(`document.querySelector('input[aria-label="Teléfono"]').value`), '3312345678');
        await evaluate('window.recoverPreview()'); await click('Guardar cambios'); await until(`document.body.innerText.includes('Datos actualizados.')`);
        shots.push(await captureAccount('account-retry-save-375'));
      }
    }
    if (accountDesign) {
      for (const scenario of ['profile-loading', 'profile-error']) {
        await open('/account?scenario=' + scenario, scenario.endsWith('loading') ? 'Cargando tu cuenta…' : 'No pudimos cargar tu información');
        shots.push(await captureAccount(`account-${scenario}-375`));
        if (scenario.endsWith('error')) { await evaluate('window.recoverPreview()'); await click('Reintentar'); await until(`document.body.innerText.includes('Editar datos')`); shots.push(await captureAccount('account-profile-retry-375')); }
      }
      await open('/account?scenario=long&fontScale=1.5', 'Editar datos');
      await evaluate(`(()=>{for(const el of document.querySelectorAll('div,span')){if(el.childElementCount===0&&el.textContent.trim()){const css=getComputedStyle(el);el.style.fontSize=(parseFloat(css.fontSize)*1.5)+'px';el.style.lineHeight=(parseFloat(css.lineHeight)*1.5)+'px';}}})()`);
      shots.push(await captureAccount('account-large-text-375'));
      await evaluate(`document.querySelector('[aria-label="Cerrar sesión"]').scrollIntoView({block:'center'})`);
      shots.push(await captureAccount('account-large-text-actions-375'));
      await open('/account', 'Editar datos'); await click('Editar datos'); await type('Nombre completo', ' '); await type('Teléfono', '123');
      shots.push(await captureAccount('account-validation-375'));
    }
    assert.equal(exceptions.length, 0, JSON.stringify(exceptions)); assert.equal(requests.length, 0, JSON.stringify(requests));
    fs.writeFileSync(path.join(output, accountDesign ? 'account-design-result.json' : 'account-edit-result.json'), JSON.stringify({ shots, exceptions, missingAssets: requests }, null, 2));
    console.log(`PASS: ${shots.length} capturas auxiliares de edición de cuenta.`); return;
  }
  if (process.argv.includes('--reservations-only')) {
    for (const [width, height] of [[320, 844], [375, 812], [430, 932], [844, 390]]) {
      viewportWidth = width;
      await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      for (const [scenario, expected] of [['normal', 'Por recoger'], ['long', 'Por recoger'], ['reservation-history', 'Entrega confirmada']]) {
        await open('/reservations?scenario=' + scenario, expected);
        shots.push(await capture(`reservations-${scenario}-${width}`));
      }
    }
    viewportWidth = 375;
    await cdp('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    for (const [scenario, expected] of [['reservation-mixed', 'Por recoger'], ['reservation-loading', 'Mis reservas'], ['reservation-empty', 'Aún no tienes reservas'], ['reservation-error', 'No pudimos cargar'], ['reservation-pending', 'Plazo terminado; actualizando'], ['reservation-missing', 'Sin foto']]) {
      await open('/reservations?scenario=' + scenario, expected);
      shots.push(await capture(`reservations-${scenario}-375`));
      if (scenario === 'reservation-error') {
        await evaluate('window.recoverPreview()'); await click('Reintentar'); await until(`document.body.innerText.includes('Por recoger')`);
        shots.push(await capture('reservations-retry-375'));
      }
    }
    await open('/reservations', 'Por recoger');
    await click('Cancelar Torta de pollo · Unidad 1 de 2');
    await until(`document.body.innerText.includes('Sí, cancelar reserva')`);
    shots.push(await capture('reservations-cancel-confirm-375'));
    await click('Sí, cancelar reserva');
    await until(`document.body.innerText.includes('Cancelada')`);
    assert(await evaluate(`document.body.innerText.includes('Unidad 2 de 2') && document.querySelectorAll('[aria-label^="Cancelar Torta"]').length===1`), 'Cancelación afectó otra unidad');
    shots.push(await capture('reservations-cancel-result-375'));
    // Aumento de texto CSS auxiliar: no equivale a Dynamic Type nativo.
    await open('/reservations?scenario=long&fontScale=1.5', 'Por recoger');
    await evaluate(`(()=>{for(const el of document.querySelectorAll('div,span')){if(el.childElementCount===0&&el.textContent.trim()){const css=getComputedStyle(el);el.style.fontSize=(parseFloat(css.fontSize)*1.5)+'px';el.style.lineHeight=(parseFloat(css.lineHeight)*1.5)+'px';}}})()`);
    shots.push(await capture('reservations-large-text-375'));
    assert.equal(exceptions.length, 0, JSON.stringify(exceptions));
    assert.equal(requests.length, 0, 'Recursos ausentes: ' + JSON.stringify(requests));
    fs.writeFileSync(path.join(output, 'reservations-result.json'), JSON.stringify({ shots, exceptions, missingAssets: requests }, null, 2));
    console.log(`PASS: ${shots.length} capturas auxiliares de reservas. ${output}`);
    return;
  }
  for (const [width, height] of [[320, 844], [375, 812], [430, 932], [844, 390]]) {
    viewportWidth = width;
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (const [route, name] of [['/homePage?scenario=ganga', 'ganga-feed'], ['/publication/p1?scenario=ganga', 'ganga-detail'], ['/sales?scenario=ganga', 'ganga-sales']]) {
      await open(route, 'Ahorras $13');
      const comparison = await evaluate(`(()=>{const a=document.querySelector('[aria-label="Precio actual: $49"]'); const b=document.querySelector('[aria-label="Precio anterior: $62"]'); if(!a||!b)return null;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return {order:!!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING),strike:getComputedStyle(b).textDecorationLine,current:getComputedStyle(a).color,fit:ar.right<=innerWidth&&br.right<=innerWidth};})()`);
      assert(comparison?.order && comparison.strike.includes('line-through') && comparison.fit, 'Comparación incorrecta: ' + JSON.stringify(comparison));
      shots.push(await capture(name + '-' + width));
    }
  }
  viewportWidth = 390;
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
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
  await open('/reservations', 'Precio reservado'); shots.push(await capture('reservations'));
  await click('Cuenta','tab'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account-from-reservations'));
  await click('Reservas','tab'); await until(`document.body.innerText.includes('Precio reservado')`);
  await open('/reservations?scenario=expired', 'Vencida'); shots.push(await capture('reservations-expired'));
  await open('/sales', 'Reservas por entregar'); shots.push(await capture('sales'));
  assert(!(await evaluate(`document.body.innerText.includes('Cerrar sesión')`)), 'Cerrar sesión sigue dentro del listado de ventas');
  await click('Cuenta','tab'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account-from-sales'));
  await open('/account?scenario=profile-error', 'No pudimos cargar tu información'); shots.push(await capture('account-error'));
  await evaluate('window.recoverPreview()'); await click('Reintentar'); await until(`document.body.innerText.includes('ana@uabc.edu.mx')`); shots.push(await capture('account-retry'));
  await open('/account?scenario=profile-loading', 'Cargando tu cuenta…'); shots.push(await capture('account-loading'));
  await open('/sales?scenario=ganga', 'Ahorras $13'); shots.push(await capture('sales-ganga'));
  await open('/sales?scenario=finished', 'FINALIZADA'); shots.push(await capture('sales-finished'));
  await open('/sales?type=STATIC', 'Cálculo I'); shots.push(await capture('catalog-sales'));
  await open('/sales?type=STATIC&scenario=sold', 'VENDIDO'); shots.push(await capture('catalog-sold'));
  await open('/publication/edit', 'Nueva publicación'); shots.push(await capture('form-live'));
  await type('Precio', '85'); await click('Precio de oferta'); await click('Programada'); await type('Precio de oferta opcional', '65'); await type('Minutos antes del fin', '10'); shots.push(await capture('ganga-config'));
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
  assert(await evaluate(`(()=>{const r=document.activeElement.getBoundingClientRect();return r.top>=47 && r.bottom<760 && document.querySelector('textarea[aria-label="Descripción"]').value==='Descripción conservada al corregir el formulario';})()`), 'La recuperación no muestra el título o pierde la descripción');
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
    await open('/reservations?scenario=long', 'Precio reservado'); shots.push(await capture('reservations-photo-long-' + width));
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
