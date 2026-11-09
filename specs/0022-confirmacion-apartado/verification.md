# 0022 — Verificación y convergencia

Estado: En verificación; implementación técnica y recorrido básico iPhone aprobados | Fecha: 2026-11-06

## EV-00 — Inspección y planificación

Durante la planificación se inspeccionaron ambas llamadas directas y el diálogo de cancelación existente, sin modificar código en ese momento. El usuario aprobó después implementar el plan. Esta sección conserva el antecedente; la implementación y evidencia nuevas figuran abajo.

## Matriz de evidencia prevista

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-03, T-04, T-06 | EV-01 | PASS automatizado y apertura/Volver confirmados por usuario en iPhone |
| AC-02 | T-01, T-02, T-04, T-06 | EV-02 | PASS automatizado |
| AC-03 | T-01, T-02, T-04, T-06 | EV-03 | PASS automatizado |
| AC-04 | T-02, T-04, T-06 | EV-04 | PASS automatizado |
| AC-05 | T-03, T-05, T-06 | EV-05, EV-06 | PASS técnico y visual auxiliar; VoiceOver/texto ampliado/retorno de foco nativos pendientes |

## EV-01..04 — Comportamiento

`reservation-screen.test.tsx`: 14 pruebas cubren apertura/Volver/regreso del sistema sin reserve/UUID, solicitud pendiente con doble toque y cierre bloqueados, éxito, reintento con misma clave, otra unidad con clave nueva solo al confirmar, cierre/reapertura tras error y recuperación tras 404 del detalle. También stock cero, fin por refresco/reloj, revisión de precio, 409, STATIC, cancelación existente y aislamiento de respuestas al cambiar de producto. [Resultados](evidence/tests.json).

## EV-05 — Interfaz y recorrido iPhone

`ConfirmationDialog` compartido admite deshabilitación y texto de carga opcionales; mantiene valores anteriores por defecto. Se añadieron foco al encabezado, retorno al activador cuando existe, anuncio de envío/error y exclusión del fondo del lector. Tipo/estilo Inter, paleta y safe areas conservados.

`node scripts/verify-redesign-ui.cjs`: PASS, 38 capturas a 320/390/430, sin desbordamiento horizontal, recursos ausentes ni excepciones. Revisadas [confirmación](evidence/reservation-confirm.png), [texto largo a 320](evidence/reservation-confirm-long-320.png), [error](evidence/reservation-confirm-error.png) y [enviando](evidence/reservation-confirm-sending.png). [Resultado completo](evidence/visual-result.json). El verificador espera la desaparición tras el cierre animado; la primera espera fija de 200 ms resultó insuficiente. Servidor/Chrome del fixture cerrados al terminar.

El usuario confirmó desde su iPhone «Sí, funciona como indicas» al preguntar si el modal aparece y Volver regresa sin crear reserva. Es evidencia de ese recorrido básico, no de VoiceOver, tipografía ampliada o retorno de foco. Estas comprobaciones siguen abiertas en T-05.

## EV-06 — Comandos

Frontend: `npm.cmd test -- --silent --json --outputFile=.local/confirmation-0022-tests.json` → 12 suites, 54 pruebas PASS. `node node_modules/typescript/bin/tsc --noEmit` → PASS. `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/confirmation-0022-native --max-workers 2` → PASS, dos bundles Hermes y 46 activos; [metadata](evidence/native-metadata.json). Raíz: check-sdd y diff --check aprobados al cerrar documentación. Sin cambios backend, dependencias o datos para esta feature; la ampliación posterior de fotos se registra separadamente en 0023.

## Convergencia

Código, reglas RF-07 y docs04/05 alineados; referencia aditiva en 0001, índice y TASKS actualizados. No se marca AC-05 completo por faltar aceptación nativa específica. No se cierra 5.15 ni 5.1–5.6. No se ejecutaron reservas reales desde las herramientas.
