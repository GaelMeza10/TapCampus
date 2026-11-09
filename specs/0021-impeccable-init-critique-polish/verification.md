# 0021 — Verificación

Estado: Verificado (técnico y visual auxiliar; aceptación nativa pendiente) | Fecha: 2026-11-06

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 | EV-01 | PASS: contexto y preferencias confirmados |
| AC-02 | T-02 | EV-02 | PASS: crítica de código y evidencia auxiliar, con límites explícitos |
| AC-03 | T-03 | EV-03 | PASS técnico: recuperación de formulario y fotografía |
| AC-04 | T-04 | EV-04 | PASS: evidencia y convergencia documental |

## EV-01 — Contexto y alcance

[PRODUCT.md](../../PRODUCT.md) registra comprador y vendedor con igual prioridad, plataforma adaptive, reglas del producto y autoridades existentes. [.impeccable/config.json](../../.impeccable/config.json) conserva buildPath=comp: imagen de referencia primero para futuras páginas promocionales, código directo para la app. Respuestas recibidas del usuario; ninguna preferencia se deduce por silencio. DEC-03 confirma el 2026-11-06 que este trabajo modifica código, sin nuevas ediciones Figma.

## EV-02 — Crítica y prioridad

[Crítica íntegra](critique.md): método A nativo, revisión de código y capturas auxiliares previas de 0020 contrastadas con componentes/tokens actuales. Primera valoración provisional: 27/40; no es un estudio observado ni una prueba en hardware. Hallazgos prioritarios: P1, error de formulario fuera de vista; P2, fotografía de detalle sin alternativa al fallo. Se conserva la dirección aprobada, Inter y los flujos de ambos roles.

Snapshot leído mediante critique-storage latest: `2026-11-06T00-09-11Z__frontend-src-app-homepage-tsx.md`. El helper close cerró exactamente ese snapshot tras corregir los dos hallazgos; se conserva la puntuación histórica, sin inventar una segunda valoración. Detector HTML y overlay no aplican a React Native; no se ejecutaron. Questions skipped: 2 Priority Issues; ambas correcciones están dentro del plan aprobado.

SDK Android localizado; `adb devices` sin dispositivos y `emulator -list-avds` sin AVD configurado durante la crítica. Windows sin simulador iOS. No se acredita interacción nativa con capturas web.

## EV-03 — Cambios aplicados al código

`publication/edit.tsx` guarda posiciones de campos y referencias tipadas de los controles nativos. Al rechazar título, descripción, precio o stock, enfoca y desplaza el formulario hasta el campo; conserva el borrador. `CustomInput` transmite la referencia al TextInput real usando los tipos de React Native 0.88. No se alteran validaciones, stock ni contratos.

`publication-photo.tsx` comparte la recuperación entre `Publisher_Card.tsx` y `publication/[id].tsx`: URI ausente o descarga fallida muestra «Sin foto», tamaño estable y nombre accesible. Una URL distinta vuelve a cargar; título, precio, ubicación y CTA siguen disponibles.

`reservation-screen.test.tsx` simula un fallo de descarga en detalle y verifica precio, título, alternativa accesible y botón de apartar sin crear reservas. `publisher-card.test.tsx` conserva cobertura del fallo, la acción y recuperación con URL nueva. Las pruebas de formulario conservan rechazo de stock negativo, borrador, errores y ausencia de envíos indebidos.

Verificación visual auxiliar con las pantallas reales y adapter Axios aislado, sin iniciar ni modificar API/BD: `node scripts/verify-redesign-ui.cjs`. PASS: **33 capturas**, anchos 320/390/430, sin desbordamiento horizontal, controles fuera del ancho, recursos ausentes ni excepciones. [Resultado completo](evidence/visual-result.json). El escenario deja explícitamente el título fuera de vista antes de enviar y comprueba foco, geometría visible y descripción conservada. Después comprueba foco/visibilidad de stock inválido y título conservado. El detalle sin URI conserva precio y acción de reserva. Chrome local ejecutado fuera del entorno restringido tras bloqueo de DevTools; añadido timeout de conexión al verificador.

Muestras revisadas visualmente: [título recuperado](evidence/form-validation.png), [stock inválido](evidence/form-stock-recovery.png), [detalle sin foto](evidence/detail-missing-photo.png), [título largo a 320](evidence/feed-long-320.png). El script cierra Chrome y su servidor temporal al terminar. No se deja un servidor de revisión activo.

## EV-04 — Comandos y convergencia

Desde `Frontend`, Windows, Expo SDK 58 / React Native 0.88.1:

- `node node_modules/typescript/bin/tsc --noEmit`: PASS, salida 0.
- `npm.cmd test -- --silent`: PASS, 12 suites y **44 pruebas**, cero snapshots.
- `node scripts/verify-redesign-ui.cjs`: PASS, 33 capturas y comprobaciones de recuperación descritas en EV-03.
- `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir .local/impeccable-native --max-workers 2`: PASS, bundles Hermes de ambas plataformas y 46 activos. [Metadata persistida](evidence/native-metadata.json). Es exportación JavaScript, no compilación/instalación APK o IPA.
- Desde raíz: `node scripts/check-sdd.mjs` y `git diff --check`: PASS, salida 0. Solo avisos de conversión LF/CRLF de Git. Revisados alcance, referencias y diff de los archivos afectados; docs04, auditoría, trazabilidad, índice y TASKS 5.14 alineados.

Cambios de código limitados a componentes de fotografía, referencias/foco de formulario y cobertura de esos comportamientos. Conservados los cambios anteriores 0019/0020 y archivos ajenos; sin backend, dependencias, migraciones o commit.

## Límites y comprobación nativa pendiente

La aceptación en dispositivo sigue abierta: foco/desplazamiento al abrir teclado iOS/Android, VoiceOver/TalkBack, tipografía ampliada y orientaciones. Áreas compactas Android de 44 frente a 48 dp y movimiento reducido siguen como observaciones de la crítica para revisión nativa. Cámara, WhatsApp y API/Socket.io reales no se recorrieron en este pulido. Las casillas 5.1–5.6 y UAT no se cierran. Las capturas del fixture son evidencia auxiliar, nunca prueba nativa.

## EV-05 — Proyecto iniciado para prueba en iPhone (2026-11-06)

Por solicitud del usuario se inició Docker Desktop, PostgreSQL/Redis existentes, API compilada (puerto 3000) y Expo en LAN con caché renovada (8081). Procesos de aplicación fuera del entorno restringido para admitir conexiones del iPhone; se conserva la conexión local solicitada anteriormente, sin túneles. Wi-Fi 10.41.60.121, EXPO_PUBLIC_API_URL y PUBLIC_BASE_URL locales ya alineados; sin cambiar datos ni repetir seed. `prisma migrate status`: cinco migraciones, esquema actualizado.

Comprobación desde la computadora: LIVE 200/8, STATIC 200/13, manifiesto iOS con runtime exposdk:58.0.0, bundle 200 de 7 085 773 bytes con la API local incluida, PNG 200 y Socket.io websocket conectado. [Resultado persistido](evidence/iphone-start-check.json). QR generado con el codificador local para `exp://10.41.60.121:8081`, guardado como artefacto temporal ignorado. Servicios quedan activos para el usuario. El iPhone debe estar en el mismo Wi-Fi; la recepción efectiva y el recorrido físico siguen por confirmar, sin cerrar 5.1–5.6.
