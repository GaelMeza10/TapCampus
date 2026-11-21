# 0033 — Edición de Mi cuenta

Estado: Verificado (técnico y composición auxiliar; aceptación física separada) | Fecha: 2026-11-10

RF-02/13; US-02/09; TASKS 5.25. Fuentes: docs02/03/04/05/07/08/09/10, constitución y 0026. El usuario acepta editar nombre completo y teléfono, conservando correo de solo lectura. Esta ampliación sustituye la exclusión de edición de 0026; no incluye contraseña, correo ni verificación por SMS.

### AC-01 — Actualización propia y limitada

PATCH /auth/me autenticado recibe name y/o phone; al menos uno, sin null, campos extra ni cuerpo vacío. Solo actualiza al ID de JWT; email/password/id ajenos se rechazan con 400, sin JWT 401. Devuelve 200 con id/name/email/phone, sin hash; cuenta inexistente 401. Actualización atómica sin cambiar identidad, JWT ni sesión.

### AC-02 — Datos válidos y contacto vigente

Nombre no vacío después de recortar y unificar espacios, con acentos y nombres compuestos admitidos. Teléfono mexicano de diez dígitos con o sin +52, guardado canónico +52. Nombre/teléfono nuevos aparecen en lecturas autorizadas de publicaciones/reservas existentes al recargar o recuperar foco, respetando los permisos actuales; precios/plazos/stock intactos. Sin migración.

### AC-03 — Editor reversible

Mi cuenta muestra Editar datos y abre formulario precargado de nombre/teléfono. Correo visible como texto. Guardar cambios habilitado solo ante cambios válidos, bloquear edición/envíos/logout/navegación durante guardado. Cancelar descarta borrador. Fallo conserva borrador con error recuperable; éxito presenta datos confirmados y aviso. Mantener carga/error/logout actuales.

### AC-04 — Calidad y evidencia

Reutilizar Inter/tokens/inputs/botones, teclado móvil, safe areas y texto escalable. Probar HTTP estricto/propiedad/persistencia, contacto actualizado, validación UI, no duplicación, cancelación y fallo/reintento. Tipos/build/lint backend, pruebas, exportaciones móviles, revisión renderizada auxiliar y check-sdd. Documentar validación física pendiente, sin cambiar datos reales del usuario.
