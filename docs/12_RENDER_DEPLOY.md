# Entrega permanente en Render

Blueprint raíz render.yaml: API Docker Node 24, PostgreSQL 16 privado, Key Value privado persistente/noeviction y disco de imágenes de 1 GB. HTTPS de Render, JWT y contraseña demo generados en el panel. Jobs residen en la API, una sola instancia; no crear worker adicional. No se modifica la base local ni se importan sus cuentas personales.

Actualización 2026-11-22: render.yaml usa ahora los planes gratuitos (web, Key Value y PostgreSQL `free`, sin disco). Antes de confirmar, comprobar que Render muestre US$0. Limitaciones aceptadas para la demostración: la API se duerme tras 15 min sin tráfico y tarda ~1 min en despertar; las fotos subidas por usuarios se pierden en cada reinicio (las fotos demo se recrean al arrancar); Redis gratuito no persiste, pero la conciliación reprograma jobs desde PostgreSQL; la base gratuita vence a los 30 días (14 de gracia) y debe recrearse. La configuración anterior de pago (~US$23/mes) queda en el historial de git.

En Render: New → Blueprint → repositorio TapCampus → rama main → render.yaml → revisar recursos y costo → confirmar. Si no aparece el repositorio privado, conectar GitHub y conceder acceso a ese repositorio.

El arranque aplica migraciones, carga seed aditivo y lanza NestJS. Las fotos persisten en /var/data/uploads; no se publican secretos ni demo-access.json. Las credenciales demo se obtienen de SEED_DEMO_PASSWORD en Environment del servicio, con los correos documentados en la guía de entrega. También se puede registrar una cuenta nueva.

Tras estado Live, verificar /categories (26), /zones (5), imágenes, dos sockets, registro/login y reinicio con datos conservados. Copiar la URL pública para generar un APK nuevo con EXPO_PUBLIC_API_URL; el APK anterior conserva la API local. No declarar despliegue ni instalación verificados hasta ejecutar esos pasos.

Rollback: redeploy de versión compatible conservando Postgres/Key Value/disco; no borrar volúmenes ni restaurar NOT NULL sobre ubicaciones ARRANGED. Conservar respaldo antes de migraciones futuras. Auto deploy desactivado para evitar desplegar cada push sin revisión.
