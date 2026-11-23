# Resultados de casos límite — ejecución parcial

**Actualización posterior 2026-11-22:** [0045 EV-01](../0045-errores-y-datos-adversos/verification.md) corrige técnicamente INC-0040-01: registro normaliza y rechaza nombre de espacios con 400 antes de invocar el servicio. Pruebas HTTP aisladas cubren espacios/tabulaciones/NBSP/tipos inválidos y nombre Unicode/largo válido. El fallo y las frases de estado de la ejecución histórica de abajo se conservan como evidencia de 2026-11-21; no acreditan el estado actual del código ni se convierten retroactivamente en PASS. La aceptación física de CL-18 y el cierre integrado siguen separados.

Fecha local: 2026-11-21 | Base de código: c33c060 | [Plan](casos-limite.md) | [Datos de ejecución](evidence/casos-limite-resultados.json)

## Resultado

Se ejecutaron las suites actuales, 49 chequeos HTTP adicionales, 19 capturas web auxiliares y ocho variantes nativas en emulador Android. **No se aprobaron los 43 casos completos.** iPhone quedó bloqueado al abrir el proyecto por LAN; el usuario informó «opening project». Se detuvieron los auxiliares y se volvió al arranque habitual para simplificar la conexión. No se modificó código funcional para ocultar o corregir hallazgos.

| Bloque | Resultado observado |
| --- | --- |
| Frontend Jest | 16 suites, 134 pruebas aprobadas; tipos completos aprobados. |
| Backend Jest | 11 suites, 102 pruebas aprobadas; tipos/build/lint aprobados. |
| Contratos fase 5 | Aprobados. |
| Integración fases 2/3 | 288 + 386 = 674 solicitudes registradas; 12 + 20 grupos aprobados. PostgreSQL/Redis aislados, dos clientes Socket.io, concurrencia y reinicio reales. |
| Chequeos adicionales 0040 | 49 variantes: 48 aprobadas y una fallida. El helper contabilizó 64 solicitudes HTTP; upload/reserva de preparación y health checks quedan fuera de ese contador. |
| Android nativo | Ocho variantes observadas sin cierre ni pantalla roja de la app; ver alcance por caso debajo. Android 16/API 36, emulador x86_64, Expo Go 58.0.5, SDK 58. |
| Web auxiliar | 19 capturas actuales de formulario, sin excepciones ni recursos ausentes. No equivalen a prueba de teclado/permisos nativos. |
| Exportaciones | Bundles Android/iOS aprobados; huella de metadata en el JSON. No se generó APK ni se acredita distribución. |
| Datos originales | Hashes y recuentos iguales antes/después de las tres ejecuciones aisladas. |

## INC-0040-01 — Registro acepta nombre compuesto solo por espacios

**Caso:** CL-18. **Resultado funcional:** Fallido. **Estabilidad:** servidor responde de manera controlada; no se observó cierre de la app por este hallazgo. **Severidad:** S2 por persistir un dato obligatorio sin contenido útil.

Reproducción en una API de pruebas: enviar POST /auth/register con nombre de tres espacios y correo institucional, contraseña y teléfono válidos de fixture. Se esperaba 400; respondió **201 y creó la cuenta**. Los otros campos se omitieron de la evidencia para no registrar credenciales. El formulario móvil usa trim y evita ese envío; el servidor no debe depender solo del cliente. Título/descripción y edición del nombre sí rechazaron espacios por HTTP.

Referencia de corrección: RF-02/0002 y 0040 T-07. Sigue **sin corregir**: esta ejecución solicitaba probar. Antes de cerrar el hallazgo, normalizar/validar el nombre en servidor y repetir registro normal, espacios, 200 letras y edición propia. El ejecutor adicional conserva el fallo y termina con código no cero al cerrar el fixture.

## Cobertura de los 43 casos

«Parcial» describe evidencia disponible, no una aprobación del caso completo: faltan variantes, ejecución nativa o plataforma física. «Bloqueado» indica que no se ejecutó el recorrido requerido. Las pruebas técnicas simuladas no se presentan como interacción física.

