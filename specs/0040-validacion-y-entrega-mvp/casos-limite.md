# TapCampus — Plan de pruebas de casos límite y recuperación

Estado: Preparado; casos sin ejecutar | Fecha: 2026-11-21 | Versión: 1

Materia: Aplicaciones Móviles. Referencia de evaluación: instrucciones del profesor proporcionadas por el alumno. Este plan forma parte de [0040](spec.md), principalmente AC-02/T-02/EV-02 y AC-03/T-03/EV-03; no sustituye despliegue, instalación, usabilidad ni piloto.

## 1. Objetivo y criterio del profesor

Usar la app como una persona distraída o con mala conexión: interrumpir operaciones, proporcionar datos inesperados, negar permisos y regresar después de salir. Comprobar que responde con un mensaje claro, impide la acción inválida o permite recuperarse.

En **todos** los casos se observan por separado:

| Evaluación | Qué se comprueba | Cómo registrar |
| --- | --- | --- |
| Estabilidad y recuperación | No se cierra sola, no queda congelada, no aparece pantalla roja ni error técnico sin manejar. Se puede corregir, volver o reintentar cuando corresponde. | Aprobado/Fallido y evidencia. |
| Función e integridad | Hace lo esperado según las reglas: valida datos, conserva lo confirmado, respeta permisos, stock, precio y plazo, sin duplicados indebidos. | Aprobado/Fallido y evidencia. |

Rechazar un precio negativo con un mensaje útil puede aprobar ambas evaluaciones. Mostrar un error controlado cuando debería guardar puede aprobar estabilidad y fallar función. Que no se cierre **no basta** para declarar completo el MVP; tampoco se debe confundir un rechazo previsto con un defecto.

Una espera de red con controles de envío bloqueados no es por sí misma un congelamiento. En los casos de conexión anotar cuándo comenzó y terminó. El cliente tiene timeout de 15 s por petición; observar hasta 20 s por petición pendiente como margen de prueba y reportar un indicador que no termina. Si hay varias peticiones secuenciales, registrar cada etapa. Este margen es una guía de diagnóstico, no un requisito nuevo de rendimiento.

## 2. Alcance y límites reales

- Registro/acceso, Mi cuenta, publicación LIVE/STATIC, filtros/listas, cámara/galería, reservas, ventas, ofertas y contacto por WhatsApp.
- No se requieren GPS ni permiso de ubicación: las zonas se seleccionan manualmente. El ejemplo del profesor sobre negar ubicación se registra **No aplica — GPS fuera de alcance**, sin añadirlo a la app.
- `Frontend/app.json` configura orientación `portrait`. Girar el teléfono puede mantener la app vertical y ser correcto; se comprueba estabilidad y conservación del estado. Si el sistema/contenedor permite horizontal, se comprueba que el contenido siga accesible. Este plan no exige desbloquear la orientación.
- Volver desde segundo plano sin terminar el proceso y abrir después de forzar su cierre son situaciones diferentes. Los datos guardados y reservas confirmadas son persistentes; no existe compromiso actual de restaurar un formulario nunca guardado después de terminar el proceso.
- No se fija un máximo nuevo de 200 letras para el nombre: los DTO actuales no definen ese máximo. La prueba comprueba tolerancia y presentación; un rechazo solo es correcto si corresponde a una regla explícita y coherente entre capas. Un límite nuevo requiere una decisión de producto antes de implementarlo.
- Una creación de publicación no tiene la misma garantía de idempotencia que una reserva. Tras respuesta incierta se debe comprobar Mis ventas/servidor antes de publicar otra vez; no asumir que un timeout significa que no se guardó.

## 3. Preparación

