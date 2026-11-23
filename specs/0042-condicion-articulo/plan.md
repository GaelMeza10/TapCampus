# Plan de implementación — Nuevo/Usado

1. **Datos (AC-01):** enum ProductCondition NEW/USED y columna condition nullable sin default. Migración aditiva con CHECK que impide condición LIVE. Generar cliente Prisma; ensayar con datos históricos y revisar inventario/respaldo antes de aplicar a base local. Sin inferir valores.
2. **API (AC-02):** DTO valida enum y rechaza null. Servicio exige condición solo al crear STATIC y rechaza LIVE; PATCH conserva al omitir. Agregar a select/serialización pública/propia sin revelar contacto/configuración privada. Sin rutas ni eventos nuevos.
3. **App (AC-03):** ampliar tipos/payload/draft, selector Nuevo/Usado exclusivo STATIC, validación, resumen/foco y precarga. Reutilizar OptionGrid y tokens; conservar foto/borrador al fallar.
4. **Lectura (AC-04):** componente compartido de etiqueta neutral en foto de Explorar y en detalle/tarjeta estática; null no muestra etiqueta.
5. **Verificación:** pruebas DTO/servicio/HTTP persistente, migración histórica, formulario creación/edición/reintento, etiquetas y LIVE; tipos/build/lint, exports, capturas auxiliares y check-sdd.

## Compatibilidad y recuperación
Desplegar migración antes de API y frontend coordinados: cliente antiguo no puede crear STATIC sin elegir condición y recibirá 400 recuperable. Anuncios existentes siguen visibles. No eliminar columna para revertir aplicación: conservar datos, volver al código previo si es necesario. Ninguna migración destructiva ni reset.

## Constitución
I: intención definida antes del código. II: RF-06/US-04/US-11 → AC → T → EV. III: inventario y reservas intactos. IV: contrato enum, DTO, propiedad y migración explícitos. V: evidencia de ejecución y límites de hardware. VI: cambio acotado solicitado; no extender categorías ni otras reglas.
