# 0045 — Verificación

Estado: Verificado (técnico y revisión auxiliar) | Fecha: 2026-11-22

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02 | EV-01: auth y nueve HTTP de registro | PASS técnico/auxiliar |
| AC-02 | T-01, T-02 | EV-02: matriz de mensajes, errores incompletos/HTTP | PASS |
| AC-03 | T-03 | EV-03: avisos fuera del scroll, borrador y fallo parcial | PASS técnico/auxiliar |
| AC-04 | T-04 | EV-04: 61 recorridos y capturas; permisos en Jest | PASS auxiliar; límites físicos explícitos |
| AC-05 | T-05 | EV-05: 289 pruebas, tipos/build/lint/exports/check-sdd | PASS |

## Entorno y reproducción

Windows, Node 24.13.0, Expo SDK 58, tema claro. Chrome headless ejecutado fuera del sandbox con autorización. UI real montada por scripts/visual-fixture.tsx con adaptador Axios aislado: fault selecciona errores por método/ruta y recoverPreview restaura lecturas. Solicitudes de QA registran solo método/ruta; sin contraseñas, mensajes externos ni modificaciones a la BD original. Los errores de fixture incluyen config para conservar el comportamiento del interceptor 401 público/privado.

Desde Frontend:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=.local/adverse-tests.json
node scripts/verify-redesign-ui.cjs --adverse-only
node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/export-0045 --max-workers 2
```

Desde Backend:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=.local/adverse-tests.json
npm.cmd run build
npm.cmd run lint
```

Desde raíz: `node scripts/check-sdd.mjs`. [Resumen de pruebas antes/después](evidence/tests-summary.json), [matriz de casos](evidence/cases.md), [resultado UI](evidence/ui-cases.json), [exportaciones](evidence/export-metadata.json). Se conservan 22 capturas seleccionadas en evidence/; el verificador regenera las 61 en Frontend/.local/visual/.

## EV-01 — Acceso y registro

Antes: 4/9 pruebas HTTP nuevas fallaron y reprodujeron INC-0040-01 y falta de normalización. Después: nueve HTTP aprobados con Nest/ValidationPipe reales y AuthService aislado. Espacios, tabulaciones, NBSP, vacío, null y número reciben 400 sin invocar registrar; nombre normalizado, 200 letras acentuadas y nombre CJK reciben 201 con payload correcto. No se añaden topes arbitrarios ni se toca persistencia real.

UI E01..10/E40: correo inválido, contraseña vacía/corta, teléfono de otro país, nombre con espacios, duplicado, offline, timeout, 401/429/500; valores conservados. Editar otro campo no borra el error atribuido; mensajes generales persisten. Registro con campos vacíos conserva habilitación previa y muestra ayuda al introducir nombre solo de espacios. Jest verifica bloqueo de doble envío y sesión privada/pública existentes.

## EV-02 — Mensajes

Antes: 10/12 pruebas nuevas frontend fallaron: null/undefined lanzaban excepción, arreglo vacío producía mensaje vacío, respuestas técnicas se filtraban y login confundía offline con credenciales o borraba error al cambiar otro campo. Ahora pasan todas. error-messages.ts se comparte entre auth y marketplace: tiempo agotado, conexión, sesión, permisos, 404, conflicto, 429 y servidor; conserva mensajes españoles de negocio y vocabulario Oferta. auth 401 mantiene «Correo o contraseña incorrectos»; los demás fallos no se atribuyen a la contraseña.

## EV-03 — Visibilidad y recuperación

E18..28/E33/E44/E46 comprueban errores de guardar perfil/publicación, venta física, oferta, entrega, marcar vendido, finalizar, cancelar, apartado y WhatsApp. ErrorNotice queda fuera de la lista, no desaparece al desplazarse y limita su altura al 30% con lectura propia. Reintentar vuelve a consultar; no repite automáticamente mutaciones. Se comprueba una única solicitud de acción fallida, ausencia de éxito falso y datos confirmados conservados.

Detalle distingue desconexión de 404. E46 reproduce el caso producto disponible/consulta de reservas fallida: conserva producto y CTA, avisa que no pudo actualizar reservas y no afirma vacío confirmado. El reintento recupera unidades. Prueba Jest específica, además de regresión de cancelaciones y ventas fallidas.

Cuenta y publicación conservan borrador; error general no desaparece al cambiar texto. Foto conserva selección/URL después de fallar upload/guardado; excepción de selector usa mensaje comprensible. Los rechazos de palabras señalan el campo y conservan foto/textos.

## EV-04 — Pasada integral

61/61 casos UI y 61 capturas; cero excepciones JavaScript y recursos ausentes. [Lista completa](evidence/cases.md). Cobertura:

- E01..10: acceso/registro con datos inválidos y HTTP/red.
- E11..18: explorar, búsqueda con símbolos/CJK, filtros, cargas y edición de cuenta.
- E19..24: cinco acciones de vendedor y cancelación, avisos visibles.
- E25..28: detalle offline/404, conflicto de apartado y fallo de WhatsApp sin reservar.
- E29..35: LIVE/STATIC vacíos, precio negativo/exponente/decimales, stock fraccionario, contenido bloqueado, fallo de guardado y catálogos caídos.
- E36..39: plazo vencido pendiente de servidor, listas vacías y foto corrupta.
- E40..46: registro offline, precio sobre 99999999.99, oferta igual al normal, 403, aviso largo acotado, texto ampliado 1.5 y fallo parcial de reservas.
- L-*: títulos/nombres de 200 caracteres sin espacios, descripción extensa con Unicode/símbolos y precio máximo en explorar/ventas/reservas/cuenta/detalle a 320/390/430. Sin desbordamiento horizontal.

Jest añade cuatro casos de cámara/galería: galería denegada, archivo >5 MiB, MIME PDF y excepción técnica con recuperación; la prueba previa conserva cámara denegada. Son permisos simulados, no prueba de diálogo del sistema operativo. Las capturas se revisaron en lotes, incluidos errores numéricos, registro, avisos fijos/largos, fallo parcial y texto ampliado; PASS auxiliar según DESIGN.md e Impeccable harden.

## EV-05 — Regresión y convergencia

Frontend: 178/178 pruebas en 22 suites. Backend: 111/111 en 12 suites; total 289. Tipos de ambas capas, build/lint backend y exports Android/iOS aprobados. Metadata y logs preservados en evidence/. check-sdd y diff sin errores de whitespace.

Se actualizan requisitos (nombre útil), flujo de recuperación, guía visual, validación, auditoría, trazabilidad, TASKS e índice; cierre técnico de INC-0040-01 enlazado desde el informe histórico sin reescribir sus fallos. AC-01..05 tienen T y EV; no quedan defectos conocidos dentro de esta pasada técnica/auxiliar.

## Límites

Esta evidencia no acredita modo avión físico, corte real de red durante mutación, permisos revocados desde ajustes, teclado/VoiceOver/TalkBack, Dynamic Type nativo ni comportamiento iOS/Android en hardware. Los errores de red/API se inducen con el adaptador de pruebas y los permisos con Jest. No se cierra 0040 ni UAT/despliegue/instalable. Las pruebas de 50 compradores y reinicio real conservan su evidencia anterior; no se repitieron porque no cambian stock/plazo/colas. No se incorporan datos de QA al backend original.