1. Usar un entorno de pruebas identificado con API, PostgreSQL, Redis, jobs, uploads y Socket.io. No detener ni modificar servicios/datos reales para provocar errores.
2. Preparar cuentas ficticias: **A comprador**, **B vendedor** y **C otro comprador/usuario ajeno**. No utilizar contactos reales para enviar mensajes de prueba.
3. Registrar modelo, SO/versión, Expo Go o build instalado, versión/commit del cliente y API, origen de prueba y condiciones de red. No anotar tokens ni contraseñas.
4. Disponer de dos dispositivos/emuladores, al menos uno físico. Para la última pieza, dejar una sesión de A y otra de C; B crea previamente el producto. Si falta un recurso, marcar el caso Bloqueado con su motivo.
5. Preparar publicaciones de B: LIVE visible con stock 3 y horario suficiente; LIVE con última pieza; STATIC activa. Usar títulos `QA-<sesión>-<caso>` para identificar efectos y evitar confundir pruebas entre sí.
6. Preparar imágenes de prueba válidas, una imagen deliberadamente mayor que 5 MiB y una URL inexistente de fixture. Usar archivos sin información privada. Si el selector transforma/comprime una imagen, medir el archivo que realmente se envía.
7. Anotar stock disponible, número de publicaciones/reservas y precio antes de las pruebas con escritura. El vendedor confirma en Mis ventas; si el resultado es ambiguo, contrastar con HTTP/BD de pruebas. Dos tarjetas iguales no prueban por sí solas dos filas distintas.
8. Restablecer conexión, permisos y datos de fixture entre casos. No desinstalar para restablecer permisos antes de un caso de persistencia: eso cambia sus condiciones iniciales.
9. Para arranque sin red preferir un build instalado que incluya el bundle. Si se usa Expo Go, cargar primero el proyecto con red y documentar si necesita Metro al reabrir. La imposibilidad de descargar el bundle del contenedor no prueba el comportamiento offline de la app: registrar la dependencia y repetir con un artefacto adecuado, sin marcar Aprobado por omitir el caso.

## 4. Método de ejecución

Para cada caso: comprobar precondiciones, anotar el estado inicial, provocar **una** alteración, observar el resultado, aplicar la recuperación y comprobar el estado final. Registrar también la variante, intento y plataforma.

**P1:** ejecutar primero; cubre los ejemplos del profesor y operaciones que pueden perder/duplicar información. **P2:** ampliar después para cubrir límites de datos, estados y reglas. Ambos niveles forman parte del recorrido completo.

Los casos con variantes se repiten por cada valor/formulario/acción indicada, comenzando con los otros campos válidos. Un caso no se considera aprobado si alguna variante obligatoria quedó sin probar. Todos parten de estado **Pendiente** en el [registro](registro-casos-limite.md).

### A. Conectividad y recuperación

| ID / prioridad | Preparación y pasos | Resultado esperado y recuperación |
| --- | --- | --- |
| CL-01 · P1 | Con sesión válida, cerrar la app, activar modo avión y comprobar que Wi-Fi/datos estén apagados; abrirla e intentar cargar Explorar. | No cierre/pantalla roja ni carga infinita. Estado de error o falta de conexión comprensible, distinto de «no hay productos». Restaurar red y reintentar carga. No exigir catálogo offline que no está comprometido. |
| CL-02 · P1 | Cargar Explorar con red; desconectar, cambiar de categoría/zona y abrir un detalle. | No presentar una operación fallida como exitosa ni dejar filtros o navegación bloqueados. Si conserva contenido anterior, no tratarlo como disponibilidad confirmada. Recuperar red y obtener el estado vigente. |
| CL-03 · P1 | A confirma un apartado; interrumpir la red mientras está enviando. Restaurar y reintentar el mismo apartado. En una variante QA, permitir que el servidor confirme pero que se pierda la respuesta. | El error no crea éxito local. En el mismo proceso se conserva la clave de la solicitud incierta; el reintento recupera el mismo ID, una reserva y un descuento. No genera otra clave por repetir ese intento. |
| CL-04 · P1 | Con formulario válido y foto, cortar red durante upload; repetir cortando después del upload al guardar. Recuperar conexión. | Termina la espera con explicación; conserva el borrador mientras el proceso siga vivo. No reenvía automáticamente. Si la foto ya tiene URL, no obliga a subirla otra vez. Antes de repetir una creación de resultado incierto, comprobar Mis ventas y el servidor. |
| CL-05 · P1 | A ve un producto. Desconectar A; C reserva o B cambia stock/precio. Reconectar A y volver al primer plano. | Reconsulta y refleja stock/precio del servidor sin reiniciar la app. Confirmar no usa un precio antiguo como si ya estuviera reservado; apartados anteriores conservan su precio fijado. |
| CL-06 · P2 | En fixture aislado, dejar red del teléfono activa pero API inaccesible; abrir listas y repetir una carga. | Mensaje de conexión/servicio y reintento útil; no mostrar lista vacía como resultado válido ni imprimir stack, URL interna o token. Restablecer el servicio de prueba y recuperar la pantalla. |

### B. Formularios y entradas inesperadas

