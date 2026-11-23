# 0040 — Verificación y convergencia

Estado: Regresión técnica actual aprobada; aceptación física, distribución y UAT pendientes | Revisión: 2026-11-22

Revisión actual: [dictamen y pendientes del MVP](revision-mvp.md), [resumen nuevo](evidence/mvp-audit.json). 292 pruebas, tipos de ambas capas, build/lint backend, check-sdd y 674 HTTP fase2/3 nuevos PASS, con hashes/recuentos originales conservados. INC-0040-01 fue corregido y verificado técnicamente en 0045; ya no es un bloqueo funcional abierto. No se cerraron aceptación nativa, distribución ni UAT.

Ejecución histórica 2026-11-21: [resultados por caso](resultados-casos-limite.md) y [evidencia consolidada](evidence/casos-limite-resultados.json). 134 pruebas frontend/102 backend, tipos/build/lint/exports y 674 solicitudes fase2/3 aprobadas. Chequeos adicionales: 49 variantes, 48 PASS y un fallo CL-18; ocho variantes Android y 19 capturas auxiliares aprobadas dentro de su alcance. No son 43 casos nativos completos. El fallo CL-18 y el problema de conexión iPhone describen esa sesión, no una reproducción nueva.

## Evidencia prevista

Registrar versión frontend/API, plataforma/OS, servicios, fecha, dataset y pasos reproducibles. No copiar PASS antiguos como si fueran ejecución nueva ni almacenar JWT/teléfonos completos.

| AC | Tarea(s) | Evidencia prevista | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-07 | EV-01: revision-mvp.md y evidence/mvp-audit.json; 292 pruebas, tipos/build/lint/check-sdd actuales PASS; exports previos justificados en 0045; INC-0040-01 corregido | PASS de regresión; versión y artefactos finales de entrega pendientes |
| AC-02 | T-02, T-07 | EV-02: ocho variantes Android comprobadas, 19 capturas auxiliares y tabla de 43 casos con cobertura explícita | Parcial: iPhone, variantes y recorridos físicos pendientes |
| AC-03 | T-03, T-07 | EV-03: evidence/mvp-phase3.json, ejecución 2026-11-22 con PostgreSQL/Redis reales, carreras, reinicio y dos clientes | PASS técnico; 20 min reales y sesiones móviles pendientes |
| AC-04 | T-04, T-07 | EV-04: origen persistente HTTPS, imagen/WebSocket y reinicio/recuperación | Pendiente |
| AC-05 | T-05, T-07 | EV-05: artefacto/hash/versiones e instalación limpia con recorrido | Pendiente |
| AC-06 | T-06, T-07 | EV-06: cinco participantes anonimizados, tareas, tiempos y fallos | Pendiente |
| AC-07 | T-06, T-07 | EV-07: piloto semana, tres vendedores/quince compradores e informe de cierre | Pendiente |

## Convergencia

### EV-02 — INC-0040-02, selector de horario iPhone (2026-11-21)

AC-02 → T-08/T-07: reporte del usuario en Nueva publicación, Inicio/Fin con rectángulo gris y rueda defectuosa al tocar. La implementación iOS usa DatePicker SwiftUI wheel dentro de Host con altura explícita de 216 y ancho del panel, sin matchContents. Conserva resumen, selección provisional y Guardar/cerrar en edit.tsx. Android/web mantienen el adaptador instalado; no se cambia API, BD, dependencias ni servicios.

- `cd Frontend; npm.cmd test -- --runTestsByPath __tests__/publication-form.test.tsx __tests__/sale-time-picker.test.tsx`: PASS, 2 suites/20 pruebas. Incluye descarte al cerrar, persistencia al guardar, independencia Inicio/Fin en edición, secuencia fecha/hora/dismiss Android y contrato de montaje/cambio iOS con primitivas simuladas.
- `cd Frontend; npx.cmd tsc --noEmit`: PASS.
- `cd Frontend; npx.cmd expo export --platform ios --output-dir .local/selector-horario-ios`: PASS; bundle `entry-54228b03c256c2fa745a60a1fdccbb16.hbc`. Export local ignorado; no instalador ni comprobación visual.
- `node scripts/check-sdd.mjs` y `git -c core.safecrlf=false diff --check`: PASS.
- Referencia de integración: [Expo SDK 58 DatePicker](https://docs.expo.dev/versions/v58.0.0/sdk/ui/swift-ui/datepicker/) y código instalado de Host/adaptador community. Se evita el autoajuste vertical dentro del ScrollView, sin atribuir un fallo nativo confirmado a Expo.

Pendiente: abrir Inicio/Fin en el iPhone con Expo Go, comprobar ruedas visibles desde el primer momento, desplazarlas, guardar, reabrir y cerrar sin guardar. Las pruebas con mocks y el bundle no acreditan la representación ni los gestos nativos; INC-0040-02 y T-08 permanecen abiertos hasta esa comprobación. Ningún cambio visual global ni evidencia de captura nativa añadida.

Registro histórico 2026-11-21: INC-0040-01 se reprodujo por POST /auth/register con nombre de tres espacios y otros datos válidos: respondió 201 en lugar de 400; referido a RF-02/0002. Su corrección posterior está en 0045 EV-01, con rechazo 400 antes de invocar el servicio. T-01/T-02/T-03/T-07 conservan los pendientes detallados en revision-mvp.md. No cerrar TASKS 5.1–5.6/6.2/6.3 ni declarar iPhone o los 43 casos aprobados. Infraestructura, instalación y UAT conservan sus dependencias originales.

## EV-05 — APK local generado

AC-05/T-05: assembleRelease PASS, APK Android arm64 de 35.412.852 bytes, firma v2 verificada y aplicación no depurable. Artefacto local: entrega/TapCampus-1.0.0-arm64.apk; hash y herramientas en evidence/apk-local.json. Firma de demostración; no es publicación en Play Store. No requiere Expo Go ni Metro. Conserva la API actual; no empaqueta el backend. Instalación física y recorrido contra el entorno final siguen pendientes; T-05 no se marca completa.
