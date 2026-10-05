# 0003 — Plan técnico

Estado: **En implementación; backend fase 2 verificado** | Especificación: `spec.md`

## Datos, API y seguridad

- `Publication` ya dispone de `type/status/zone_id/category_id/initial_stock/current_stock/start_time/end_time/image_url`. Añadir una restricción real de PostgreSQL `current_stock >= 0` y comprobar que `LIVE` exige stock/horas, `STATIC` no los usa. No aplicar la migración destructiva existente a datos compartidos sin respaldo.
- Subida autenticada `POST /uploads` con Multer y servicio estático `/uploads`, verificados en EV-08. Formatos JPEG/PNG/WebP por contenido y 5 MiB; datos inválidos `400`, tamaño excedido `413`, escritura fallida `500`. Publicación guarda únicamente image_url.
- `POST /publications` y `PATCH /publications/:id` usan DTO estrictos. El vendedor se obtiene del JWT. Verificar que `Category.type === LIVE` y que `zone_id` existe. Las fechas se almacenan en UTC; el cliente presenta hora local.
- `GET /publications` aplica predicado de visibilidad en servidor; `GET /publications/:id` devuelve detalle sin exponer teléfono público de venta en vivo. El temporizador visual deriva de la fecha de servidor y se sincroniza al reenfocar.
- Venta física y reserva bloquean la misma fila de `Publication` en transacción para evitar doble venta. La edición de stock solo cambia unidades disponibles, preserva las reservadas y rechaza resultados negativos. Tras commit emitir `stock_updated` (0007).
- Expiración horaria: job/conciliación duradera marca `FINISHED` y emite `publication_expired` después de confirmar. La consulta también filtra por `end_time` para no depender de puntualidad del job. Las reservas previas siguen confirmables por su vendedor hasta su propio vencimiento de 20 minutos; después se liberan sin reactivar la publicación.
- El cierre manual SHOULD es una transición `ACTIVE → FINISHED` autorizada; la UI pide confirmación según `docs/04_UI_UX_GUIDELINES.md`.

## Constitución

## Ejecución backend fase 2

Reutilizar CHECK y modelos de fase 1 sin migraciones. UploadsModule usa FileInterceptor con almacenamiento temporal en memoria limitado a 5 MiB; FileTypeValidator inspecciona contenido y normaliza MIME antes de guardar mediante writeFile exclusivo con UUID. Servir solo ese directorio en /uploads mediante NestExpressApplication.useStaticAssets con nosniff; validar URL/archivo existente en creación/edición. DTO de creación y de PATCH separados para impedir edición de campos gestionados. PublicationsService valida catálogos, datos combinados y horarios; toda mutación existente usa transacción interactiva y SELECT FOR UPDATE parametrizado. Lecturas seleccionan únicamente propiedades públicas y contacto solo STATIC en detalle. No implementar reservas/colas/eventos/finish en esta revisión. Añadir script HTTP reproducible que crea una BD aislada, aplica migraciones/seed existentes y arranca dist/main con directorio de imágenes aislado; compara inventario original antes/después y guarda resumen sin tokens/datos personales. Probar carrera física/física y contra bloqueo SQL equivalente al futuro consumidor de stock, sin presentar esa evidencia como reserva HTTP completa.

| Principio | Cumplimiento |
| --- | --- |
| I–II | RF/US → AC-01..07 → T → EV; decisiones de producto resueltas. |
| III | Stock disponible y reservas se modifican bajo bloqueo de fila y restricción de BD. |
| IV | Rutas, DTO, códigos, permisos y eventos están fijados antes de UI. |
| V | Se planifican casos válidos, inválidos y carrera contra PostgreSQL real. |
| VI | Sin pagos/GPS; cambios de ciclo de vida reabren spec. |

## Pruebas y dependencias

Orden: 0002 autenticación → catálogos de 0005 → subida y DTO → publicación/edición → expiración y venta física → UI y eventos → pruebas. Probar AC-01/02 mediante HTTP, AC-03/04 con reloj controlado, reserva previa y lectura de feed, AC-05 con reserva/venta simultáneas y AC-06/07 con dos vendedores. Registrar no regresión de 0001.