| Caso | Cobertura / estado | Qué se comprobó y qué falta |
| --- | --- | --- |
| CL-01 | Bloqueado | No se ejecutó modo avión/arranque sin red. Conexión iPhone bloqueada; emulador no se usó para afirmar conectividad física. |
| CL-02 | Parcial | Jest cubre error/refresco del feed y conserva navegación. Falta pérdida real de red en app cargada. |
| CL-03 | Parcial | Jest conserva clave tras respuesta incierta; HTTP real comprueba idempotencia y descuento único. Falta interrumpir red durante envío desde teléfono. |
| CL-04 | Parcial | Jest cubre upload fallido, borrador y URL reutilizable. Falta corte real en ambas etapas desde dispositivo. |
| CL-05 | Parcial | Dos clientes Socket.io y resincronización REST aprobados. Falta retorno físico del fondo con red interrumpida. |
| CL-06 | Parcial | Jest comprueba error recuperable de feed/perfil. Falta hacer inaccesible la API durante uso nativo. |
| CL-07 | Parcial | Android: acceso vacío muestra correo requerido y sigue utilizable; API vacío 400. Quedan variantes con un solo campo vacío e iOS. |
| CL-08 | Parcial | Android: Crear cuenta deshabilitado con registro vacío; API vacío 400. Quedan omisiones individuales nativas. |
| CL-09 | Parcial | Android: LIVE vacía muestra aviso y mensajes de foto/título/descripción sin enviar. Jest comprueba validación conjunta; falta completar aceptación iOS/foco. |
| CL-10 | Parcial | Android: cambio a STATIC y envío vacío conservan validación aplicable; Jest/HTTP distinguen campos por tipo. Falta recorrido iOS. |
| CL-11 | Parcial | HTTP rechaza nombre/teléfono vacíos; Jest comprueba borrador y bloqueo. Falta recorrido nativo de cuenta. |
| CL-12 | Parcial | HTTP rechaza abc/1e3 como texto en precio/stock. Falta pegado desde teclado del teléfono. |
| CL-13 | Parcial | HTTP y Jest rechazan negativos, sin guardar. Falta cubrir todas las variantes de creación/edición en teléfono. |
| CL-14 | Parcial | HTTP rechazó inválidos y aceptó 0.01 y 99999999.99 exactamente. Falta presentación nativa de ambos extremos. |
| CL-15 | Parcial | HTTP rechazó fracción/fuera de rango/cero inicial; aceptó cero y máximo en edición. Falta recorrido nativo completo. |
| CL-16 | Parcial | HTTP persistió nombre de 200 letras en registro/perfil. Android aceptó 200 letras verificadas en el input; falta mostrar/editar ese nombre guardado en las demás vistas. |
| CL-17 | Parcial | HTTP guardó título de 200, descripción de 5000 y símbolos/Unicode. Falta presentación de todos esos valores en nativo. |
| CL-18 | Fallido | Registro de nombre con espacios respondió 201. Título/descripción y edición de nombre respondieron 400. INC-0040-01 abierto. |
| CL-19 | Parcial | HTTP y Jest rechazan dominios/formato incorrectos; integración base cubre duplicados. Falta recorrer todas las variantes en teléfono. |
| CL-20 | Parcial | HTTP rechaza teléfonos inválidos y normaliza ambos formatos mexicanos; Jest cubre el helper. Falta comprobar todas las entradas nativas. |
| CL-21 | Parcial | Jest comprueba guardado único y bloqueo durante solicitud pendiente. Falta doble toque con creación real LIVE/STATIC desde teléfono. |
| CL-22 | Parcial | Jest comprueba bloqueo de perfil durante guardado, navegación y logout. Falta interacción nativa con red lenta. |
| CL-23 | Parcial | Jest bloquea doble confirmación/cierre/contacto; HTTP comprueba la misma clave concurrente. Falta recorrido móvil completo. |
| CL-24 | Parcial | PostgreSQL/Redis reales: carreras de entrega/cancelación/worker y liberación única. Falta acción simultánea en dos interfaces móviles. |
| CL-25 | Parcial | Android: diálogo real de cámara denegado muestra «Permite usar la cámara…» y permite continuar. Falta galería/iOS. |
| CL-26 | Bloqueado | No se ejecutó revocación posterior desde ajustes. |
| CL-27 | Bloqueado | No se ejecutó cancelación de selector con/sin foto previa. |
| CL-28 | Parcial | Integración HTTP cubre tamaño/formato inválidos. Falta selección y transformación de archivo desde galería real. |
| CL-29 | Parcial | Android: solicitar giro y volver al formulario conserva orientación portrait y borrador. Faltan acceso/detalle/diálogo y iOS. |
| CL-30 | Parcial | Web auxiliar cubre texto ampliado y formulario; no acredita teclado/lector del teléfono. |
| CL-31 | Parcial | Android: título del borrador permanece al volver desde Inicio/tareas recientes sin terminar proceso. Falta iOS y foto seleccionada. |
| CL-32 | Bloqueado | No se comprobó cierre forzado después de guardar/apartar y recuperación de sesión/plazo. |
| CL-33 | Parcial | HTTP devuelve ventas/reservas vacías de cuenta nueva; Jest comprueba estados vacíos. Falta recorrido nativo de todos los listados. |
| CL-34 | Parcial | HTTP devolvió [] sin coincidencias; Jest cubre filtros y limpieza conservando selección. Falta recorrido nativo. |
| CL-35 | Parcial | Jest cubre imagen fallida y conservación de acciones; en Android se observó alternativa Sin foto para el PNG de fixture sin bloquear detalle. Falta URL inexistente/red como variantes nativas explícitas. |
| CL-36 | Parcial | Jest verifica URL, contexto y fallo de Linking. En Android solo se observó el botón; no se abrió WhatsApp. iPhone bloqueado. |
| CL-37 | Parcial | HTTP real: última pieza 1×201/49×409 y reintento 1×201/49×200. Falta repetir con dos sesiones móviles. |
| CL-38 | Parcial | HTTP real: cierre/fin bloquean nuevas reservas y mantienen entrega/contacto de previas. Falta interacción nativa completa. |
| CL-39 | Parcial | Reinicio/worker y expiración con fechas simuladas aprobados. La espera adicional de 20 min reales quedó sin completar al detener el fixture; no se declara aprobada. |
| CL-40 | Parcial | HTTP/SQL/Redis y Jest comprueban mínimos, modos/retirada, horario e inmutabilidad. Falta recorrido nativo de todas las variantes. |
| CL-41 | Parcial | HTTP comprueba JWT inválido/vencido; Jest comprueba retirada de rutas protegidas en 401. Falta sesión vencida real en dispositivo. |
| CL-42 | Parcial | HTTP rechaza ajeno 403 y protege contactos; Jest cubre navegación/sesión. Falta cambio de cuenta con pantallas conservadas en teléfono. |
| CL-43 | Parcial | POST/PATCH LIVE/STATIC por HTTP y rechazo/recuperación con foto en Jest aprobados. Falta flujo de corrección nativo. |