| ID / prioridad | Preparación y pasos | Resultado esperado y recuperación |
| --- | --- | --- |
| CL-07 · P1 | Abrir acceso y pulsar entrar con ambos campos vacíos; repetir con uno vacío. | Impide envío o señala lo que falta. No navegación a zonas protegidas ni error técnico. Completar datos válidos permite continuar. |
| CL-08 · P1 | Registro vacío; después omitir nombre, correo, contraseña y teléfono por turnos. | No cuenta parcial; indicación comprensible de los datos faltantes. No se pierde el resto del formulario al corregir. |
| CL-09 · P1 | Nueva LIVE sin foto, título, descripción, categoría, precio, stock ni zona; pulsar Publicar. | Aviso visible y errores por origen, navegación al primer campo, sin upload ni publicación. Corregir conserva el resto de datos. |
| CL-10 · P1 | Repetir formulario vacío en STATIC; cambiar LIVE→STATIC después de un intento inválido. | Valida foto/campos comunes; no exige stock, horario u oferta de LIVE. Categoría corresponde al tipo y el formulario sigue utilizable. |
| CL-11 · P2 | Editar Mi cuenta; vaciar nombre y teléfono por separado e intentar guardar. | Explica la invalidez o impide guardar; no borra el perfil confirmado ni modifica el correo institucional. Corregir permite guardar. |
| CL-12 · P1 | Pegar `abc` y `1e3` en precio y stock; no depender solo del teclado numérico. Probar cada campo por separado con los demás válidos. | Se rechazan antes de guardar o mediante mensaje de validación; nunca NaN/Infinity, pantalla roja o un valor diferente guardado silenciosamente. |
| CL-13 · P1 | Precio `-10`; stock `-1` en creación y edición; guardar por separado. | No se persisten valores negativos ni se modifica inventario/reservas. Se muestra qué corregir. |
| CL-14 · P2 | Precio: `0`, `0.001`, `1.234`, `100000000`, `Infinity`; después `0.01` y `99999999.99`, con oferta desactivada. | Inválidos rechazados; los dos extremos válidos se aceptan si el resto es válido. Hasta dos decimales y máximo 99999999.99; sin desbordamiento de interfaz ni errores técnicos. |
| CL-15 · P2 | Stock: `1.5`, `2147483648`, `0` al crear; después `1`, `2147483647` y `0` al editar una LIVE de fixture. | Solo enteros en rango; crear exige mayor que cero, editar permite cero. Stock cero oculta la disponibilidad pública sin eliminar reservas existentes. Probar en fixtures, no inflar inventario real. |
| CL-16 · P1 | Pegar exactamente 200 letras `A` en nombre de registro y en edición de cuenta. Guardar; volver a Cuenta y Mis ventas. | La app tolera el texto sin cierre, solapamientos que impidan operar ni pantalla roja. No se impone un rechazo por un máximo inexistente. Verificar consistencia entre valor enviado, persistido y mostrado; registrar cualquier recorte. |
| CL-17 · P2 | Título de 200 letras y descripción de 5000 letras; repetir con `Café & libro / ñ + 50% 📚`. Crear/editar y abrir listado/detalle. | Texto largo o símbolos no rompen controles, tarjetas ni navegación. Aceptación o rechazo conforme a validación documentada; sin pérdida silenciosa o error técnico. No introducir un máximo nuevo durante esta prueba. |
| CL-18 · P2 | Pegar tres espacios en título, descripción o nombre; completar el resto; enviar. | No aceptar un campo visualmente vacío como dato válido. Mensaje local y corrección posible. Si una capa lo acepta y otra no, registrar discrepancia funcional aunque la app siga estable. |
| CL-19 · P2 | Registro con `qa@gmail.com`, `qa@uabc.edu.mx.otro.mx`, `qa@` y correo institucional de prueba ya registrado. | Rechazo comprensible por dominio/formato/duplicado, sin crear cuentas adicionales ni perder el formulario. Probar un correo institucional de fixture válido como control. |
| CL-20 · P2 | Teléfono `123`, `-6641234567`, once dígitos nacionales y prefijo extranjero; luego diez dígitos mexicanos y el mismo con `+52`. | Inválidos rechazados. Ambos formatos mexicanos válidos apuntan al mismo formato canónico, sin duplicar 52. No enviar mensajes para demostrarlo. |

### C. Pulsaciones repetidas y acciones concurrentes

