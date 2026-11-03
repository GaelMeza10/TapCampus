# 0014 — Conexión móvil y carga del feed

Estado: Verificado | Fecha: 2026-11-03

## Contexto

RF-05c/RF-06, RNF-02 y US-05c/US-04; TASKS 5.2. En iPhone Expo Go abre por túnel de Metro, pero la API conserva una IP LAN. El servidor devuelve publicaciones; Axios carece de timeout. La ausencia de conectividad deja esperando el feed. Se limita el cambio a transporte, error y recursos de publicaciones; no cambia autenticación ni reglas de venta.

### AC-01 — Espera acotada

Dada una API inaccesible, cuando una petición supera 15 segundos, termina con error legible y el feed permite reintentar sin conservar el indicador de carga indefinidamente. No reintentar mutaciones automáticamente.

### AC-02 — Origen accesible

Dado un origen de API HTTPS configurado para desarrollo móvil, cuando se consulta el feed, HTTP y Socket.io usan ese origen. Las imágenes de uploads del backend se resuelven en ese origen aunque la publicación conserve una URL LAN anterior; URLs ajenas al contrato de uploads se conservan.

### AC-03 — Regresión y diagnóstico

Dados datos reales de PostgreSQL, cuando se comprueban feed e imagen por el túnel y se ejecutan tipos/pruebas, la API responde correctamente y los contratos JWT/idempotencia se conservan. La visualización en iPhone requiere confirmación del usuario y no se infiere de una prueba local.
