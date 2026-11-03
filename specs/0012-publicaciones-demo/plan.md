# 0012 — Plan técnico

Estado: Implementado y verificado (ampliación) | Especificación: `spec.md`

## Diseño

1. `prisma/seed.ts` conserva la transacción de catálogos e invoca la demo solo con `SEED_DEMO_SELLER_EMAIL`.
2. El módulo de demo busca el vendedor existente, valida `SEED_PUBLIC_BASE_URL`, conserva los ocho PNG anteriores y copia dieciséis fotografías empaquetadas a `UPLOADS_DIR` o `uploads/` solo si faltan. Crea filas con UUID estables mediante `createMany(..., skipDuplicates: true)` dentro de una transacción.
3. Los nuevos registros usan las posiciones 9–24; no se cambian las posiciones 1–8. El catálogo de datos fija dos anuncios nuevos por categoría, precios y descripciones individuales, stock LIVE positivo y dos configuraciones de ganga válidas.
4. El origen HTTP(S) explícito evita guardar `localhost` en URLs que el teléfono no podría cargar. Los nombres de imagen cumplen el contrato de `/uploads/<uuid>.png`.
5. No se añaden migraciones, rutas, clientes ni eventos. La opción no altera el comportamiento de los ensayos de infraestructura que no pasan las variables.
6. Reversión: retirar la opción del código; los datos de demo se identifican por UUID y título para una limpieza deliberada posterior. No borrar publicaciones ni reservas por defecto.

## Riesgos y límites

- Los doce ejemplos LIVE caducan a los siete días; repetir el seed conserva su estado y horario para no alterar pruebas del usuario.
- El teléfono debe llegar al origen indicado. Las fotografías nuevas son ilustrativas y no representan productos físicos ni vendedores reales.
- El teléfono de contacto pertenece al vendedor de prueba; el texto de cada publicación advierte que no representa una venta real.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I–II | `spec.md`, `tasks.md` y `verification.md` trazan RF-03/RF-06 → AC → T → EV. |
| III | LIVE usa stock positivo y no toca reservas ni stock de filas existentes. |
| IV | Reutiliza relaciones Prisma y URLs de upload válidas; no guarda secretos. |
| V | Se verifican dos ejecuciones, conteos HTTP/SQL, diversidad de datos e imágenes locales. |
| VI | La demo es optativa y no cambia el seed base de 0010. |

## Verificación prevista

| Criterio | Comprobación |
| --- | --- |
| AC-01 | Consultar SQL: 12 de cada tipo. En `GET /publications?type=LIVE|STATIC`, comprobar los ocho IDs nuevos de cada tipo, aunque los LIVE históricos hayan vencido. |
| AC-02 | Ejecutar dos veces; comparar IDs, stock, horarios y recuentos; comprobar que los ocho UUID originales no cambian. |
| AC-03 | Solicitar fotografías PNG por HTTP y probar entradas inválidas sobre una base aislada o antes de insertar. |
| AC-04 | Comprobar dos anuncios nuevos por categoría, campos válidos, gangas manual/programada y texto que declara la demo. |