## Reproducción técnica y límites del entorno

- Backend: `npm.cmd test -- --runInBand --json --outputFile=.local/casos-limite-0040-jest.json`, tipos completos, build, lint, test:phase2, test:phase3 y test:phase5-contracts.
- Adicional: `node scripts/verify-edge-cases.mjs`; crea su propia BD/namespace/uploads y conserva informe en .local/verification. `--serve` fue usado temporalmente para el emulador; no requiere usarse para arrancar TapCampus.
- Frontend: `npm.cmd test -- --watch=false --json --outputFile=.local/casos-limite-0040-jest.json`, tipos completos y exportación Android/iOS. `node scripts/verify-redesign-ui.cjs --form-errors-only` produjo 19 capturas auxiliares actuales.
- El emulador fue creado dentro de Frontend/.local, sin modificar una app de usuario. Expo requirió omitir consultas externas para servir el bundle de QA. Se usaron únicamente cuentas ficticias del servidor aislado; credenciales y archivos grandes permanecen ignorados en .local.
- La primera inyección rápida ADB de 200 letras solo entregó 75 al control: no se contó como fallo de la app. Se repitió por bloques y se comprobó una longitud de 200 en el input antes de registrar la variante.
- Después de las pruebas se detuvieron fixture, emulador y ambos Metro auxiliares. Se corrigió solo el origen de API de Frontend/.env local ignorado (IP antigua → IP LAN actual) y se preparó el arranque habitual de backend/Expo. No se cambiaron controladores, pantallas, modelos ni reglas de negocio, ni se hizo commit/push.

La plantilla de registro sigue disponible para la siguiente sesión. Completar los casos físicos pendientes y corregir INC-0040-01 antes de aprobar AC-01/02/03 o declarar terminado el MVP.