| ID / prioridad | Preparación y pasos | Resultado esperado y recuperación |
| --- | --- | --- |
| CL-21 · P1 | Formulario LIVE válido: tocar Publicar dos veces seguidas y luego cinco veces en un segundo; repetir en STATIC con un fixture nuevo. | Mientras el envío está pendiente se bloquea el duplicado. Una acción produce una publicación, no varias; verificar filas/Mis ventas y no solo la animación del botón. |
| CL-22 · P2 | Cambiar nombre/teléfono y tocar Guardar cambios repetidamente durante envío lento. | Guardado bloqueado mientras procesa; un resultado confirmado, sin sobrescribir por respuestas viejas ni salir inesperadamente de la pantalla. |
| CL-23 · P1 | Abrir confirmación de apartado y tocar Sí, apartar repetidamente; intentar cerrar el diálogo y contactar mientras envía. | Una solicitud lógica, una reserva y un descuento. Diálogo/acciones incompatibles bloqueados durante envío; al resolver se recupera control. Otra unidad requiere una nueva acción confirmada. |
| CL-24 · P1 | En reservas distintas, B toca confirmar entrega repetidamente y A toca cancelar repetidamente. Si es posible, repetir compitiendo entre ambos. | Una transición por reserva. Cancelar libera una vez; completar no devuelve stock. Una acción tardía recibe rechazo claro y ambos clientes reconsultan, sin doble liberación. |

### D. Permisos, fotografías y presentación

| ID / prioridad | Preparación y pasos | Resultado esperado y recuperación |
| --- | --- | --- |
| CL-25 · P1 | Sin permiso concedido, añadir foto y negar cámara; repetir con permiso de galería cuando el SO lo solicite. | Explicación en contexto, sin cierre ni borrado de campos. Puede volver, elegir alternativa o conceder permiso desde ajustes. No exigir un diálogo de permiso que el selector del SO no necesite. |
| CL-26 · P2 | Con formulario empezado, ir a Ajustes y revocar cámara/fotos; volver y cambiar la imagen. | Maneja la revocación con mensaje y recuperación; sin usar una capacidad negada ni perder el formulario por una excepción. Registrar si el SO terminó el proceso, para distinguirlo de un fallo de la app. |
| CL-27 · P2 | Abrir cámara/galería y cancelar; repetir cuando ya hay foto seleccionada. | Vuelve al formulario sin error técnico. Cancelar no borra una foto anterior ni genera una publicación vacía. |
| CL-28 · P2 | Elegir foto cuyo archivo enviado supere 5 MiB; probar archivo no soportado/dañado si el selector lo permite. Si no, usar prueba de upload aislada como evidencia técnica adicional. | Rechazo explicativo por formato/tamaño, sin publicación parcial ni borrador perdido. Seleccionar foto válida permite continuar. No declarar nativa una variante ejercitada solo por API. |
| CL-29 · P1 | Girar a horizontal y volver en acceso, formulario con datos, detalle y diálogo de confirmación. | Si respeta portrait, sigue vertical sin perder estado. Si el contenedor gira, textos/acciones siguen accesibles. Sin cierre, pantalla roja, envío accidental ni dos diálogos. |
| CL-30 · P2 | Aumentar tamaño de letra del sistema; abrir formulario con errores y teclado, llegar a último campo y a Publicar; repetir con diálogo. | Mensajes legibles, desplazamiento/foco útiles, acciones alcanzables y sin quedar tapadas permanentemente. Registrar escala y plataforma; una captura web no acredita teclado o lector nativos. |

### E. Salida, regreso y estados vacíos

| ID / prioridad | Preparación y pasos | Resultado esperado y recuperación |
| --- | --- | --- |
| CL-31 · P1 | Escribir un formulario sin guardarlo; ir a Inicio del teléfono durante un minuto y volver, sin terminar el proceso. | Si el proceso sigue vivo, conserva campos/foto y no publica por regresar. Si el SO terminó el proceso, repetir y registrar esa condición por separado; no atribuirla a un simple cambio de pantalla. |
| CL-32 · P1 | Guardar una publicación y confirmar un apartado; anotar ID/stock/precio/plazo en registro privado. Forzar cierre, esperar y abrir. | Datos confirmados se recuperan del servidor; sesión válida persiste o se solicita acceso si ya venció. No reserva de nuevo ni reinicia los 20 minutos. No se exige recuperar borradores nunca guardados tras terminar el proceso. |
| CL-33 · P1 | Usar cuenta sin publicaciones/reservas; abrir Mis ventas y Mis reservas. En catálogo aislado vacío, abrir Explorar LIVE/STATIC. | Vacío explicado con acción pertinente, sin cierre, spinner infinito ni error por acceder a un primer elemento inexistente. No confundir carga/error con vacío. |
| CL-34 · P2 | Buscar `zzzz-no-existe-qa`; combinar zona/categoría sin coincidencias; limpiar búsqueda. | «Sin resultados» con opción de corregir filtros/búsqueda. Limpiar texto conserva otros filtros; cambiar tipo usa sus categorías válidas y la pantalla se recupera. |
| CL-35 · P2 | Ver producto/reserva con URL de imagen inexistente en fixture; repetir con foto sin red. | Alternativa de imagen estable; se conservan título/precio/stock/plazo y acciones permitidas. Sin saltos que tapen controles ni fallo general por la foto. |
| CL-36 · P1 | Contactar desde LIVE visible sin reserva, STATIC y reserva confirmada. Cancelar apertura cuando el SO lo permita o simular fallo en entorno de prueba; regresar. | Abre destinatario/texto por contexto o muestra error recuperable. Consulta previa no afirma reserva, no descuenta stock ni envía mensajes sola; se puede volver a Contactar. Si falta WhatsApp y abre navegador, eso no es un fallo por sí solo. |

