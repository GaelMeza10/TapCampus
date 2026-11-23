// Recorridos de error en las pantallas reales, usando exclusivamente el adaptador de fixture.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

module.exports = async function ({ open, click, type, capture, evaluate, until, cdp, output, setWidth, exceptions, requests }) {
  const cases = [], shots = [];
  const faultRoute = (route, key, fault) => route + (route.includes('?') ? '&' : '?') + 'fault=' + encodeURIComponent(JSON.stringify({ [key]: fault }));
  const text = async phrase => { await until(`document.body.innerText.includes(${JSON.stringify(phrase)})`); };
  const value = label => evaluate(`document.querySelector('[aria-label="${label}"]').value`);
  const reveal = label => evaluate(`document.querySelector('[aria-label="${label}"]')?.scrollIntoView({block:'center'})`);
  const shot = async id => shots.push(await capture('adverse-' + id));
  const recover = () => evaluate('window.recoverPreview()');
  const setFault = (key, fault) => evaluate(`window.adversePreview.failures[${JSON.stringify(key)}]=${JSON.stringify(fault)}`);
  const noticeVisible = async () => {
    assert(await evaluate(`(()=>{const e=document.querySelector('[data-testid="persistent-error"]');if(!e)return false;const r=e.getBoundingClientRect();return r.height>=40&&r.top>=0&&r.bottom<innerHeight})()`), 'Error fuera del viewport');
  };
  async function check(id, name, action) {
    try { await action(); cases.push({ id, name, result:'PASS' }); console.log('PASS '+id+' '+name); }
    catch(error) { cases.push({ id, name, result:'FAIL', error:error.message }); console.log('FAIL '+id+' '+name+': '+error.message.slice(0,250)); try { await shot(id+'-failure'); } catch {} }
  }
  async function loginValues() { await type('Correo institucional','ana@uabc.edu.mx'); await type('Contraseña','password123'); }
  async function registerValues() {
    await type('Nombre completo','Ana Pérez'); await type('Correo institucional','ana@uabc.edu.mx'); await type('Teléfono','6641234567'); await type('Contraseña','password123'); await click('', 'checkbox');
  }
  await check('E01','Acceso: correo inválido conserva error al editar otro campo',async()=>{
    await open('/login','Bienvenido de nuevo'); await type('Correo institucional','ana@gmail.com'); await click('Iniciar sesión'); await text('Ingresa tu correo');
    await type('Contraseña','password123'); await text('Ingresa tu correo'); await shot('login-invalid');
  });
  await check('E02','Acceso: contraseña vacía junto al campo',async()=>{
    await open('/login','Bienvenido de nuevo'); await type('Correo institucional','ana@uabc.edu.mx'); await click('Iniciar sesión'); await text('La contraseña es obligatoria'); await shot('login-password');
  });
  for(const [id,fault,expected] of [['E03',{code:'ERR_NETWORK'},'Revisa tu conexión'],['E04',{code:'ECONNABORTED'},'tardó demasiado'],['E05',{status:500},'El servidor no está disponible'],['E06',{status:401,message:'Unauthorized'},'Correo o contraseña incorrectos.'],['E07',{status:429,message:'Too Many Requests'},'Hay demasiados intentos']])
    await check(id,'Acceso: '+expected,async()=>{
      await open(faultRoute('/login','POST /auth/login',fault),'Bienvenido de nuevo'); await loginValues(); await click('Iniciar sesión'); await text(expected);
      assert.equal(await value('Correo institucional'),'ana@uabc.edu.mx'); await type('Contraseña','otro-intento'); await text(expected); await shot('login-'+id);
    });
  await check('E08','Registro: nombre de espacios no envía y tiene ayuda',async()=>{
    await open('/register','Crea tu cuenta'); await registerValues(); await type('Nombre completo','   '); await text('Escribe tu nombre completo.');
    assert.equal(await evaluate(`window.adversePreview.requests.filter(r=>r.path==='/auth/register').length`),0); await reveal('Nombre completo'); await shot('register-spaces');
  });
  await check('E09','Registro: dominio, teléfono y contraseña inválidos',async()=>{
    await open('/register','Crea tu cuenta'); await registerValues(); await type('Correo institucional','ana@gmail.com'); await type('Teléfono','+15512345678'); await type('Contraseña','123');
    await click('Crear cuenta'); await text('Ingresa tu correo'); await type('Correo institucional','ana@uabc.edu.mx'); await click('Crear cuenta'); await text('diez dígitos');
    await type('Teléfono','6641234567'); await click('Crear cuenta'); await text('al menos 8 caracteres'); await reveal('Contraseña'); await shot('register-validation');
  });
  await check('E10','Registro: duplicado sin perder datos',async()=>{
    await open(faultRoute('/register','POST /auth/register',{status:409,message:'Ya existe una cuenta con ese correo'}),'Crea tu cuenta'); await registerValues(); await click('Crear cuenta'); await text('Ya existe una cuenta');
    assert.equal(await value('Nombre completo'),'Ana Pérez'); await reveal('Crear cuenta'); await shot('register-duplicate');
  });
  await check('E11','Explorar: offline y recuperación',async()=>{
    await open(faultRoute('/homePage','GET /publications',{code:'ERR_NETWORK'}),'No se pudieron cargar'); await shot('feed-offline'); await recover(); await click('Reintentar'); await text('Torta de pollo');
  });
  await check('E12','Explorar: búsqueda sin resultados con símbolos',async()=>{
    await open('/homePage','Torta de pollo'); await type('Buscar productos','<sin resultados> 漢字 &'); await text('No encontramos publicaciones'); await shot('search-empty'); await click('Limpiar búsqueda'); await text('Torta de pollo');
  });
  await check('E13','Filtros: conteos fallidos no inventan ceros',async()=>{
    await open(faultRoute('/homePage','GET /publications',{status:500}),'No se pudieron cargar'); await click('Filtros.'); await text('No pudimos actualizar los conteos'); await shot('filter-error'); await recover(); await click('Reintentar'); await text('Ver 3 publicaciones');
  });
  for(const [id,route,expected,key] of [['E14','/sales','No pudimos cargar tus ventas','GET /publications/mine'],['E15','/reservations','No pudimos cargar tus reservas','GET /reservations/mine'],['E16','/account','No pudimos cargar tu información','GET /auth/me']])
    await check(id,'Carga fallida y recuperación: '+route,async()=>{
      await open(faultRoute(route,key,{status:500}),expected); await shot('load-'+id); await recover(); await click('Reintentar'); await text(route==='/account'?'ana@uabc.edu.mx':'Torta de pollo');
    });
  await check('E17','Cuenta: nombre y teléfono inválidos junto al campo',async()=>{
    await open('/account','ana@uabc.edu.mx'); await click('Editar datos'); await type('Nombre completo','   '); await type('Teléfono','+15551234567'); await text('Escribe tu nombre completo'); await text('diez dígitos'); await shot('account-invalid');
  });
  await check('E18','Cuenta: fallo de guardado conserva borrador y error al editar',async()=>{
    await open(faultRoute('/account','PATCH /auth/me',{status:500}),'ana@uabc.edu.mx'); await click('Editar datos'); await type('Nombre completo','Ana María de prueba'); await click('Guardar cambios'); await text('No se pudieron guardar');
    await type('Nombre completo','Ana María corregida'); await text('No se pudieron guardar'); await reveal('Guardar cambios'); await shot('profile-save'); await recover(); await click('Guardar cambios'); await text('Datos actualizados.');
  });
  for(const [id,key,button,confirm] of [
    ['E19','POST /publications/p1/physical-sale','−1 venta física','Registrar venta física'],
    ['E20','PATCH /publications/p1/ganga','Activar oferta','Activar oferta'],
    ['E21','POST /reservations/r1/complete','Confirmar entrega de Torta de pollo · Unidad 1','Confirmar entrega'],
    ['E22','POST /publications/book/sold','Marcar vendido','Marcar vendido'],
    ['E23','POST /publications/p1/finish','Finalizar','Finalizar publicación']
  ]) await check(id,'Ventas: acción fallida visible y sin éxito falso',async()=>{
    await open(faultRoute('/sales'+(id==='E22'?'?type=STATIC':''),key,{status:409,message:'La acción ya no está disponible. Actualiza los datos.'}),id==='E22'?'Marcar vendido':'Reservas por entregar');
    await click(button); await click(confirm); await text('La acción ya no está disponible.'); await noticeVisible(); await shot('sale-'+id);
    assert.equal(await evaluate(`window.adversePreview.requests.filter(r=>r.method+' '+r.path===${JSON.stringify(key)}).length`),1);
  });
  await check('E24','Reservas: cancelación fallida permanece visible abajo',async()=>{
    await open(faultRoute('/reservations','POST /reservations/r2/cancel',{status:500}),'Mis reservas'); await click('Cancelar Torta de pollo · Unidad 2'); await click('Sí, cancelar reserva'); await text('El servidor no está disponible'); await noticeVisible(); await shot('cancel-error');
    assert.equal(await evaluate(`window.adversePreview.requests.filter(r=>r.path==='/reservations/r2/cancel').length`),1);
  });
  await check('E25','Detalle: offline muestra carga fallida y no publicación eliminada',async()=>{
    await open(faultRoute('/publication/p1','GET /publications/p1',{code:'ERR_NETWORK'}),'No pudimos cargar la publicación');
    assert(!await evaluate(`document.body.innerText.includes('Publicación no disponible')`)); await shot('detail-offline'); await recover(); await click('Reintentar'); await text('Apartar una unidad');
  });
  await check('E26','Detalle: 404 confirmado conserva acceso a reservas',async()=>{
    await open(faultRoute('/publication/p1','GET /publications/p1',{status:404,message:'Publicación no disponible'}),'Publicación no disponible'); await text('Ver mis reservas'); await shot('detail-404');
  });
  await check('E27','Apartado: conflicto 409 sin confirmar éxito',async()=>{
    await open(faultRoute('/publication/p1','POST /reservations',{status:409,message:'Ya no hay unidades disponibles.'}),'Apartar una unidad'); await click('Apartar una unidad'); await click('Sí, apartar'); await text('Ya no hay unidades disponibles.');
    assert(!await evaluate(`document.body.innerText.includes('Reserva confirmada')`)); await shot('reserve-conflict');
  });
  await check('E28','WhatsApp: fallo visible sin reservar',async()=>{
    await open('/publication/book','Contactar por WhatsApp'); await evaluate('window.contactPreview.fail=true'); await click('Contactar por WhatsApp'); await text('No se pudo abrir WhatsApp'); await noticeVisible(); await shot('contact-failure');
    assert.equal(await evaluate(`window.adversePreview.requests.filter(r=>r.method==='POST'&&r.path==='/reservations').length`),0);
  });
  for(const [id,typeName,title] of [['E29','LIVE','Publicar'],['E30','STATIC','Publicar producto']]) await check(id,'Crear '+typeName+' vacío aplica errores correctos',async()=>{
    await open('/publication/edit?type='+typeName,title); await click(title); await text('Revisa los campos señalados'); await text('Añade una foto'); await shot('empty-'+typeName);
    if(typeName==='STATIC') assert(!await evaluate(`!!document.querySelector('[aria-label="Stock disponible"]')`));
  });
  await check('E31','Formulario: precio/stock inválidos y corrección sin pérdida',async()=>{
    await open('/publication/edit?id=p1','Editar publicación'); await type('Precio','-1'); await type('Stock disponible','1.5'); await click('Guardar cambios'); await text('El precio debe ser positivo'); await text('El stock debe ser un entero'); await shot('numeric-invalid');
    await type('Precio','1e3'); await text('El precio debe ser positivo'); await type('Precio','0.001'); await text('El precio debe ser positivo'); assert.equal(await value('Título'),'Torta de pollo');
  });
  await check('E32','Formulario: rechazo por contenido y borrador preservado',async()=>{
    await open('/publication/edit?id=p1&scenario=form-content','Editar publicación'); await type('Título','Texto de prueba bloqueado'); await click('Guardar cambios'); await text('Se detectó una palabra ofensiva'); assert.equal(await value('Título'),'Texto de prueba bloqueado'); await shot('content-rejected');
  });
  await check('E33','Formulario: fallo de guardado conserva foto y borrador',async()=>{
    await open(faultRoute('/publication/edit?id=p1','PATCH /publications/p1',{status:500}),'Editar publicación'); await type('Título','Borrador sin perder'); await click('Guardar cambios'); await text('El servidor no está disponible');
    await type('Descripción','Descripción corregida'); await text('El servidor no está disponible'); assert.equal(await value('Título'),'Borrador sin perder'); assert(await evaluate(`!!document.querySelector('[data-testid="selected-publication-image"]')`)); await shot('publication-save-error');
  });
  for(const [id,field,key] of [['E34','zona','GET /zones'],['E35','categoría','GET /categories']]) await check(id,'Formulario: catálogo fallido '+field+' y reintento',async()=>{
    await open(faultRoute('/publication/edit?type=LIVE',key,{status:500}),'Ahora en el campus'); await type('Título','Borrador con catálogo caído'); await click('Seleccionar '+field); await text('No pudimos cargar las opciones'); await shot('catalog-'+id);
    await recover(); await click('Reintentar'); await until(`!!document.querySelector('[role="radio"]')`); assert.equal(await value('Título'),'Borrador con catálogo caído');
  });
  for(const [id,scenario,expected] of [['E36','reservation-pending','Plazo terminado'],['E37','reservation-empty','Aún no tienes reservas'],['E38','sales-empty','Aún no tienes publicaciones']]) await check(id,'Estado no feliz: '+scenario,async()=>{
    await open((scenario==='sales-empty'?'/sales':'/reservations')+'?scenario='+scenario,expected); await shot(scenario);
  });
  for(const width of [320,390,430]) {
    setWidth(width); await cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    for(const [route,expected,name] of [['/homePage?scenario=adverse-long','Campus Ensenada','feed'],['/sales?scenario=adverse-long','Reservas por entregar','sales'],['/reservations?scenario=adverse-long','Mis reservas','reservations'],['/account?scenario=adverse-long','ana@uabc.edu.mx','account'],['/publication/p1?scenario=adverse-long','Apartar una unidad','detail']])
      await check('L-'+name+'-'+width,'Texto de 200 caracteres y precio máximo',async()=>{await open(route,expected); await shot('long-'+name+'-'+width);});
  }
  setWidth(390); await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await check('E39','Imagen corrupta usa alternativa sin errores JavaScript',async()=>{ await open('/publication/p1?scenario=broken-photo','Apartar una unidad'); await text('Sin foto'); await shot('broken-photo'); });
  await check('E40','Registro offline conserva datos y explica conexión',async()=>{
    await open(faultRoute('/register','POST /auth/register',{code:'ERR_NETWORK'}),'Crea tu cuenta'); await registerValues(); await click('Crear cuenta'); await text('Revisa tu conexión');
    assert.equal(await value('Teléfono'),'6641234567'); await reveal('Crear cuenta'); await shot('register-offline');
  });
  await check('E41','Precio superior al máximo muestra error local sin enviar',async()=>{
    await open('/publication/edit?id=p1','Editar publicación'); await type('Precio','100000000'); await click('Guardar cambios'); await text('El precio debe ser positivo');
    assert.equal(await evaluate(`window.adversePreview.requests.filter(r=>r.method==='PATCH').length`),0); await shot('price-overflow');
  });
  await check('E42','Oferta igual al precio normal se rechaza en su hoja',async()=>{
    await open('/publication/edit?id=p1','Editar publicación'); await click('Precio de oferta'); await type('Precio de oferta opcional','85'); await click('Guardar configuración');
    await text('El precio mínimo debe ser positivo y menor'); await shot('offer-invalid');
  });
  await check('E43','Permiso HTTP 403 se explica sin texto técnico',async()=>{
    await open(faultRoute('/publication/book','GET /publications/book',{status:403,message:'Forbidden'}),'No pudimos cargar la publicación'); await text('No tienes permiso'); await shot('forbidden');
  });
  await check('E44','Mensaje largo de negocio conserva altura acotada y lectura propia',async()=>{
    await open(faultRoute('/sales','POST /publications/p1/physical-sale',{status:409,message:'Acción rechazada. '+ 'Revisa la disponibilidad del producto. '.repeat(40)}),'Reservas por entregar');
    await click('−1 venta física'); await click('Registrar venta física'); await text('Acción rechazada.'); await noticeVisible();
    assert(await evaluate(`document.querySelector('[data-testid="persistent-error"]').getBoundingClientRect().height<=innerHeight*.3`)); await shot('long-error');
  });
  await check('E45','Errores con texto ampliado permanecen visibles y legibles',async()=>{
    await open('/publication/edit?type=LIVE&fontScale=1.5','Ahora en el campus');
    await evaluate(`document.querySelectorAll('[dir=auto]').forEach(el=>{const c=getComputedStyle(el);el.style.fontSize=parseFloat(c.fontSize)*1.5+'px';el.style.lineHeight=parseFloat(c.lineHeight)*1.5+'px';})`);
    await click('Publicar'); await text('Revisa los campos señalados');
    assert(await evaluate(`(()=>{const r=document.querySelector('[data-testid="publication-form-notice"]').getBoundingClientRect();return r.height>=40&&r.top>=0&&r.bottom<=innerHeight})()`)); await shot('errors-large');
  });
  await check('E46','Carga parcial de reservas no inventa que están vacías',async()=>{
    await open(faultRoute('/publication/p1','GET /reservations/mine',{status:500}),'No pudimos actualizar tus reservas.');
    assert(!await evaluate(`document.body.innerText.includes('Todavía no tienes reservas.')`));
    await text('Apartar una unidad'); await noticeVisible(); await shot('partial-reservations');
    await recover(); await click('Reintentar'); await text('Unidad 1 de 2');
  });
  const result={cases,shots:shots.map(s=>({name:s.name,width:s.width,height:s.height,scrollWidth:s.scrollWidth})),passed:cases.filter(c=>c.result==='PASS').length,failed:cases.filter(c=>c.result==='FAIL').length,runtimeErrors:exceptions,missingAssets:requests};
  fs.writeFileSync(path.join(output,'adverse-result.json'),JSON.stringify(result,null,2));
  console.log(`RESULTADO: ${result.passed} PASS / ${result.failed} FAIL, ${shots.length} capturas`);
  assert.equal(result.failed,0,JSON.stringify(cases.filter(c=>c.result==='FAIL')));
  assert.deepEqual(exceptions,[],'Excepciones de JavaScript'); assert.deepEqual(requests,[],'Recursos ausentes');
};
