# Preparación y demostración de TapCampus

El proyecto incluye backend NestJS y app Expo SDK 58. Requiere Node 24, PostgreSQL 16 y Redis 7. Instala dependencias con `npm ci` dentro de Backend y Frontend. Configura sus `.env` locales tomando los ejemplos; no entregues credenciales personales ni archivos de respaldo.

## Base de datos

Desde Backend, `docker compose up -d` inicia PostgreSQL en puerto 6000 y Redis en 6379 según docker-compose.yml. DATABASE_URL debe apuntar a esa base. JWT_SECRET requiere un valor aleatorio largo.

En una **base nueva vacía**, inicializa el esquema:

```powershell
node node_modules/prisma/build/index.js migrate deploy
```

En una base existente conserva sus datos e historial; consulta scripts/README.md para inventario, respaldo y migración segura. Antes de usar 0047 deben estar aplicadas las migraciones actuales, incluida pickup_and_availability. El ensayo/restauración local se documenta en specs/0047-usabilidad-y-recogida/verification.md.

## Datos y accesos de demostración

Desde Backend:

```powershell
npm run db:seed:delivery
```

0047 amplía la semilla a cinco zonas, 26 categorías (16 LIVE/10 STATIC), seis cuentas, 107 publicaciones y 24 reservas. Las 48 publicaciones y doce reservas de 0046 conservan sus IDs/datos; la ampliación es aditiva. Si ya existen las zonas/categorías se reutilizan. Las cuentas son ficticias; nombres, teléfonos y productos no representan estudiantes o ventas reales. Precios en pesos son ejemplos, no cotizaciones. Fotografías ilustrativas locales, sin dependencia de servidores de imágenes externos.

- Vendedores: `demo.entrega.ana@uabc.edu.mx`, `demo.entrega.diego@uabc.edu.mx`, `demo.entrega.valeria@uabc.edu.mx` y `demo.entrega.mateo@uabc.edu.mx`.
- Compradores con reservas e historial: `demo.entrega.lucia@uabc.edu.mx` y `demo.entrega.daniel@uabc.edu.mx`.
- La contraseña se genera y guarda en **Backend/.local/demo-access.json**, excluido de Git. Para fijarla antes de la primera ejecución usa SEED_DEMO_PASSWORD (mínimo ocho caracteres). No se imprime en logs ni se restablece una cuenta existente.

Todas las personas pueden comprar y vender; la lista solo indica el recorrido preparado. Repetir el comando no duplica ni repone stock, no reinicia relojes, no reabre ventas y no cambia contraseñas. Si pierdes el archivo de acceso de cuentas ya existentes, proporciona su contraseña en SEED_DEMO_PASSWORD. El seed no recupera contraseñas desconocidas.

Hay 67 publicaciones LIVE y 40 Productos STATIC; al menos cuatro ejemplos por categoría tipada. Ocho Productos permiten entrega por acordar. Un lote nuevo de tres ventas y doce reservas incorpora recogida guardada y estados variados sin rejuvenecer los relojes anteriores. Se incluyen condición Nuevo/Usado, ofertas activas/manuales/programadas, ventas finalizadas, un stock agotado con apartado y una venta futura. LIVE tiene horarios relativos al instante de siembra. Las reservas activas conservan el plazo real de 20 minutos; el worker las expira normalmente. El historial contiene entregas, cancelaciones y vencimientos coherentes, incluido un precio reservado anterior a la oferta.

## Arranque y recorrido

En Backend: `npm run start:dev`. En Frontend: configura EXPO_PUBLIC_API_URL y ejecuta `npm start`. Redis debe estar disponible para workers y conciliación. Los uploads del seed se sirven desde el mismo directorio configurado para la API; sus rutas relativas se adaptan al origen actual.

1. Accede como Lucía: Explorar → categoría/zona → detalle; revisar Mis reservas y su historial.
2. Accede como Ana: Mis ventas → apartados por entregar; revisar precio fijado, stock y una oferta activa. Mateo tiene ejemplos finalizados.
3. Crea una venta en vivo o anuncio, adjunta foto y completa el formulario. Con dos sesiones se puede demostrar un apartado nuevo y su entrega.
4. Para probar WhatsApp usa un teléfono propio actualizado en Mi cuenta. Los contactos del seed son ficticios; no se envía ningún mensaje al sembrar o verificar.

El seed es aditivo y no retira datos anteriores del proyecto. Las pruebas técnicas no sustituyen la aceptación física, modo avión, permisos, lector y piloto de 0040.

## Verificación y limpieza

Backend: `npm run test:seed:delivery` ensaya en PostgreSQL aislado y descarta únicamente esa BD de prueba; requiere backend compilado con `npm run build`. `node scripts/verify-delivery-seed.cjs --apply-local` añade los datos a la base configurada, comprueba dos ejecuciones y verifica hashes de filas previas.

Desde raíz, `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-delivery.ps1` muestra los residuos previstos; `-Apply` elimina solo las rutas permitidas. El permiso de scripts solo afecta a ese proceso, sin cambiar la política del sistema. Conserva dependencias, variables, backups, uploads, skills, migraciones, código y evidencia. Registra cantidades/bytes en el expediente [0046](../specs/0046-seed-entrega-y-limpieza/verification.md). La limpieza no borra datos de PostgreSQL ni volúmenes Docker.