### F. Límites propios del marketplace

| ID / prioridad | Preparación y pasos | Resultado esperado y recuperación |
| --- | --- | --- |
| CL-37 · P1 | A y C confirman simultáneamente el apartado de la última pieza desde dos sesiones. | Solo una reserva nueva y stock cero; la otra sesión recibe no disponibilidad y puede continuar usando la app. Si se usa estrés HTTP de 50 solicitudes, adjuntar esa evidencia aparte: no sustituye el recorrido en dos sesiones móviles. |
| CL-38 · P1 | A reserva. B finaliza manualmente la LIVE; repetir con fin natural del horario. A intenta reservar otra unidad y B confirma la reserva previa antes de vencer sus 20 min. | No nuevas reservas/contacto previo desde detalle ya no visible; el apartado vigente conserva contacto/plazo y entrega confirmable. Finalizar no cancela la reserva ni la trata como expirada. |
| CL-39 · P1 | Confirmar reserva, dejar app cerrada o sin red más de 20 min y volver. Registrar tiempo del servidor. En prueba técnica separada, reiniciar solo el worker aislado. | Estado vencido, acciones terminales bloqueadas y stock liberado una sola vez. Una LIVE finalizada no reaparece. Si se aceleran fechas en fixtures, etiquetarlo como simulación: no demuestra por sí solo 20 minutos reales. |
| CL-40 · P2 | Oferta mínima igual/mayor al precio y negativa; horario fin anterior a inicio y programación fuera del intervalo. Después corregir; en publicación ya ofertada intentar reconfigurar precio. | Errores claros sin guardar combinaciones inválidas; corregir conserva borrador. Oferta activa no se revierte ni reconfigura. Precio de reservas previas no cambia; datos de oferta futura no aparecen al comprador. |
| CL-41 · P2 | En sesión de pruebas con token ya vencido, abrir una ruta protegida o guardar; volver a acceder con credenciales válidas. No editar el reloj del teléfono para simularlo. | Recuperación al acceso y mensaje/estado comprensible, sin bucle de navegación ni solicitud protegida exitosa. Tras autenticarse muestra solo los datos de esa cuenta. No registrar el token en evidencia. |
| CL-42 · P2 | A abre publicación/reserva de B; intentar una acción de vendedor desde enlace/ruta de prueba. Después cambiar de cuenta y regresar a una pantalla conservada. | Servidor rechaza operación ajena y la app se recupera sin pantalla roja. No revela teléfono de espectadores/otros compradores ni conserva datos privados de la cuenta anterior. |
| CL-43 · P1 | Con foto/campos válidos, crear y editar LIVE/STATIC con `pendejo` en título y después en descripción. Corregir por `Computadora` o `Coca-Cola` y reenviar expresamente. | Rechazo de contenido con aviso/campo identificable, sin publicación o edición parcial. Conserva foto, horario y selecciones; la corrección permite guardar sin repetir upload ya completado. No bloquea esos textos de control por coincidencia parcial. |

## 5. Correspondencia con los ejemplos del profesor

| Ejemplo | Casos |
| --- | --- |
| Modo avión / sin internet | CL-01..06 |
| Campos vacíos | CL-07..11 y CL-18 |
| Texto en número / número negativo | CL-12..15 |
| Nombre de 200 letras / texto largo | CL-16..17 |
| Guardar dos veces | CL-21..24 |
| Girar el celular | CL-29..30; portrait es una configuración válida |
| Salir y volver; conservación de datos | CL-31..32 y CL-39..41 |
| Negar permisos | CL-25..28; ubicación no aplica por alcance |
| Lista sin elementos | CL-33..34 |

