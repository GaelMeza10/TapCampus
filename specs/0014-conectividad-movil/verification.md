# 0014 — Verificación

Estado: Verificado | Fecha: 2026-11-03

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 | EV-01 timeout Axios 15000; Jest comprueba mensaje de timeout y fallo/reintento que termina la carga y muestra datos | Aprobado automatizado |
| AC-02 | T-02 | EV-02 pruebas de reubicación de uploads, API HTTPS LIVE 8/STATIC 12, PNG 200 y Socket.io conectado | Aprobado transporte |
| AC-03 | T-03, T-04 | EV-03 tsc, 10 suites/35 pruebas, verificador JWT/401; EV-04 usuario confirma productos visibles en Expo Go iPhone | Aprobado para conectividad del feed |

## Evidencia

Windows/Node 24, Expo 58.0.23. PostgreSQL tiene sus cuatro migraciones, checksums coincidentes y migrate diff vacío, verificados previamente en esta sesión. GET del feed por LAN devuelve datos; Metro funciona por túnel mientras EXPO_PUBLIC_API_URL apuntaba a la LAN. Esa configuración no hace pasar la API por el túnel de Metro. Axios no tenía timeout, por lo que una conexión inaccesible podía seguir cargando. No se atribuye el bloqueo a la BD ni se afirma haber comprobado el aislamiento de la red desde el teléfono.

Se abrió un túnel temporal independiente de Expo hacia el backend 3000, autorizado por el usuario mediante la herramienta. Frontend/.env usa ese origen HTTPS y Backend/.env PUBLIC_BASE_URL coincide para futuros uploads; son archivos ignorados y no se registran secretos. Se reinició backend y Metro para incorporar las variables. La primera comprobación del bundle demostró que Metro aún tenía la variable anterior antes del reinicio.

EV-01/02/03: desde Frontend `node node_modules/typescript/bin/tsc --noEmit --incremental false` y `npm.cmd test -- --silent`: salida 0, 10 suites/35 pruebas. Pruebas nuevas verifican reintento tras fallo, mensajes de timeout/validación y resolución de uploads antiguos sin modificar imágenes ajenas. Desde Backend `node scripts/verify-frontend-api.cjs`: salida 0, Bearer admitido, sin token 401 e inválido 401 con sesión borrada. Peticiones fetch por HTTPS al túnel: LIVE HTTP 200/8, STATIC HTTP 200/12, PNG HTTP 200 image/png; cliente socket.io por websocket conecta y se cierra correctamente. No se activan reintentos automáticos de mutaciones ni se cambia SecureStore.

EV-04: el usuario confirmó en esta sesión «ya funciona, ya se ven los productos» en Expo Go iPhone. Esto acredita la visualización del feed; no acredita todos los flujos de fase 5. Un túnel depende de su proceso y cambia al recrearlo; no es despliegue de producción. TASKS 5.2 permanece abierta hasta la aceptación integrada.

Comprobación final del bundle iOS por el túnel de Metro nuevo: HTTP 200 y nueva URL de API encontrada en el JavaScript servido (`newApiIncluded: true`). El QR temporal se eliminó a petición del usuario después de confirmar el funcionamiento. `node scripts/check-sdd.mjs` y `git diff --check`: salida 0. El backend y ambos túneles quedan activos para el recorrido del usuario.
