# 0036 — Diseño de Nueva publicación

Estado: Verificado (técnico y composición auxiliar; hardware separado) | Fecha: 2026-11-10

## Contexto y fuentes

Vendedor: US-03/04/05/11, RF-03/06/11 y RNF-03; TASKS 5.27. Fuentes: docs/04_UI_UX_GUIDELINES.md, docs/05_USER_FLOWS.md, docs/08_DEVELOPMENT_WORKFLOW.md, docs/09_PROJECT_AUDIT.md, docs/10_TRACEABILITY.md y DESIGN.md. El formulario actual usa una franja pequeña para foto y campos de peso visual uniforme. El usuario elige «Foto protagonista y formulario más limpio», conservando verde UABC y funciones actuales.

## Alcance y contratos

Refinar la ruta compartida de creación/edición, con foto amplia, campos agrupados por tarea, selectores reconocibles y publicación visible. Mantener servicios, payloads, reglas LIVE/STATIC, permisos, oferta y navegación existentes. Sin migraciones, imágenes ficticias, pasos obligatorios nuevos ni cambios de identidad. El expediente 0034 de errores conserva su alcance pendiente; este cambio preserva el foco/desplazamiento que ya existe.

## Criterios de aceptación

### AC-01 — Foto protagonista y jerarquía
Al abrir Nueva publicación se ve un área fotográfica amplia, acción de cámara/galería y grupos de producto, precio y entrega. La imagen elegida permanece visible y se puede cambiar. Usar tokens vigentes, sin subtítulo redundante ni tarjetas envolventes repetidas.

### AC-02 — Funciones y datos conservados
LIVE conserva precio, stock, horario y oferta; STATIC excluye esos campos específicos. Selección de zona/categoría, configuración provisional, carga de edición, permisos, envío/error y retorno conservan su contrato. Un error no borra el borrador y enfoca el campo inválido existente.

### AC-03 — Adaptación y evidencia
Formulario desplazable con safe areas y teclado, etiquetas persistentes, controles de al menos 48 y estado bloqueado accesible. Revisar composición auxiliar a 320/375/390/430 y horizontal, texto ampliado simulado y estados representativos. Compilar tipos, ejecutar regresión de formulario y exportar Android/iOS. Separar capturas web de aceptación física.

## Decisiones

DEC-01 resuelta en decisions.md. No hay decisiones de producto abiertas.
