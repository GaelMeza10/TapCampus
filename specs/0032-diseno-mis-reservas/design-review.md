# Revisión documental del sistema visual — 0032

Fecha: 2026-11-10. Rol: Impeccable Documenter. Alcance: refinamiento local de Mis reservas dentro del sistema fotográfico 0031; sin identidad, tokens ni componentes globales nuevos.

## Dictamen y conservación

La implementación reutiliza el sistema vigente. Se conservan íntegros `DESIGN.md` y `.impeccable/design.json` conforme a la regla de ordinary extension de `agents/impeccable_documenter.toml`: no regenerar el sistema por una composición local. Este informe es el único archivo escrito por este pase. La distribución de foto, plazo e historial pertenece a esta superficie y no se convierte en regla para Explorar, detalle o vendedor.

Fuentes cotejadas: `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `.agents/skills/impeccable/reference/document.md`, `.impeccable/surfaces/frontend-src-app-tabs-reservations-tsx.md`, especificación y verificación 0032; implementación en `reservations.tsx`, `buyer-reservation-card.tsx`, `reservation-list-state.tsx`, `reservation-presentation.ts`; tema y primitivas compartidas `theme.js`, `AppText`, `Card`, `PrimaryButton` y `PublicationPhoto`.

## Correspondencia con la implementación

| Regla o token existente | Evidencia del resultado |
| --- | --- |
| Verde UABC, blanco suave y contornos discretos | Importación de `COLORS`; `Card` blanco con borde de un punto y radio `lg`; bloque de plazo `primarySoft` con texto `primary`; sin sombras nuevas. |
| Inter local y escala existente | `AppText`: producto activo `heading` 18/25; precio reservado `price` 24/32; reloj `countdown` 20/28; historial `label` y precio `heading`; apoyo `caption` 13/19. |
| Ritmo y formas compartidos | Margen `SPACE.page` 20; tarjetas y separaciones principales `SPACE.lg` 16; acciones separadas por `SPACE.sm` 8; bloque de plazo `SPACE.md` 12 y radio `sm` 10; controles compactos con mínimo 48 y radio `full`. |
| Semantic Color Rule | Cancelar usa `danger-ghost` rojo. Plazo vigente y entrega confirmada usan verde; cancelación/vencimiento terminales usan neutro y texto/icono explícitos. No se introduce naranja para la urgencia. |
| Compact Header Rule y texto flexible | Encabezado breve desplazable; `SectionList` con Por recoger/Anteriores y conteos. Sin truncado añadido; nombres flexibles. Ancho menor de 360 o `fontScale > 1.2` apila producto activo y acciones. |
| Fotografías reales con alternativa estable | `PublicationPhoto` reutilizado con `publicationImageUrl`; alternativa Sin foto ante ausencia o error. Foto activa 104×112, historial 72×80; rama apilada con relación 2:1. Son medidas locales, no tokens globales nuevos. |
| Precio fijado y autoridad del servidor | Se muestra `unitPrice`; agrupación por estado de servidor y pendientes por plazo; ACTIVE fuera de plazo muestra Plazo terminado; actualizando. Las etiquetas de unidad se calculan antes de separar secciones. |
| Recuperación y acciones autorizadas | WhatsApp condicionado a contacto disponible y reserva accionable; cancelación por unidad con confirmación. Carga estática accesible, vacío hacia Explorar, error con Reintentar y error sobre datos previos mediante `InlineMessage`. |

La foto lateral en anchos normales y el historial sin caja son variantes de composición de reservas. La foto superior cuadrada documentada para publicación/Explorar sigue siendo propia de esa superficie; no requiere reemplazar el sistema fotográfico. Se mantienen navegación y primitivas compartidas.

## Evidencia cotejada y límites

`Frontend/.local/visual/reservations-result.json` contiene 22 entradas finales; se verificó que existen sus 22 PNG, que `scrollWidth` no supera el ancho en ninguna entrada y que las listas de excepciones y recursos faltantes están vacías. El manifiesto cubre normal, nombres largos e historial a 320/375/430 y horizontal 844; incluye carga, vacío, error/reintento, espera de servidor, foto ausente, cancelación y texto ampliado. Muestreo visual directo de los originales finales `reservations-normal-375.png`, `reservations-reservation-history-375.png` y `reservations-large-text-375.png`: producto/precio destacados, plazo separado, historial compacto y apilado con nombre largo corresponden al código. Este muestreo documental no sustituye la revisión independiente de los 22 originales comunicada por el responsable de la implementación.

EV-01/03 de `verification.md` registran 15 suites/100 pruebas, tipos y exportaciones Android/iOS PASS; son resultados del pase de implementación, no ejecuciones repetidas por el documenter. El finish reviewer independiente comunica `ship` exclusivamente para composición auxiliar y ausencia de defectos materiales en los 22 originales. La aceptación nativa permanece pendiente: Windows sin simulador iOS ni AVD configurado. Las capturas web, la simulación de texto al 150 % y los bundles no certifican gestos, VoiceOver/TalkBack, Dynamic Type físico, WhatsApp real ni rendimiento en hardware. No hay detector React Native aplicable ni comp/QUALITY BAR independiente; este refinamiento se contrasta con AC-01..04 y el sistema existente.

## Drift no canonizado

No se observa drift nuevo de tokens o identidad en esta superficie. `SHADOW.card` continúa declarado pero sin uso en `Card`, situación ya descrita en `DESIGN.md`; no se convierte en regla ni se elimina. El frontmatter y los snippets HTML/CSS existentes representan el sistema para intercambio y vista previa: la implementación nativa conserva `minHeight` y sus variantes compactas, conforme a la prosa vigente. No se reparan ni amplían esas representaciones preexistentes en este alcance. Las limitaciones de evidencia nativa tampoco se convierten en aprobación global.
