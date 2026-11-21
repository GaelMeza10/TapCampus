# Cotejo documental Impeccable — 0035

2026-11-10. Rol `impeccable_documenter`; lectura de `reference/document.md`, PRODUCT.md, DESIGN.md, `.impeccable/design.json`, brief de Mi cuenta y AC-01..04. Resultado: composición local compatible con el sistema vigente. Se preservan DESIGN.md y su sidecar; no corresponde regenerar tokens ni previews por esta extensión.

## Sistema cotejado con el código

Fuentes: `Frontend/src/app/(tabs)/account.tsx`, `Frontend/src/components/account-ui.tsx`, `Frontend/src/theme.js` y muestras de `AppText`, `PrimaryButton` y `Card`.

- Paleta: verde UABC `primary`/`primarySoft` para edición e iniciales, superficies `background`/`white`, separación `border`, texto semántico y rojo `error` para cierre/errores. Coinciden con los valores normativos de DESIGN.md; no se establece un color nuevo.
- Tipografía: Inter local mediante AppText; nombre en `section` (22/30), encabezado de contacto/editor en `heading` (18/25), cuerpo 14/20, etiqueta 14/20 y contexto 13/19. Se conserva la escala TYPE existente.
- Espacio y forma: SPACE de 4/8/12/16/20/24/32, Card blanco con borde de un punto y radio 16, sin sombra; controles compartidos de mínimo 52 y edición compacta de mínimo 48. El monograma circular de 64 es una medida local de identidad, no un token global nuevo.
- Jerarquía local: identidad abierta con iniciales derivadas del nombre real, Editar datos en contexto, contacto agrupado y cierre separado por un divisor. La composición no se convierte en plantilla obligatoria para otras pantallas.
- Reglas conservadas: The Semantic Color Rule, The Compact Header Rule, texto flexible y reutilización de tokens/controles. Esqueleto estático sin movimiento nuevo, iconos Ionicons decorativos y monograma oculto del lector para evitar duplicación del nombre.

El editor conserva sus funciones de 0033: nombre/teléfono precargados, correo solo de lectura, cambios parciales, bloqueo durante envío/cierre, borrador ante fallo y confirmación tras éxito. Este cotejo es de código y documentación; no equivale a una nueva validación de API.

## Evidencia y límites

Se cotejaron el manifest `Frontend/.local/visual/account-design-result.json`, EV-01/02/03 de `verification.md` y `review.md`. El manifest enumera 29 capturas a 320×844, 375×812, 430×932 y 844×390; incluye nombres/correos largos, editor/acciones/éxito, validación, carga/error/reintento y guardado pendiente/fallido. Registra `scrollWidth` igual al ancho en los 29 casos, sin excepciones ni recursos faltantes. El reviewer independiente inspeccionó los 29 PNG finales y dos originales de 0033 y devolvió **ship exclusivamente para composición web auxiliar**, sin hallazgos materiales.

EV-01 registra 15 suites/105 pruebas frontend y TypeScript PASS; EV-03 registra exports Android/iOS PASS. Se citan resultados del pase de implementación: este cotejo documental no volvió a ejecutar pruebas, exports, capturas, detectores ni servicios externos.

La ampliación usa fontScale 1.5 simulado y CSS al 150 %. Safe areas reales, teclado, foco/lectores, escala física y gestos iOS/Android siguen pendientes en dispositivo; Windows no dispone del simulador iOS/AVD configurado. Los bundles y capturas auxiliares no acreditan esos comportamientos. No se aplica un detector HTML/CSS al código React Native.

## Decisión documental

Sin cambios a PRODUCT.md, DESIGN.md, `.impeccable/design.json`, previews o documentación global. No se canonizan ni reparan derivas ajenas a 0035. La ausencia ya declarada de un anillo de foco específico sigue como límite del sistema existente; no se transforma en regla visual ni se declara resuelta. La aceptación nativa permanece abierta y separada del resultado de composición auxiliar.
