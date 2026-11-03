# 0013 — Migración a Expo SDK 58

Estado: Verificado | Fecha: 2026-11-03

## Alcance

Petición del usuario: actualizar SDK 57 a 58. Mantenimiento técnico de TASKS 4.1; conserva los flujos de RF-01/RF-02 y US-01/US-02. Actualizar dependencias compatibles y referencias activas, sin cambios de negocio.

### AC-01 — Dependencias compatibles

Dado el frontend SDK 57, cuando se actualiza, Expo 58 y sus módulos coinciden con el mapa oficial; el lock permite instalar sin forzar peers.

### AC-02 — Regresión automatizada

Dado SDK 58 instalado, cuando se comprueba TypeScript, Jest y exportación Expo, las verificaciones pasan y se conservan las rutas.

### AC-03 — Trazabilidad

Dada la migración, cuando se consulta la documentación activa, identifica SDK 58 y registra comprobaciones y límites de validación nativa.
