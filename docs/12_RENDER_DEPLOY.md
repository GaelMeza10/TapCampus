# Entrega permanente en Render

Blueprint raíz render.yaml: API Docker Node 24, PostgreSQL 16 privado, Key Value privado persistente/noeviction y disco de imágenes de 1 GB. HTTPS de Render, JWT y contraseña demo generados en el panel. Jobs residen en la API, una sola instancia; no crear worker adicional. No se modifica la base local ni se importan sus cuentas personales.

Antes de aplicar, revisar y aceptar el importe que muestre Render: cómputo base aproximado US$23/mes más almacenamiento, impuestos y consumo. No es una configuración gratuita. La aplicación de Blueprint crea recursos facturables; la preparación del archivo no los contrata.

En Render: New → Blueprint → repositorio TapCampus → rama main → render.yaml → revisar recursos y costo → confirmar. Si no aparece el repositorio privado, conectar GitHub y conceder acceso a ese repositorio.

El arranque aplica migraciones, carga seed aditivo y lanza NestJS. Las fotos persisten en /var/data/uploads; no se publican secretos ni demo-access.json. Las credenciales demo se obtienen de SEED_DEMO_PASSWORD en Environment del servicio, con los correos documentados en la guía de entrega. También se puede registrar una cuenta nueva.

Tras estado Live, verificar /categories (26), /zones (5), imágenes, dos sockets, registro/login y reinicio con datos conservados. Copiar la URL pública para generar un APK nuevo con EXPO_PUBLIC_API_URL; el APK anterior conserva la API local. No declarar despliegue ni instalación verificados hasta ejecutar esos pasos.

Rollback: redeploy de versión compatible conservando Postgres/Key Value/disco; no borrar volúmenes ni restaurar NOT NULL sobre ubicaciones ARRANGED. Conservar respaldo antes de migraciones futuras. Auto deploy desactivado para evitar desplegar cada push sin revisión.
