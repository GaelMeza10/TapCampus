---
version: 1
slug: "frontend-src-app-publication-edit-tsx"
primary_target: "Frontend/src/app/publication/edit.tsx"
related_targets: []
---

# Nueva publicación

Modo: Operate. Refinamiento local del sistema existente, code-led. Usuario: vendedor UABC; tarea: fotografiar, describir y publicar con condiciones correctas. Elección confirmada: foto protagonista y formulario más limpio. Sin decisiones abiertas.

## Direction contract

THESIS: la fotografía encabeza el anuncio; el formulario se lee por producto, precio y entrega, evitando una secuencia de controles de idéntico peso.

OWN-WORLD: verde UABC, Inter y superficies claras de TapCampus; divisores finos, inputs blancos y selectores con iconos outline. Sin nuevas primitivas visuales globales.

STORY: elegir tipo, añadir una foto real, describir producto, fijar precio/disponibilidad y lugar/horario; publicar desde un pie visible. Oferta secundaria y opcional.

FIRST VIEWPORT: regreso compacto y título fijo; selector desplazable, área fotográfica de ancho completo, comienzo de Producto. CTA inferior sobre blanco; foto seleccionada llena su marco y ofrece Cambiar foto. 0034 añade resumen persistente fuera del scroll tras errores, con altura máxima del 30% y scroll propio sin colapsar al enfocar.

FORM: ampliación local de la composición existente, no torneo de conceptos; seed: none (unavailable). Filas se apilan con pantalla estrecha o texto ampliado. Gesto distintivo: tocar la imagen para cambiarla, conservando el borrador.

RECOVERY 0034/0038: errores conjuntos y mensajes por campo, navegación tras layout en orden visual; corrección y reintento conservan borrador/foto/URL. Un solo anuncio, sin borrar fallos generales al escribir. 124 pruebas y 19 capturas auxiliares aprobadas; teclado/lector/foco nativos pendientes. Evidencia en specs/0034-errores-formulario-publicacion/verification.md.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
