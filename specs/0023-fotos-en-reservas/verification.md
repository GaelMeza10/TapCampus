# 0023 — Verificación

Estado: Verificado técnico y visual auxiliar | Fecha: 2026-11-06

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-03 | EV-01 | PASS: contrato aditivo, relación real y acceso ajeno rechazado |
| AC-02 | T-02, T-03 | EV-02 | PASS: foto/fallo/acciones y capturas a tres anchos |
| AC-03 | T-02, T-03 | EV-03 | PASS: URLs, compatibilidad, comandos y límites documentados |

## EV-01 — Backend y datos existentes

`reservations.service.spec.ts` verifica que mine selecciona la foto de la relación sin filtrar por visibilidad pública, incluso con estado FINISHED/stock cero; conserva precio, filtra por comprador, no añade buyerContact al comprador y rechaza detalle ajeno. Foto ausente → null. El serializador central cubre creación/reintento, consultas y resolución.

API reconstruida y reiniciada únicamente para servir el campo nuevo; Expo y DB/Redis conservados. [Prueba de solo lectura](evidence/real-smoke.json): consulta Prisma y serializer reales sobre un comprador con reserva existente, 1/1 con foto; descarga PNG HTTP 200, acceso anónimo a /reservations/mine →401. No fue una llamada HTTP autenticada de mine: se indica expresamente el método. No se crearon/cancelaron reservas ni se cambió inventario, schema o seed.

## EV-02 — Interfaz y regresión

ReservationCard de comprador muestra foto 80×80 y título/unidad/precio flexible, con estado, plazo y acciones debajo; rama compacta del vendedor intacta. PublicationPhoto compartido mantiene dimensiones, alternativa accesible y «Sin foto». Sin solicitudes adicionales al detalle público. `reservations.test.tsx` verifica foto, fallo y conservación de precio/WhatsApp/cancelación; pruebas existentes conservan unidades y los cuatro estados.

40 capturas del fixture real a 320/390/430, sin desbordamiento horizontal, controles fuera de ancho, recursos faltantes o excepciones. Revisadas [reservas](evidence/reservations.png), [vencidas](evidence/reservations-expired.png), [título largo 320](evidence/reservations-photo-long-320.png) y [430](evidence/reservations-photo-long-430.png). [Resultado completo](evidence/visual-result.json). Son capturas web auxiliares, no nativas. El servidor y Chrome del fixture se cerraron; servicios de la app quedan activos.

## EV-03 — Cliente y comandos

`marketplace-contracts.test.tsx` comprueba origen actual para URLs antiguas y relativas en listados/acciones de reserva, y compatibilidad con campo ausente/null. Se reutiliza la normalización de publicaciones; imágenes externas se conservan cuando no corresponden a uploads locales.

- Frontend: `npm.cmd test -- --silent --json --outputFile=.local/reservation-photos-0023-tests.json` → 12 suites, 56 pruebas PASS; [resultados](evidence/tests.json). Ajustada la expectativa del test a la representación real de Expo Image (source array); código funcional sin cambio por esa corrección.
- Frontend: `node node_modules/typescript/bin/tsc --noEmit` → PASS.
- Backend: `npm.cmd run build`, `npm.cmd test -- --runInBand --silent` (6 suites/10 pruebas), `npm.cmd run lint` y `node scripts/verify-phase5-contracts.cjs` → PASS.
- `node scripts/verify-redesign-ui.cjs` → PASS, 40 capturas.
- Frontend: `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/reservation-photos-0023-native --max-workers 2` → PASS, bundles Hermes y 46 activos; [metadata](evidence/native-metadata.json). No equivale a instalar APK/IPA.
- Raíz: `node scripts/check-sdd.mjs` y `git diff --check` → PASS tras convergencia final. Revisado diff de serializer, normalización y tarjeta; sin cambios ajenos revertidos. Avisos de Git solo por LF/CRLF.

## Convergencia y límites

RF-07, contrato docs03, UI docs04, flujo docs05 y referencia 0001 alineados. Sin dependencias ni migraciones. La foto es actual, no histórica. No hay confirmación del usuario de la foto en iPhone todavía; su confirmación anterior corresponde solo al modal 0022. No se cierran 5.1–5.6 ni la aceptación de accesibilidad nativa de 0022. Cambios y archivos anteriores preservados, sin commit.
