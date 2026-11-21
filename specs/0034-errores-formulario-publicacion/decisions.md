# 0034 — Decisiones de planificación

- DEC-07 (implementada, 2026-11-21): título y resumen quedan fijos fuera del scroll principal; complementa el encabezado desplazable de 0036 para cumplir AC-01. Resumen limitado al 30% con desplazamiento propio y altura no colapsable, manteniendo usable el formulario y el pie. No se cambia la composición de otras pantallas ni los tokens globales. Aceptación nativa de teclado/texto ampliado permanece abierta.

- DEC-06 (precisión, 2026-11-21): la categoría está antes del precio en la composición vigente 0036. La navegación al primer error usa ese orden real; no se mueve el selector para reproducir la enumeración histórica de AC-03. Se conserva la regla de foco tras layout sin abrir hojas automáticamente.

- DEC-01 (definida, 2026-11-10): el usuario solicita un plan; no modificar componentes ni implementar comportamiento en esta entrega.
- DEC-02 (propuesta técnica del plan): aviso compacto visible debajo del encabezado, mensajes junto a cada campo y desplazamiento al primer error; sin modal ni toast temporal. Continúa la identidad visual vigente. No requiere cambiar una regla de negocio.
- DEC-03 (definida por estructura existente): cubrir Nueva LIVE/STATIC y regresión de Editar porque usan `edit.tsx`; no extender a otros formularios.
- DEC-04 (preservación de alcance): conservar validaciones, payloads, stock/horarios y reglas de oferta existentes; solo mejorar detección conjunta, presentación y recuperación de errores. Sin decisiones de producto abiertas que bloqueen este plan.

- DEC-05 (actualización, 2026-11-21): la petición actual autoriza comenzar el cierre MVP preparando primero los planes y reutilizar este patrón al ejecutar 0038. Sustituye la limitación temporal de DEC-01 para la ejecución futura, sin cambiar la naturaleza documental de aquella entrega. DEC-04 conserva stock/horarios y diseño, pero las reglas/payloads de oferta se actualizan conforme a 0037 y el error de contenido conforme a 0038; no preservar restricciones que esos expedientes corrigen. No hace falta pedir de nuevo autorización para este trabajo ya solicitado.
