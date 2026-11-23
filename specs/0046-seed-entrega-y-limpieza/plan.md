# 0046 — Plan

Estado: Ejecutado | Especificación: spec.md

1. AC-01: ampliar catalogs.ts y actualizar contrato/verificadores; dataset tipado separado de ejecución. Reutilizar 16 fotos existentes.
2. AC-02: seed-delivery.ts invoca función Prisma transaccional. Prevalidar archivos/cuentas/namespace, createMany skipDuplicates, no updates sobre datos existentes; contraseña bcrypt y archivo local de acceso excluido de Git. Rutas de imágenes relativas a uploads, normalizadas por cliente existente.
3. AC-03: PostgreSQL en Docker local, ensayo con BD de nombre propio y validación HTTP usando app con repositorio real/jobs desactivados para no consumir fixtures durante comprobación. Inventario original y prueba repetida en base configurada. Sin migraciones de esquema ni reset.
4. AC-04: script PowerShell con lista acotada, modo inventario y -Apply; resolved paths dentro de workspace, rechazo de reparse points. Retirar archivos temporales reproducibles y assets huérfanos/scaffold; medir bytes y guardar manifiesto en specs.
5. AC-05: suites backend, contratos/seed, tsc frontend y export/compilación según archivos retirados. Documentación de arranque y credenciales locales, SDD y evidencia.

## Constitución

I: spec previa. II: RF/US→AC→T→EV. III: stock/reservas modelados coherentemente, sin modificar transacciones productivas. IV: contrato aditivo de categorías, sin nuevos endpoints/migraciones. V: ensayo real y hashes; conteos no sustituyen pruebas. VI: solo seed/limpieza solicitados; no borrar datos ni alterar rol/privacidad. Reversión del código por archivos; datos nuevos identificables por namespace, sin borrado automático.
