# 0045 — Plan

Estado: Ejecutado | Especificación: spec.md

1. Reproducir con Jest mensajes nulos/5xx, acceso offline, borrado indebido y registro HTTP de espacios. AC-01/02.
2. Extraer mapeo de errores compartido para auth/marketplace sin cambiar transporte; preservar mensajes de negocio, vocabulario y timeouts. Auth limpia solo error del campo editado; mensajes generales persisten. Transform de nombre en RegisterDto como actualización de perfil existente, antes de IsNotEmpty. AC-01/02.
3. Mantener errores de listas con datos fuera del scroll, con altura acotada; detalle usa estado explícito de 404 y distingue carga fallida. Cuenta/foto conservan errores útiles. AC-03.
4. Ampliar fixture y verificador de UI para interacciones adversas y recuperación controlada; registrar solicitudes sin credenciales, mutaciones o red externas. Pruebas de cámara/galería en Jest. AC-04.
5. Regresión frontend/backend, tipos/build/lint, exports, capturas y documentación. AC-05.

## Constitución

I: spec antes de cambios. II: RF/US→AC→T→EV. III: stock/precio/plazo/idempotencia intactos. IV: único ajuste HTTP es rechazar nombre vacío normalizado con 400; sin migración ni cambio de payload. V: evidencia separa Jest/HTTP aislado/web/hardware. VI: acotado a validación y recuperación solicitadas; reversión por archivos, sin cambios de BD.