## 6. Recorrido corto para preparar la exposición

Con fixtures preparados, ejecutar primero **CL-01, CL-09, CL-12, CL-13, CL-16, CL-21, CL-25, CL-29, CL-31, CL-32, CL-33 y CL-36**. Este recorrido de 12 casos cubre los ejemplos del profesor; reservar aproximadamente 20–30 min, ajustando al dispositivo. No demuestra el cierre completo de los 43 casos ni las pruebas de 20 min/concurrencia.

Después ejecutar el resto por bloques. La prueba de expiración requiere su espera real y puede prepararse al principio mientras se prueban otros fixtures. No reutilizar esa misma reserva para cancelar/confirmar y luego pretender que también se observó expirar.

## 7. Evidencia, incidencias y criterio de cierre

- Usar [registro-casos-limite.md](registro-casos-limite.md): una fila por caso, con ficha adicional por variante/ejecución. Registrar resultado observado antes de juzgarlo.
- Guardar evidencia mínima: captura del mensaje/estado final o video corto que permita ver interrupción y recuperación. Para stock/duplicados, añadir conteo/ID anonimizado antes/después de HTTP o BD de prueba. No guardar todas las resoluciones ni evidencia redundante.
- Capturas/video de Expo Go cuentan como recorrido nativo identificado; capturas del verificador web son auxiliares. Anotar plataforma no probada como pendiente.
- Usar alias A/B/C, ocultar correos/teléfonos completos y no incluir JWT, contraseñas, códigos de acceso ni rostros. Un enlace externo no debe enviar un mensaje de prueba.
- **S1:** cierre inesperado, pantalla roja, congelamiento o imposibilidad de recuperar la app. **S2:** duplicado, stock/precio/plazo o permisos incorrectos, pérdida de datos confirmados o recuperación bloqueada. **S3:** presentación/mensaje mejorable sin bloquear la tarea. Esta severidad ordena correcciones, no inventa una calificación del profesor.
- Cada hallazgo tiene ID, pasos, esperado/observado, evidencia, impacto y caso asociado. Corregir en el expediente correspondiente y repetir el caso afectado; si cambia un módulo compartido, repetir también los casos relacionados.
- Cerrar estabilidad solo con todas las variantes aplicables comprobadas sin S1 y con recuperación clara. Conservar por separado fallos funcionales; un caso Bloqueado/Pendiente no equivale a Aprobado. El cierre MVP exige además los criterios de 0040 y los RF/RNF, incluso cuando la exposición sea satisfactoria.

## 8. Trazabilidad y estado inicial

| Grupo | Requisitos / historias | Criterio / tarea / evidencia prevista |
| --- | --- | --- |
| CL-01..06 | RF-03/06/07/09, RNF-01/02; US-03/04/06/08 | 0040 AC-02/03 → T-02/03 → EV-02/03 |
| CL-07..20 | RF-01/02/03/06; US-01/02/03/04 | 0040 AC-02 → T-02 → EV-02 |
| CL-21..24 | RF-02/03/06/07/08/10, RNF-01; US-02/03/04/06/07/07b | 0040 AC-02/03 → T-02/03 → EV-02/03 |
| CL-25..36 | RF-02/03/05c/06/07/13, RNF-03; US-02/03/04/05c/06/09/11 | 0040 AC-02 → T-02 → EV-02 |
| CL-37..43 | RF-01/04/05/07/08/09/10/11/12/13/15, RNF-01/02; US-01/05/05d/06/07/07b/08/09/12 | 0040 AC-02/03 → T-02/03 → EV-02/03 |

Fuentes: [requisitos](../../docs/02_REQUIREMENTS.md), [validación](../../docs/07_VALIDATION.md), [0034 errores](../0034-errores-formulario-publicacion/spec.md), [0037 ofertas](../0037-control-y-privacidad-ofertas/spec.md), [0038 contenido](../0038-filtro-palabras-publicaciones/spec.md) y [0039 contacto](../0039-contacto-live-sin-reserva/spec.md).

Esta entrega prepara el plan; **no ejecuta los casos ni declara nueva aceptación móvil**. Los límites identificados provienen de inspección de app.json, timeout del cliente y validadores del backend. Las pruebas automatizadas históricas se consultan como apoyo, con su fecha y versión, sin convertirlas en resultados nativos de este registro.
