# 0026 — Navegación reconocible y módulo Mi cuenta

Estado: Verificado (técnico y visual auxiliar; aceptación física separada) | Revisión: 2026-11-09

El usuario no distingue el módulo activo por el tenue cambio de color y rechaza Cuenta como hoja de una sola acción. Confirma la opción «Módulo Mi cuenta con correo, datos registrados y cerrar sesión». RF-01/02; US-01/02; TASKS 5.1/5.19. Fuentes: docs02/03/04/05/07/08/09/10, constitución y 0024. Reemplazo directo en código, identidad actual, sin Figma.

### AC-01 — Ubicación visible en navegación

Cuatro destinos persistentes: Explorar, Reservas, Mis ventas y Cuenta. Según ajuste del usuario de 2026-11-09, el activo usa fondo verde con 12 % de opacidad, etiqueta/icono verde oscuro, tipografía reforzada y selected accesible; los demás permanecen neutros. Cuenta usa un icono de persona de la biblioteca instalada, sin depender de cargar un SVG nuevo. No depender solo de un cambio del color del icono. Una sola selección correspondiente a la pantalla, sin recortar etiquetas/acciones a 320/390/430; targets mínimos nativos. Tocar el módulo activo no apila navegación duplicada.

### AC-02 — Datos propios autorizados

GET /auth/me protegido por JWT deriva el usuario de CurrentUser y devuelve solo id/name/email/phone. No acepta un ID de usuario del cliente para cambiar el propietario, ni devuelve hash, contraseña, token o atributos internos. Sesión ausente/inválida responde 401. Sin migración ni cambios a login/register.

### AC-03 — Módulo útil y recuperación

Cuenta lleva a /account protegido, con título Mi cuenta y nombre/correo/teléfono reales en lectura; no mostrar datos ficticios mientras carga. Carga/error/reintento claros y valores largos flexibles/seleccionables. Cerrar sesión visible en ese módulo usa AuthContext existente, con estado ocupado y bloqueo de envíos/navegación duplicados. Error conserva sesión/datos y permite reintentar; éxito sigue las guardas actuales. Retirar la hoja Cuenta y el acceso redundante de encabezados; sin edición de perfil o funciones nuevas adicionales.

### AC-04 — Evidencia y compatibilidad

Probar proyección/autorización, navegación/selección y datos/errores/logout. Revisión visual con cuatro pestañas y textos largos a tres anchos, tipos/build/lint/exports, GET real de solo lectura y check-sdd. Actualizar API activa sin tocar inventario ni cerrar la sesión real. Documentar límites físicos; navegador no acredita VoiceOver/Dynamic Type del iPhone.

Revisión AC-03: ningún mensaje técnico del servidor (por ejemplo Cannot GET /auth/me) se presenta en Mi cuenta. Error explica revisar conexión y reintentar; Cerrar sesión sigue disponible. Un 401 de /auth/me invalida sesión mediante el interceptor existente; solo login/register se excluyen. Verificar ruta actual por loopback y origen LAN configurado en Expo, no solo un servidor de prueba.
