# Revisión independiente de cierre — 0036

## 1. Disposition: ship

Fecha: 2026-11-10. Veredicto limitado a composición web auxiliar y revisión estática del refinamiento local de `Frontend/src/app/publication/edit.tsx`. No se encontraron problemas materiales en ese alcance. No acredita aceptación nativa ni cierra hardware, 5.4 o UAT.

Petición: «cambia el modulo de nueva publicacion se ve muy generico». Dirección confirmada: «Foto protagonista y formulario más limpio», preservando verde UABC y funciones actuales. Revisión code-led de la composición construida, sin comp aprobado ni gates de fidelidad.

## 2. Validez y cobertura de evidencia

Se abrieron mediante `view_image` los 38 PNG actualizados del manifiesto `Frontend/.local/visual/publication-design-result.json`, además de la referencia previa `form-live.png`. Se inspeccionó la matriz completa de nueva publicación, entrega, oferta programada, catálogo, foto seleccionada, título inválido y stock inválido a 320×844, 375×812, 390×844, 430×932 y 844×390; también texto ampliado simulado, entrega ampliada y hoja de zona a 390×844.

Las imágenes seleccionadas están cargadas y pintadas en los cinco tamaños. No hay regiones en blanco por carga, fuentes ausentes ni desbordamientos horizontales visibles. En horizontal la altura muestra una parte del formulario desplazable y conserva el CTA; no se interpreta el recorte del viewport como truncamiento permanente. El manifiesto informa `scrollWidth` igual al ancho solicitado, cero excepciones y cero recursos ausentes. Los errores muestran el campo correspondiente con mensaje y borrador conservado.

Comando reproducible desde `Frontend`: `node scripts/verify-redesign-ui.cjs --publication-design-only --reuse-bundle`; sin `--reuse-bundle` genera el bundle de revisión. El verificador conserva ahora el origen compilado al reutilizar el bundle y espera `img.complete && naturalWidth > 0` antes de capturar foto.

Histórico: la primera matriz obtuvo `recapture` porque los cinco estados de foto estaban blancos por un origen de imágenes obsoleto en el verificador. Esta revisión completa vuelve a abrir los 38 PNG regenerados y sustituye aquel veredicto; la implementación visual no cambió durante la recaptura.

El paquete informa 105 pruebas frontend, TypeScript y exportaciones Android/iOS PASS. Se consideran evidencia técnica complementaria; este reviewer no volvió a ejecutar esas comprobaciones. No se ejecutó detector HTML/CSS, porque la superficie de producción es React Native adaptativa. Se cotejaron craft-floor, las guías iOS/Android, PRODUCT.md, DESIGN.md, las reglas UI/UX y el contrato de superficie.

## 3. Comparación con la dirección

AC-01: el área fotográfica reemplaza la franja compacta de `form-live.png`, tiene ancho del formulario y una acción reconocible de cámara/galería. En edición la foto real ocupa su marco, con «Cambiar foto» legible. Los grupos abiertos Producto, Precio y disponibilidad y Entrega, separados por divisores finos, reducen el peso uniforme de la secuencia anterior. Los inputs blancos, Inter, verde UABC e iconos outline pertenecen al sistema vigente; no hay tarjetas envolventes repetidas ni imágenes nuevas de producción.

AC-02: la lectura de `edit.tsx` conserva carga del borrador, servicios/payloads, cambio LIVE/STATIC, precio/stock/horario/oferta, selección de zona/categoría, bloqueo durante envío y retorno a ventas. La oferta permanece secundaria. Las capturas de validación y stock conservan contenido y muestran errores junto a su campo. La inspección estática y la regresión informada apoyan la continuidad del contrato; no equivalen a un recorrido integrado con API real.

AC-03: la estructura mantiene `SafeAreaView`, `KeyboardAvoidingView`, `ScrollView`, etiquetas persistentes y CTA fuera del scroll. Los estilos reutilizan tokens; filas apiladas bajo 360 puntos o `fontScale > 1.2`, inputs con mínimos compartidos y selectores de 72 puntos. A 320 y en la simulación de texto ampliado las filas crecen sin colisión; horarios y mensajes permiten wrap. A 375 los horarios ocupan hasta tres líneas, permaneciendo completos y accionables. La hoja de oferta y la de zona conservan jerarquía y acciones distinguibles.

## 4. Hallazgos materiales con archivos

Ninguno en el alcance auxiliar revisado. No se prescribe un lote de correcciones ni una reconstrucción de `Frontend/src/app/publication/edit.tsx` o `Frontend/src/components/CustomInput.tsx`.

El defecto del verificador `Frontend/scripts/verify-redesign-ui.cjs` que invalidó la primera matriz quedó resuelto en la evidencia nueva. El expediente 0034 mantiene su alcance separado; este veredicto no amplía ni cierra ese plan de errores.

## 5. Límites de aceptación

No hubo simulador iOS, emulador Android ni dispositivo físico. Las capturas de navegador acreditan composición auxiliar; la ampliación se simuló y no demuestra Dynamic Type/fontScale nativos. Quedan fuera de este `ship`: teclado e IME, safe areas reales, lectores de pantalla/foco anunciado, gestos Back, permisos y retorno de cámara/galería, controles de fecha nativos, movimiento reducido y rendimiento en hardware. Tampoco se verificaron apariencia oscura ni contraste aumentado como nuevas variantes; el contrato revisado conserva el tema claro existente.

Estos límites deben permanecer explícitos en `verification.md` y en el cierre de la tarea. El veredicto autoriza continuar el cotejo documental del refinamiento; no permite marcar aceptados los recorridos móviles pendientes.
