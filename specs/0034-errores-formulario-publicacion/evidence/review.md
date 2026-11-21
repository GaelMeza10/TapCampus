# Revisión del formulario — 2026-11-21

Veredicto: aprobado técnico y composición auxiliar; aceptación nativa pendiente.

Se revisaron pantalla real y estados de validación conjunta, contenido rechazado, fallo de guardado, catálogo y texto ampliado, en Chrome sin ventana. 19 capturas a 320×844, 375×812, 430×932 y 844×390, más muestra de fontScale 1.5. Cero excepciones/recursos ausentes y sin desbordamiento horizontal. Se comprobaron altura positiva del aviso fuera del scroll, desplazamiento real hasta el final, foco de título por encima del pie y conservación del borrador al recuperar el catálogo.

La primera revisión descubrió que ScrollView del aviso podía colapsar al enfocar. Se corrigió con flexBasis auto y sin flexShrink, manteniendo maxHeight 30 % y contenido desplazable; se endureció la aserción para exigir altura >=40, no solo límites de posición. Se revisaron las capturas posteriores.

Muestras inspeccionadas: form-content-320.png, form-errors-focus-320.png, form-errors-focus-375.png, form-errors-bottom-844.png y form-errors-large-text.png. Mensajes completos, icono/texto junto al error, controles disponibles y tema vigente conservados. El encabezado/título permanece fijo para dar contexto al aviso; categoría sigue antes del precio según el diseño actual.

Límites: son capturas web auxiliares; no acreditan teclado nativo, VoiceOver/TalkBack, gestos ni rendimiento de hardware. Sin reparación del sidecar de Impeccable ajena al alcance; DESIGN.md describe el patrón actual.
