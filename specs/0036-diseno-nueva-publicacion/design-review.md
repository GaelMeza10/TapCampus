# 0036 — Revisión de conformidad del diseño

Fecha: 2026-11-10. Rol: documenter de Impeccable. Resultado: **conforme al sistema visual existente para el alcance local de 0036**. La aceptación física nativa permanece pendiente por separado.

## Autoridad y alcance de la revisión

Se contrastaron PRODUCT.md, DESIGN.md, `.impeccable/design.json`, el contrato `.impeccable/surfaces/frontend-src-app-publication-edit-tsx.md`, `spec.md`, `verification.md`, `docs/04_UI_UX_GUIDELINES.md`, el flujo documental y la constitución con `Frontend/src/app/publication/edit.tsx`, `theme.js` y los componentes compartidos. Se consultó `.agents/skills/impeccable/reference/document.md` como guía para comprobar correspondencia entre sistema y código. La instrucción de refinamiento local conserva los artefactos globales; esta revisión no regenera el sistema ni sus vistas previas.

## Correspondencia comprobada

| Contrato | Evidencia observada | Juicio |
| --- | --- | --- |
| Verde UABC, Inter y superficies claras | `COLORS.primary` conserva #17613B; background #F8F9F7, blanco y contorno del tema. AppText consume TYPE e Inter local; las capturas registran Regular/SemiBold/Bold. | Conforme; sin identidad nueva. |
| Fotografía protagonista | Zona inicial de ancho completo, alternativa con cámara/galería y mínimo 184; imagen existente con aspectRatio 1.65 y acción Cambiar foto. `publication-photo-390.png` muestra la fotografía cargada y el comienzo de Producto. | Conforme a AC-01 y FIRST VIEWPORT. |
| Formulario abierto por tarea | Producto, Precio y disponibilidad/Precio y Entrega separados por divisores finos; no hay tarjetas envolventes repetidas. Oferta conserva naranja semántico y menor jerarquía; CTA verde en pie blanco. | Conforme a THESIS y AC-01. |
| Reutilización | CustomInput, PrimaryButton, AppText, TypeSelector, Sheet, DataState, InlineMessage y OptionGrid conservados. FormPicker es una composición local de tokens/iconos existentes. | Sin primitivas globales nuevas. |
| Adaptación | SafeAreaView, KeyboardAvoidingView y ScrollView; máximo 640, margen de página del tema y filas apiladas bajo 360 o fontScale >1.2. Controles compartidos de mínimo 52/48, selectores locales de mínimo 72 y estados disabled accesibles. | Conforme en código y revisión auxiliar; hardware separado. |
| Restricciones de entrega | No hay diferencias en package.json/package-lock.json ni assets de producción para este cambio. La imagen seleccionada procede del borrador o publicación; la foto de fixture es evidencia auxiliar. | Sin dependencias ni raster de producción nuevos. |

El tratamiento local de fotografía ancha amplía la composición del formulario; no redefine la proporción cuadrada de las tarjetas de Explorar descrita en DESIGN.md. Los campos blancos ya están admitidos por CustomInput y el sistema vigente.

## Evidencia visual comprobada

Se comprobó la fecha de modificación antes de abrir imágenes: `edit.tsx`, 2026-11-10 16:12:09; PNG finales entre 18:37 y 18:38; `publication-design-result.json`, 18:38:20, hora local. La matriz posterior al código y a la corrección del origen del fixture contiene 38 capturas a 320/375/390/430 y 844 puntos de ancho. Una lectura del JSON confirma cero desbordamientos horizontales (`scrollWidth > width`), excepciones y recursos ausentes.

Inspección visual directa de `Frontend/.local/visual/publication-photo-390.png`, `publication-new-320.png` y `publication-delivery-large-text.png`: foto real visible en edición, entrada fotográfica amplia en creación, jerarquía clara, etiquetas persistentes, pie visible y entrega apilada con texto ampliado simulado sin recortes visibles. Estos tres PNG representativos sustentan el juicio visual; el resto de la matriz se acredita mediante el registro auxiliar EV-01, sin afirmar inspección visual individual de sus 38 imágenes.

EV-02 y EV-03 de `verification.md` registran 15 suites/105 pruebas, tipos y exportaciones Android/iOS aprobados. Este rol revisó ese registro y el código; no volvió a ejecutar esas comprobaciones. Las capturas web y los bundles no acreditan cámara, teclado, gestos, lector de pantalla o Dynamic Type físicos. Windows no dispone de simulador configurado para esa aceptación.

## Conservación y límites

El aviso preexistente `design-sidecar-stale` se reporta y permanece sin reparar: el refinamiento no autoriza refrescar DESIGN.md, el sidecar ni sus vistas previas. Los valores relevantes examinados siguen siendo coherentes con los tokens de esta pantalla; la observación de sincronización no se presenta como un cambio de identidad causado por 0036.

Esta revisión escribe únicamente este archivo. PRODUCT.md, DESIGN.md, sidecar, contrato, vistas previas y código permanecen preservados por el documenter. No se reabre 0034, no se amplía el sistema global y no se realizan acciones sobre datos. La conclusión se limita a conformidad visual y documental de 0036; el cierre de tareas y la convergencia general corresponden a su expediente y evidencia reproducible.
