# Cotejo de diseño — 0033 Edición de Mi cuenta

Fecha: 2026-11-10. Alcance: extensión funcional local de Mi cuenta, modo Operate. Resultado del reviewer independiente recibido por el coordinador: **ship exclusivamente para composición web auxiliar**, sin hallazgos materiales en los 15 PNG originales. Este cotejo documental confirma continuidad del sistema; no acredita aceptación nativa ni cierra por sí solo todos los AC.

## Fuentes cotejadas

- `PRODUCT.md`, `DESIGN.md` y `.impeccable/design.json`.
- `.impeccable/surfaces/frontend-src-app-tabs-account-tsx.md` y `specs/0033-edicion-mi-cuenta/spec.md`.
- `Frontend/src/app/(tabs)/account.tsx`, `Frontend/src/theme.js` y componentes compartidos `app-text.tsx`, `Card.tsx`, `CustomInput.tsx`, `PrimaryButton.tsx`, `marketplace-shell.tsx` y estados de `feedback.tsx`.
- `Frontend/.local/visual/account-edit-result.json`, existencia de sus 15 PNG y muestreo directo de originales `account-edit-320.png` y `account-profile-save-error-375.png`.
- `specs/0033-edicion-mi-cuenta/verification.md` EV-01/02/03, como registro de comprobaciones técnicas ejecutadas por el implementador; este pase documental no vuelve a ejecutarlas.

## Continuidad observada

| Contrato vigente | Evidencia en el artefacto | Cotejo |
| --- | --- | --- |
| Verde UABC, fondo casi blanco e Inter local | `account.tsx` importa tokens y `AppText`; `theme.js` mantiene primary #17613B, background #F8F9F7 y familias Inter. El manifiesto incluye Regular, SemiBold y Bold. | Conservado |
| Encabezado compacto y superficies discretas | `PageHeader` presenta «Mi cuenta»; `Card` conserva blanco, borde de un punto, radio 16 y ausencia de sombra. | Conservado |
| Ritmo y controles compartidos | Margen y padding de cuenta con SPACE.page (20), separación de campos SPACE.xl (24); inputs y botones normales de mínimo 52, Cancelar compacto de mínimo 48. | Conservado |
| Edición en contexto, correo fijo | Nombre y teléfono cambian a `CustomInput` precargados; correo permanece `AppText` seleccionable. Guardar cambios y Cancelar ocupan la misma tarjeta, sin modal nuevo. | Alineado con AC-03 y dirección local |
| Acciones y estados con significado | Editar datos secundario, Guardar cambios principal, Cancelar ghost y Cerrar sesión destructivo. Error usa `InlineMessage`; éxito usa verde. | Conservada la regla de color semántico |
| Borrador recuperable y envío explícito | Validación visible, guardado habilitado ante cambios válidos; fallo conserva el editor, éxito muestra respuesta confirmada y «Datos actualizados.». Bloqueos de guardado usan componentes existentes. | Alineado con AC-03; pruebas funcionales en EV-02 |
| Navegación y adaptación | `MarketplaceShell` mantiene cuatro destinos y Cuenta seleccionada; safe areas, `ScrollView`, `KeyboardAvoidingView` y texto sin límites de líneas en lectura. | Continuidad de estructura; comportamiento nativo pendiente |

No se introduce un sistema visual nuevo. La estrategia fotográfica de Explorar no impone fotografías al editor de cuenta: `DESIGN.md` ya circunscribe esa composición a Explorar. Las reglas «The Semantic Color Rule» y «The Compact Header Rule» siguen siendo aplicables sin ampliarlas con prohibiciones nuevas.

## Evidencia y límites

El manifiesto contiene 15 capturas: editor, acciones desplazadas y éxito a 320×844, 375×812, 430×932 y 844×390; error, reintento y guardado pendiente a 375×812. Los 15 archivos existen; cada entrada registra `scrollWidth` igual al ancho y listas vacías de excepciones y recursos ausentes. El muestreo muestra correo largo que envuelve en lectura, campos compartidos y error recuperable. Los extractos de texto del manifiesto incluyen rutas conservadas por las pestañas; no se interpretan como contenido simultáneamente visible ni sustituyen la revisión de los PNG.

El reviewer independiente revisó los 15 originales y devolvió ship para composición auxiliar, según el resultado recibido por el coordinador. No se generaron capturas ni previews nuevos durante este pase. La evidencia técnica registrada en EV-01/02/03 comprende 103 pruebas frontend, 26 backend, tipos, build/lint backend y exportaciones Android/iOS PASS. Ese registro no demuestra por sí mismo interacción física ni una nueva actualización de perfil en PostgreSQL real.

Pendientes en iOS/Android: teclado y desplazamiento con teclado abierto, foco y anuncios del lector de pantalla, escala de texto y recorrido físico de edición/guardado/cancelación/error/sesión. El entorno Windows sin iOS/AVD no permite acreditarlos. Las exportaciones comprueban empaquetado; las capturas acreditan composición web auxiliar.

## Registro del sistema

`DESIGN.md` y `.impeccable/design.json` se conservan sin cambios: los tokens y reglas reutilizados describen esta extensión. El sidecar sigue siendo una traducción de componentes para preview, no una implementación Expo ni evidencia nativa.

No se canonizan ni reparan detalles preexistentes ajenos al alcance: `SHADOW.card` permanece declarado sin uso en Card; el indicador textual «!» de error de `DataState` pertenece al componente existente y no se eleva a patrón recomendado de iconografía. Los snippets del sidecar no se regeneran. Ninguno de estos detalles justifica redefinir la identidad de Mi cuenta ni altera el veredicto limitado a composición auxiliar.
