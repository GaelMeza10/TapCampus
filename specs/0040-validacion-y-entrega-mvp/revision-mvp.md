# Revisión del MVP — 2026-11-22

**Dictamen: núcleo funcional implementado y regresión técnica aprobada; MVP todavía sin cierre de aceptación y entrega.** No se detectaron fallos en las comprobaciones ejecutadas. Esto no certifica los recorridos nativos pendientes ni sustituye las puertas de docs07 y AC-01..07 de este expediente.

## EV-01 / EV-03 — Comprobación actual

Árbol de trabajo sin commit sobre c33c060, Windows, Node 24.13.0, PostgreSQL 16 y Redis locales. [Resumen de esta ejecución](evidence/mvp-audit.json), [fase2](evidence/mvp-phase2.json) y [fase3](evidence/mvp-phase3.json). Se revisaron requisitos, tareas, trazabilidad, contratos y evidencia de 0034/0037..0039/0041..0046. No se modificó código funcional durante esta revisión.

| Área obligatoria | Implementación / evidencia relevante | Resultado y límite |
| --- | --- | --- |
| RF-01/02: acceso y perfil | Auth/usuarios; fase2, pruebas de cuenta y registro de 0045 | PASS técnico. Nombres de espacios rechazados antes de persistir; INC-0040-01 cerrado técnicamente en 0045. |
| RF-03/04/05/05b/06: LIVE y STATIC | Publicaciones, uploads, PATCH, cierre, venta física y vendido; fase2/3 y 0042 | PASS técnico; propiedad, horarios, stock y condición de artículo cubiertos. Cámara/galería y selector iOS requieren aceptación nativa. |
| RF-05c: búsqueda y filtros | Catálogos y filtros AND fase2; UI 0041/0043 | PASS técnico; doce categorías y cinco zonas. |
| RF-07/08/09/10 y RNF-01 | Reservas/jobs fase3 | PASS técnico con PostgreSQL real: 50 compradores por última pieza, 1 éxito/49 conflictos; 50 reintentos de una clave, una reserva; permisos, carreras, plazo, entrega/cancelación y expiración. |
| RF-11/12: ofertas | Publicaciones/jobs fase3 y 0037 | PASS técnico: privacidad, activación manual/programada, retirada, carreras, reinicio y precio reservado inmutable. |
| RF-13: WhatsApp | Contactos/privacidad fase2/3, pruebas de URL/error y 0039 | PASS técnico. Apertura y regreso desde WhatsApp en teléfono pendientes. |
| RF-15: filtro de contenido | Política/DTO y HTTP fase2; recuperación de formulario 0034/0045 | PASS técnico; rechazos sin cambios y conservación del borrador/foto. |
| RNF-02: tiempo real | Socket.io fase3 y useMarketplaceSync | PASS con dos clientes, eventos tras commit y recarga al reconectar; sesiones móviles pendientes. |
| RNF-03: restricciones y experiencia móvil | Sin GPS/pagos; guía de diseño, 0044/0045 | Evidencia técnica/auxiliar disponible; desplazamiento vertical, glass, teclado, permisos y accesibilidad necesitan aceptación física. |

Comandos nuevos, desde Backend:

```powershell
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=.local/mvp-audit-backend.json
npm run build
node node_modules/typescript/bin/tsc --noEmit
npm run lint
node scripts/verify-phase2.mjs
node scripts/verify-phase3.mjs
```

Desde Frontend: `node node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=../Backend/.local/mvp-audit-frontend.json` y `node node_modules/typescript/bin/tsc --noEmit`. Desde raíz: `node scripts/check-sdd.mjs` y `git -c core.safecrlf=false diff --check`.

Resultados nuevos: **114 pruebas backend/13 suites + 178 frontend/22 suites = 292 PASS**, tipos de ambas capas, build/lint backend y comprobador documental PASS. **674 solicitudes HTTP** (288 fase2 + 386 fase3), 32 grupos de comprobación PASS, carreras SQL, workers detenidos/reiniciados y dos clientes Socket.io reales. Ambas ejecuciones comparan hashes/recuentos de la BD configurada antes/después y confirman que sus datos se conservan. Usan bases aisladas y prefijo Redis propio; no migran ni siembran la base original.

El texto histórico del primer grupo de fase2 dice «5/8»; la aserción vigente de catálogos comprueba **5 zonas/12 categorías**, con seis categorías por tipo. No se interpreta ese rótulo como un recuento actual.

[Limpieza del ensayo](evidence/mvp-teardown.json): después de conservar la evidencia se retiraron únicamente las dos bases temporales creadas por esta revisión y 145 claves de su prefijo Redis exclusivo. Se validaron los nombres y su diferencia respecto de la base configurada; no se utilizó FLUSHDB ni se eliminaron datos de la aplicación.

No se repitieron los [61 casos UI auxiliares ni exports de 0045](../0045-errores-y-datos-adversos/verification.md), ni la [carga local/limpieza de 0046](../0046-seed-entrega-y-limpieza/verification.md). Se referencian con su fecha y alcance: esta revisión no cambia pantallas y los tipos actuales pasan tras retirar assets sin referencias. El expediente de aceptación debe fijar además la versión final distribuida; los exports anteriores no son un instalable probado.

## Puertas que impiden declarar el cierre

| Puerta | Trabajo pendiente / evidencia exigida |
| --- | --- |
| AC-01 / T-01 | Consolidar la versión exacta de entrega y sus artefactos móviles. Regresión actual aprobada; no se certificó una distribución final. |
| AC-02 / T-02, T-08 | Recorrido integrado de comprador/vendedor en teléfonos con API real: foto, permisos, teclado, accesibilidad, contacto y recuperación. Confirmar selector iOS INC-0040-02 y corrección del contenido desplazado de 0044; ambos tienen cambios y pruebas, sin aceptación física registrada. |
| AC-03 / T-03 | Completar espera real de 20 minutos, recuperación y sesiones móviles. Reinicio del proceso/Redis, carreras y dos clientes están aprobados técnicamente; el ensayo acelera vencimientos y no equivale a esa espera real. |
| AC-04 / T-04 | HTTPS accesible fuera de la red local; API, PostgreSQL, Redis e imágenes persistentes, reinicio, respaldo y recuperación. Sin evidencia de despliegue final registrada. |
| AC-05 / T-05 | Generar e instalar desde cero APK o artefacto correspondiente; guardar versión/hash y completar un recorrido contra el entorno de entrega. No se encontró artefacto de distribución ni perfil eas.json en el repositorio inspeccionado. |
| AC-06/07 / T-06 | Usabilidad con cinco estudiantes y piloto de una semana con tres vendedores/quince compradores, con tiempos e incidentes reales. Sin resultados registrados. |

La moderación RF-14 es **SHOULD** y no bloquea el MVP obligatorio. GPS, pagos, reputación y push no forman parte de este cierre. Ninguna casilla global de aceptación se marca por estas pruebas automáticas. T-07 continúa hasta cerrar las puertas restantes.
