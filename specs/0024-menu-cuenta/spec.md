# 0024 — Acceso global a la sesión

Estado: Verificado (técnico y visual auxiliar; aceptación física separada) | Fecha: 2026-11-06

Sustituido por 0026 (2026-11-09): el usuario eligió un módulo propio Mi cuenta como cuarta pestaña con datos registrados y cierre de sesión. Se retiró AccountMenu; los criterios y evidencia siguientes conservan el resultado histórico de la hoja, no describen la interfaz vigente.

El usuario señala que Cerrar sesión está mal ubicado dentro de Mis ventas. Corrección directa de código: sacar la gestión de sesión del listado de ventas y ofrecer acceso Cuenta en los encabezados principales. RF-01/02; US-01/02; TASKS 5.1/5.17. Fuentes: docs02/04/05/07/08/09/10, constitución y AuthContext/guardas existentes. Sin perfil editable, nuevas pestañas, API o Figma.

### AC-01 — Acceso consistente

Explorar, Mis reservas y Mis ventas ofrecen el mismo botón Cuenta en el encabezado. Abre una hoja Mi cuenta con la acción Cerrar sesión; el listado/footer de ventas no contiene esa acción. Cerrar la hoja no altera sesión ni tab. Navegación inferior y contenido conservados, a 320/390/430.

### AC-02 — Cierre y recuperación seguros

Solo pulsar Cerrar sesión invoca el logout existente. Mientras está pendiente se muestra Cerrando sesión…, se bloquean duplicados y cierre de hoja. Tras éxito AuthContext/guardas existentes retiran las rutas privadas. Si falla se conserva sesión/hoja, muestra error local y permite reintentar. Abrir Cuenta no ejecuta logout.

### AC-03 — Consistencia y evidencia

Reutilizar Sheet, botones, iconos Ionicons y tokens actuales. Acceso rotulado, objetivo táctil de al menos 44, estado accesible ocupado/deshabilitado, error legible, safe areas y texto adaptable. Probar apertura/cierre, envío/error y navegación protegida; revisar capturas y documentar límites físicos sin afirmar prueba en iPhone.

Revisión solicitada con ambas skills: botón Cuenta y cierre de hoja de al menos 48 dp en Android (44 pt iOS); foco al encabezado de la hoja y retorno al activador al cerrar, anuncios de envío/error y respeto de movimiento reducido. Revisar adicionalmente 375 y horizontal como evidencia auxiliar; VoiceOver/Dynamic Type nativos conservan aceptación separada.
