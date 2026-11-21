# 0037 — Verificación y convergencia

Estado: En verificación; técnico aprobado, recorrido nativo pendiente | Fecha: 2026-11-21

## Entorno y alcance ejecutado

Windows, Node v24.13.0; PostgreSQL/Redis Docker iniciados para las pruebas. Cada integración creó BD y BULLMQ_PREFIX exclusivos, migró/sembró solo esa BD y arrancó procesos Nest aislados. No se migró/sembró la base original ni se reinició su API. Ambas suites comparan inventario/hash original antes/después: idénticos. Plazo de producción fijo en 20 minutos; aceleración únicamente de timestamps de fixtures del verificador.

Artefactos: [summary.json](evidence/summary.json), [phase2.json](evidence/phase2.json), [phase3.json](evidence/phase3.json) y [offers-visual.json](evidence/offers-visual.json). Bundles en Frontend/.local/export-0037; summary registra hash de metadata. No se entregó APK ni se declara recorrido físico.

## Comandos reproducibles y resultados

Desde Backend:

- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: PASS. Antes reprodujo TS2339 en update-profile.spec.ts:62; después pasa sin any/cast/exclusión.
- `npm.cmd test -- --runInBand --runTestsByPath src/auth/update-profile.spec.ts`: 13 pruebas PASS.
- `npm.cmd test -- --runInBand`: 9 suites/39 pruebas PASS, incluidas 13 nuevas de contrato de ofertas.
- `npm.cmd run build` y `npm.cmd run lint`: PASS.
- `npm.cmd run test:phase2`: 257 solicitudes/10 grupos PASS. Ejecución .local/verification/tapcampus_phase2_1795300956192; igualdad/nulls en creación, públicos recortados, PATCH, autenticación, uploads, filtros y carrera de venta física.
- `npm.cmd run test:phase3`: 374 solicitudes/19 grupos PASS. Ejecución .local/verification/tapcampus_phase3_1795300956887; reservas/jobs/ofertas, tres grupos nuevos 0037, dos clientes Socket.io y hashes originales intactos.
- `npm.cmd run test:phase5-contracts`: PASS JWT/propiedad/mine y contacto autorizado de reserva.

Desde Frontend:

- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `npm.cmd test -- --watch=false`: 15 suites/112 pruebas PASS. Siete casos nuevos de formulario: igualdad, ambos cambios de modo, retirada/fallo conservando borrador, activa/legado y bloqueo de controles.
- `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir .local/export-0037 --max-workers 2`: PASS de ambos bundles.
- `node scripts/verify-redesign-ui.cjs --offers-only`: bundle auxiliar generado. La primera ejecución restringida agotó DevTools; `--offers-only --reuse-bundle` fuera de restricción pasó con 9 capturas a 320/390/430, cero excepciones y recursos ausentes. Muestras de error junto al precio, programada y Sin oferta inspeccionadas visualmente: sin recortes/solapamiento. No sustituye teclado/lector nativos.

Desde raíz: `node scripts/check-sdd.mjs` y `git diff --check`: PASS de estructura/referencias/whitespace.

## Matriz AC → T → EV

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-06 | EV-01: tipos completos antes/después; estrechamiento por sellerContact y aserción conservada; perfil 13/13 y suite 39/39 | Aprobado técnico |
| AC-02 | T-02, T-06 | EV-02: serializer por lista explícita, prueba con fila propia completa, GET público sin los tres campos, mine por actor, eventos/reservas sin configuración | Aprobado técnico |
| AC-03 | T-03, T-05, T-06 | EV-03: igualdad/mayor/cero rechazados sin filas/jobs, creación null inválida, PATCH DTO/HTTP y formulario con error junto al precio | Aprobado técnico |
| AC-04 | T-03, T-05, T-06 | EV-04: MANUAL↔SCHEDULED, null de minutos, tres nulls de retirada idempotente, null incoherente 400, ajeno 403/anónimo 401; borrador/foto y PATCH mínimo en Jest | Aprobado técnico |
| AC-05 | T-04, T-06 | EV-05: ambos órdenes y seis carreras HTTP retirada/activación/reserva; job viejo no actúa y retirada persiste tras reinicio real/conciliación | Aprobado PostgreSQL/Redis reales |
| AC-06 | T-03, T-04, T-06 | EV-06: reservas previas inmutables, activa 409 al reconfigurar pero título/stock editables; legado sin precio previo intacto y mínimo igual legado no activa | Aprobado técnico |
| AC-07 | T-02, T-05, T-06 | EV-07: HTTP/SQL/Socket.io, tipos públicos/propios, 112 pruebas, exports y 9 capturas auxiliares; recorrido comprador/vendedor en dispositivo sin ejecutar | Parcial: técnico aprobado; aceptación nativa pendiente |

## Incidencias de verificación resueltas

- Fase 2 esperaba cuatro migraciones pese a existir cinco: ahora compara con los directorios actuales. Sin alterar esquema/historial.
- Los ejecutores eliminaban PUBLIC_BASE_URL y dotenv del hijo recuperaba el origen LAN original. Ahora fijan el origen loopback de cada API aislada, conservando el test de origen personalizado.
- PATCH admite null solo en configuración y rechaza combinaciones incoherentes; no se amplió null a precio/stock mediante IsOptional global.
- El móvil conserva el ISO original si no cambia el horario visible: no pierde segundos/milisegundos ni reprograma accidentalmente al editar título/stock.

## Aceptación nativa y convergencia

`adb devices -l` no mostró dispositivos; no hay AVD configurados en el directorio estándar inspeccionado. No se instaló emulador ni se inventó prueba de iPhone. Falta recorrer ambos roles contra esta API en teléfono/emulador: publicación, modos/retirada, activación, reserva/precio/tiempo real y vuelta desde segundo plano, con teclado/texto ampliado/lector cuando corresponda. Registrar plataforma/versión y completar EV-07; T-06, TASKS 5.28 y aceptación global 5.1–5.6 permanecen abiertas.

Spec/plan/código/contratos convergen técnicamente. Sin migración nueva, sin cambiar precios reservados ni implementar filtro/consulta previa o el patrón completo 0034. El feature permanece En verificación, no Verificado completo.
