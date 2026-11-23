# 0046 — Verificación

Estado: Verificado (técnico y carga local) | Fecha: 2026-11-22

| AC | Tareas | EV | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 | EV-01: dataset/catálogos y delivery-data.spec.ts | PASS |
| AC-02 | T-02 | EV-02: repetición/conflictos/preservación en PostgreSQL | PASS |
| AC-03 | T-03 | EV-03: PostgreSQL/HTTP/carga local | PASS |
| AC-04 | T-04 | EV-04: manifiesto y referencias | PASS |
| AC-05 | T-05 | EV-05: regresión/documentación | PASS |

## Entorno y comandos

Windows/Node 24.13.0; PostgreSQL 16 en backend-postgres-1, puerto local 6000. Docker estaba detenido y se inició en segundo plano con autorización; no se reiniciaron volúmenes ni esquemas. Redis existente permanece disponible para ejecución posterior de la app.

Desde Backend:

```powershell
npm run build
node node_modules/typescript/bin/tsc --noEmit
node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=.local/delivery-tests.json
npm run lint
node scripts/verify-demo-seed.cjs
node scripts/verify-delivery-seed.cjs
node scripts/verify-delivery-seed.cjs --apply-local
```

Desde Frontend: `node node_modules/typescript/bin/tsc --noEmit` y Jest completo con salida JSON; tipos repetidos tras limpieza. Desde raíz: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-delivery.ps1` para inventario y el mismo comando con `-Apply` para borrar. El permiso de scripts solo aplica al proceso; no cambia la política de Windows. Finalmente `node scripts/check-sdd.mjs` y revisión de diff/referencias.

## EV-01 — Datos y categorías

Se conservan ocho categorías y se añaden Desayunos/Panadería (LIVE) y Arte y Dibujo/Audio y Accesorios (STATIC); doce en total, seis por tipo. No se atribuyen a un directorio universitario oficial. Cinco zonas vigentes sin renombrar IDs. Dataset de 48 publicaciones, cuatro por categoría, 24 por tipo, seis cuentas y doce reservas. Las 24 STATIC especifican NEW/USED y omiten stock/horario; LIVE respeta intervalos, stock y precios. Se reutilizan 16 fotografías ilustrativas locales, con checksum/PNG/tamaño comprobados y escritura exclusiva para evitar sobrescribir uploads.

Tres pruebas de invariantes comprueban cobertura/IDs, inventario (`current_stock + ACTIVE + COMPLETED = initial_stock`), precio fijado y tiempos de cada estado, además de ofertas activas y programadas. Hay tres reservas por estado, dos ofertas activas, una manual pendiente y una programada futura. Un stock agotado y una venta futura quedan fuera del feed según las reglas vigentes; finalizados/vendidos siguen en Mis ventas.

## EV-02 — Preservación y repetición

[Ensayo aislado](evidence/isolated-seed.json): base creada con nombre propio tapcampus_delivery_<timestamp>, migrada y sembrada. Primera ejecución 6/48/12; segunda 0/0/0 y snapshot íntegro idéntico. Se modifica una publicación del fixture y se repite: título/stock editados se conservan. Contraseña distinta y conflicto de identidad abortan sin escrituras parciales. Fotos existentes se verifican y no se reemplazan. La BD temporal se descarta al cerrar conexiones, previa validación del nombre y distinción respecto de DATABASE_URL original.

El seed usa transacción y bloqueo de tablas, IDs propios, createMany con skipDuplicates y validación de propiedad de IDs/email/claves. No utiliza UPDATE/DELETE sobre datos existentes. La clave de demo se genera o toma de SEED_DEMO_PASSWORD/archivo local; las cuentas existentes nunca se restablecen. Se conserva en Backend/.local/demo-access.json, fuera de Git; no aparece en la evidencia ni en logs.

## EV-03 — Carga local y HTTP

[Carga local](evidence/local-seed.json): primera ejecución añade seis usuarios, 48 publicaciones y doce reservas; repetición 0/0/0. Totales de la base configurada: usuarios 6→12, categorías 8→12, publicaciones 30→78, reservas 5→17, zonas 5→5 y reportes 0→0. Todas las filas originales conservan sus hashes/datos, incluidos teléfonos, contraseñas, stock y reservas previas. No se ejecuta ninguna migración ni borrado sobre esta base.

En ambos entornos se comprueban 11 solicitudes HTTP con app Nest/Prisma reales, workers y colas desactivados en el verificador para no consumir datos durante el ensayo: login de comprador/vendedor, cinco zonas/doce categorías, feed LIVE/STATIC (18/20 publicaciones nuevas visibles), dos imágenes PNG 200, seis reservas del comprador, doce publicaciones del vendedor y cuatro estados de sus reservas. Feed sin contactos privados. Las identidades/teléfonos son ficticios y no se envían mensajes.

## EV-04 — Limpieza

[Manifiesto](evidence/cleanup.json): 16 rutas acotadas, 2 980 archivos y 5 580 768 192 bytes de tamaño lógico retirados (aprox. 5.58 GB / 5.20 GiB; no es una medición de bloques físicos liberados). Incluye Frontend/.local (exports, capturas duplicadas y paquetes temporales), Frontend/dist, carpetas temporales de pruebas de seed, 14 imágenes de plantilla sin referencias y scripts/reset-project.js.

Cada destino se resuelve a ruta absoluta dentro del workspace; se rechazan enlaces/reparse points antes de borrar y se usa Remove-Item -LiteralPath. No se borran node_modules, .env, backups, uploads, skills, migraciones, fuentes ni evidencia de specs. Los informes seleccionados de pruebas se consolidaron en evidence antes de retirar copias locales. [Comprobación posterior](evidence/references.json): 15 referencias de assets de configuración/código resuelven; acceso local y backups siguen presentes; árbol temporal y reset-project retirados. Tipos frontend tras borrar: PASS. Backend/.local/pdf-tools se conserva: no se demostró que fuera prescindible.

## EV-05 — Regresión y convergencia

[Pruebas](evidence/tests.json): 114 backend/13 suites y 178 frontend/22 suites, 292 pruebas aprobadas. Tipos de ambas capas y build/lint backend PASS. Verificador del seed anterior de 24 publicaciones sigue aprobado. Se actualizan verificadores de fase2/infraestructura al catálogo de doce categorías; no se presenta esa edición como reejecución integral de concurrencia/restauración.

Guía de entrega en docs/11_DELIVERY_GUIDE.md y README frontend sin boilerplate. README raíz enlaza la preparación y corrige la referencia antigua a campos de reserva pendientes. Requisitos/arquitectura/0005, auditoría, trazabilidad, índice y TASKS alineados; check-sdd PASS. No se modifican endpoints ni pantallas de producto, no hay migración de esquema. Pruebas físicas/UAT/instalable siguen fuera de esta tarea; no se declara APK ni MVP completo.
