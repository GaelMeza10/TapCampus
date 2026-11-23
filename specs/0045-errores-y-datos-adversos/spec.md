# 0045 — Datos adversos y errores visibles

Estado: Verificado (técnico y revisión auxiliar) | Fecha: 2026-11-22

## Contexto

Usuario solicita rellenar y revisar toda la app fuera del camino feliz. RF-01/02/03/05c/06/07/08/13/15, RNF-01/03; US-01/02/03/04/05c/06/07/09/11/12; TASKS 5.35. Fuentes: docs02/03/04/05/07/09/10, DESIGN.md, 0034/0038/0040/0044. Nueva evidencia no sustituye recorridos físicos pendientes.

## Alcance

Acceso, registro, explorar/filtros, cuenta, ventas, reservas, detalles y creación/edición LIVE/STATIC. Entradas vacías/espacios, formato incorrecto, negativos, decimales/rangos, foto inválida/ausente, texto largo/Unicode, fallos de red/timeout y HTTP 400/401/403/404/409/429/500. Datos de fixture aislados; sin modificar cuentas/inventario reales. Corregir defectos encontrados en presentación/recuperación y nombre obligatorio del registro (INC-0040-01). No cambiar plazos, privacidad, stock ni reglas de oferta.

## Criterios de aceptación

### AC-01 — Acceso y registro
Correo/teléfono/contraseña inválidos muestran error por campo sin perder otros valores; editar un campo ajeno no borra ese error. Offline/timeout/5xx no se presentan como credenciales inválidas. Registro con espacios rechaza 400 antes de llamar al servicio y muestra ayuda en cliente. Mensajes generales persisten al editar y se sustituyen al reintentar.

### AC-02 — Mensajes seguros y recuperables
apiMessage admite causas nulas y respuestas incompletas sin lanzar excepción. HTTP técnicos/inglés no se exponen; preservar mensajes de negocio españoles y mapear sesión/permisos/conflicto/límite/servidor a acciones comprensibles. No declarar éxito ni vacíos confirmados después de una carga fallida.

### AC-03 — Visibilidad contextual
Errores de acciones/contacto en ventas/reservas se ven aunque el scroll esté abajo; contenido confirmado se conserva. Detalle distingue 404 confirmado de fallo al cargar. Guardado de cuenta/publicación conserva borrador y errores generales; permiso/archivo inválido junto a foto. No se añaden reintentos automáticos de mutaciones no idempotentes.

### AC-04 — Matriz integral
Rellenar formularios en UI auxiliar con valores adversos; forzar errores y recuperación en todas las rutas. Verificar errores junto al campo/resumen, visibilidad, acciones, datos preservados, ausencia de éxito falso y excepciones. Cubrir 320/390/430 y texto largo/ampliado; Jest complementa permisos/duplicación sin simular evidencia nativa.

### AC-05 — Evidencia y regresión
Pruebas iniciales reproducen hallazgos, pruebas finales aprobadas, tipos/backend build/lint, exports y check-sdd. Tabla de casos, capturas y resultados reproducibles en verification.md. Hardware/red real se registran como no comprobados cuando no están disponibles.

## Decisiones abiertas

Ninguna. Mantener habilitación de registro original; nombre de espacios recibe ayuda visible y rechazo servidor. No introducir límites nuevos de longitud ni sanear Unicode de contenido válido.
