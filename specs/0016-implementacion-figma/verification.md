# 0016 — Verificación técnica

Estado: Verificado | Fecha local: 2026-11-04

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-09 | EV-01, EV-10 | PASS |
| AC-02 | T-02, T-09 | EV-02, EV-10 | PASS |
| AC-03 | T-03, T-09 | EV-03, EV-10 | PASS |
| AC-04 | T-04, T-09 | EV-04, EV-08, EV-10 | PASS |
| AC-05 | T-05, T-09 | EV-05, EV-08, EV-10 | PASS |
| AC-06 | T-06, T-09 | EV-06, EV-10 | PASS |
| AC-07 | T-07, T-09 | EV-07, EV-08, EV-10 | PASS |
| AC-08 | T-03, T-04, T-05, T-07, T-09 | EV-08 | PASS |
| AC-09 | T-08, T-09 | EV-09 | PASS |
| AC-10 | T-01, T-09 | EV-10 | PASS (alcance técnico) |

## Entorno y reproducción

Windows, Node v24.13.0, Expo SDK 58/React Native 0.88.1. Comandos desde Frontend salvo indicación. Resumen persistido en [evidence/checks.json](evidence/checks.json).

- **EV-01:** Tema, tipografía, controles y componentes compartidos. Verificador `node scripts/verify-redesign-ui.cjs`: 18 capturas de pantallas reales renderizadas por React Native Web/Chrome a 390×844, sin recursos ausentes, excepciones JS ni desbordamiento horizontal. Aserción de familias sobre nodos de texto: Inter regular/semibold/bold y fuente de iconos Ionicons; Inter medium también se empaqueta localmente. Imágenes originales de Figma no se usan como pantallas aplanadas; cuatro SVG locales con dimensiones originales. Se revisaron visualmente las 18 capturas y se compactó Mis ventas hasta mostrar completas las dos reservas de ejemplo.
- **EV-02:** navigation.test.tsx: rutas protegidas, registro/login, JWT, 401 y logout. feed.test.tsx: + del tipo visible. Capturas login/register/feed y barra inferior en reservas/ventas. Root mantiene guardas y captura errores de lectura inicial de almacenamiento para evitar un rechazo no manejado.
- **EV-03:** feed.test.tsx verifica selección provisional combinada, cerrar sin aplicar, restablecer, eventos, error/reintento, conservación de datos al refrescar y rechazo de respuestas de otro tipo anterior. Filtros consultan catálogos reales; captura de hoja y estados vacío/error.
- **EV-04:** reservation-screen.test.tsx y contratos conservan UUID en reintento, cambian clave al apartar otra unidad, manejan 409 sin crear reserva local y cancelan la unidad seleccionada. Confirmación conserva respuesta autorizada del servidor aun si el detalle deja de ser público; precio/plazo/contacto propios. Capturas detail/reservation-success.
- **EV-05:** reservations.test.tsx y reservation-presentation.test.tsx: estados españoles, cuatro estados de reserva, unidad distinguible sin UUID, acción por unidad y retiro de acciones/reconsulta al vencer. Capturas de dos reservas activas y reservas vencidas con reloj neutral.
- **EV-06:** publication-form.test.tsx: permiso de cámara rechazado con error visible, stock negativo bloqueado antes de upload/API, payload STATIC sin campos LIVE y borrador conservado ante fallo, configuración programada/validación de precio/cierre sin guardar. Capturas de formularios y ganga. DateTimePicker de @expo/ui comprobado contra tipos instalados y empaquetado nativo; selección real con cámara/teclado pertenece al recorrido físico.
- **EV-07:** sales.test.tsx: confirmaciones previas a mutar, unidad correcta del mismo segundo, historial español, venta finalizada sin edición/venta física/ganga con entrega previa válida y STATIC→vendido sin controles LIVE. Capturas sales/sales-ganga/sales-finished/catalog-sales/catalog-sold. Contacto del comprador permanece accesible mediante icono rotulado.
- **EV-08:** hook de sincronización con limpieza por foco/primer plano/reconexión/eventos, relojes y reconsulta al vencer. Backend `npm run test:phase3`: 311 HTTP y 16 grupos PASS contra PostgreSQL/Redis reales en base y namespace aislados: 50 claves por última unidad (1×201/49×409), 50 reintentos, carreras, precio fijado, entrega tras cierre dentro del plazo, jobs reales/reinicio, dos clientes y eventos/reconexión. Pruebas frontend de eventos y reintentos aprobadas.
- **EV-09:** Antes: cuatro migraciones, 24 publicaciones, dos reservas. Respaldo pg_dump formato custom en `Backend/.local/backups/antes-0016-20261104.dump` (21,590 bytes), creado antes de la migración. Aplicada 20261104010000_add_price_before_ganga; cinco migraciones al día. Captura bajo el mismo SELECT FOR UPDATE; campo no aceptado en DTO. Ensayo fase 3 comprobó precio previo 12.50→9.25 manual, precio previo de programación 12.50→7.50 y reservas anteriores 12.50 intactas; NULL antes de activación. Inventario/hash de base original idénticos antes/después del ensayo aislado. Evidencia cruda local: `Backend/.local/verification/tapcampus_phase3_1793844431214/phase3.json`.
- **EV-10:** `node node_modules/typescript/bin/tsc --noEmit` PASS. `npm test -- --silent`: 10 suites/40 pruebas PASS. Backend `npm run build`, `npm run lint` y `npm test -- --runInBand`: cinco suites/nueve pruebas PASS. `npx expo export --platform ios --platform android --output-dir .local/redesign-native --max-workers 2`: ambos bundles Hermes PASS, 43 assets referenciados (cuatro pesos Inter). `node scripts/check-sdd.mjs` desde raíz y `git diff --check` PASS. Salidas reproducibles en .local, excluidas de Git.

