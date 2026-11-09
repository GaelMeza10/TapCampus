# 0020 — Aplicación del prototipo revisado

Estado: Verificado (técnico y visual web) | Fecha: 2026-11-05

## Contexto

El usuario solicita aplicar al proyecto los prototipos revisados, con plan y validación. Fuentes: 0017/0018/0019; docs/02_REQUIREMENTS.md, docs/03_ARCHITECTURE.md, docs/04_UI_UX_GUIDELINES.md, docs/05_USER_FLOWS.md, docs/07_VALIDATION.md, docs/09_PROJECT_AUDIT.md y docs/10_TRACEABILITY.md. RF-01/02/03/05c/06/07/08/11/12/13; RNF-03; US-01/02/03/04/05/05c/06/07/09/11; TASKS 5.13.

## Alcance y reglas

Aplicar el delta de las copias revisadas (Figma 78:292) sobre las pantallas reales existentes. Conservar Inter, tokens, imágenes dinámicas y servicios. Estados asociados a respuestas reales; nunca reproducir el envío temporizado del prototipo. Sin cambios de API, BD, dependencias ni nuevas funciones. Las ilustraciones de productos y barra de estado de Figma son muestras, no activos de negocio para fijar en la app. Conservar precios por reserva, claves de reintento, filtros provisionales, confirmaciones y privacidad LIVE/STATIC.

### AC-01 — Navegación y encabezados

Sin subtítulos redundantes en acceso/registro/explorar/reservas/ventas; avisos funcionales intactos. Iconos brújula/comprobante/bolsa locales de Figma y etiquetas accesibles. Ventas con pestañas Con horario/Catálogo visibles, selección explícita y misma lógica de tipos/estados.

### AC-02 — Publicaciones y contenido adaptable

Todas las tarjetas usan fotografía de 100 puntos o fallback, estado/título/precio/ubicación/contexto en orden uniforme. Precio anterior solo con procedencia. Detalle desplazable y acción accesible, textos largos y anchos 320/390/430 sin desbordamiento.

### AC-03 — Formularios y confirmaciones

Componentes compartidos, campos y controles de al menos 44 puntos, campos de 52; errores junto al campo correspondiente, servidor como aviso general, borrador conservado y edición/envío bloqueado mientras se procesa. Confirmaciones desplazables para texto largo. Envíos/errores/carga reflejan resultados reales.

### AC-04 — Regresión y evidencia

Tipos, pruebas de interacción existentes y nuevas de los cambios, exportaciones Android/iOS y capturas web de pantallas reales con fixture aislado. Registrar AC→T→EV; no equiparar capturas web con recorrido físico de cámara, teclado, WhatsApp o UAT.

## Decisiones

DEC-01/02 resueltas en decisions.md.