## Límites y recorrido en dispositivo

La evidencia visual usa Chrome como superficie de revisión a tamaño móvil con una entrada de fixtures fuera de src/app. No modifica servicios reales ni desactiva guardas del producto. No sustituye renderizado UIKit/Android ni apertura de apps externas.

No se tuvo acceso físico al iPhone. No se realizó el recorrido nativo de teclado, gesto de retorno, cámara/galería, permiso denegado, selector de horario, WhatsApp instalado/no instalado y safe areas con tamaño de texto aumentado. Para esa aceptación: iniciar backend, recargar Expo Go con `npx expo start -c`, publicar ambos tipos, filtrar/cambiar pestaña, apartar dos unidades, cancelar una/entregar otra, activar ganga y terminar venta conservando entregas previas. UAT con cinco estudiantes sigue en el plan transversal. TASKS 5.1–5.6 no se cierran con esta evidencia técnica.

## EV-11 — Preparación del recorrido iPhone (2026-11-05)

El usuario confirmó tener su iPhone disponible. Docker Desktop y los contenedores PostgreSQL/Redis se iniciaron; `node node_modules/prisma/build/index.js migrate status` desde Backend confirmó las cinco migraciones aplicadas. Se inició la API compilada y se renovaron los dos túneles temporales, uno para API y otro para Metro. Las variables locales ignoradas EXPO_PUBLIC_API_URL y PUBLIC_BASE_URL se sincronizaron antes de reiniciar ambos servicios; no se alteraron las publicaciones ni se repitió el seed.

Comprobación desde la computadora por el túnel HTTPS: GET `/publications?type=LIVE` → 200/8 publicaciones; STATIC → 200/12; imagen del feed en el origen actual → 200 image/png; cliente Socket.io conectado usando transporte websocket. El manifiesto iOS devolvió 200 con runtime `exposdk:58.0.0`; su bundle servido por el túnel devolvió 200 e incluyó el origen nuevo de la API (`Frontend/.local/iphone-bundle-check.json`). Metro compiló 1533 módulos. Se proporcionó un QR fuera del repositorio para iniciar el recorrido con Expo Go. Estas comprobaciones preparan la prueba física; no acreditan por sí mismas resultados observados en el teléfono ni cierran 5.1–5.6.

## EV-12 — Conexión local solicitada por el usuario (2026-11-05)

Por petición expresa del usuario, se detuvieron ambos túneles de EV-11. La interfaz Wi-Fi tiene IP 10.41.60.121; EXPO_PUBLIC_API_URL y PUBLIC_BASE_URL locales se cambiaron a `http://10.41.60.121:3000`. Se reiniciaron API y Metro, este último con `--lan --clear --port 8081` y hostname 10.41.60.121. No se modificó código funcional ni datos.

Desde la computadora, usando esa IP: LIVE 200/8, STATIC 200/12, imagen 200 image/png y Socket.io websocket conectado. Manifiesto iOS 200, hostUri 10.41.60.121:8081 y runtime exposdk:58.0.0; bundle iOS 200 con origen local incluido, registrado en `Frontend/.local/iphone-lan-check.json`. Se entregó QR temporal para `exp://10.41.60.121:8081`, fuera del proyecto. El acceso desde el iPhone requiere el mismo Wi-Fi y todavía debe confirmarlo el usuario; estas comprobaciones desde la computadora no demuestran conectividad entre dispositivos. No se reactivarán túneles sin solicitud del usuario.
