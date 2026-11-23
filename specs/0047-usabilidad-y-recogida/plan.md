# 0047 — Plan de corrección de usabilidad y recogida

Estado: Cambios implementados; usuario confirma resuelto el desplazamiento, aceptación formal integrada pendiente | Especificación: spec.md

## Orden y prioridad

| Orden | Resultado | Motivo / dependencias |
| --- | --- | --- |
| 1 — P0 | Reproducir y corregir el desplazamiento iOS | Dos reportes anteriores no lo cerraron en hardware. Medir antes de tocar otra vez el contenedor global. |
| 2 — P0 | Punto de recogida en todas las reservas | El comprador debe poder llegar y cumplir sus veinte minutos. Cerrar DEC-05 antes del cambio de persistencia. |
| 3 — P1 | Creación y disponibilidad por Socket.io | El feed debe informar lo que se acaba de publicar sin una acción adicional del comprador. |
| 4 — P1 | Ubicación STATIC por acordar | Decisión del usuario cerrada; requiere esquema/API/UI/filtros juntos. |
| 5 — P1 | Nombre y categorías comprensibles | Adoptar el nombre tras cerrar DEC-03; categorías/seed según DEC-06 y comprobación contra la API real. |
| 6 — P2 | Duración de oferta y confirmación de logout | Controles claros, sin alterar autenticación automática ni reglas de ganga. |
| 7 | Integración y nueva validación con personas | Incluir agotamiento, recuperación, datos extremos y dispositivos concretos. |

Se pueden preparar componentes y pruebas independientes durante la investigación nativa. No se declara solucionado ese bug porque los otros bloques terminen.

## 1. Diagnóstico del desplazamiento

Archivos: Frontend/src/app/_layout.tsx, (tabs)/_layout.tsx, components/marketplace-shell.tsx, campus-header.tsx y feedback.tsx; versiones instaladas de expo-router, react-native-screens y safe-area-context.

- Capturar modelo, iOS, Expo Go, SDK/dependencias y huella del bundle servido. Instrumentación solo de desarrollo, sin credenciales ni datos personales.
- Registrar insets de raíz/navegador/pantalla; measureInWindow del viewport, logo/encabezado y barra; alturas de avisos, contentOffset/contentInset y eventos foco/blur/teclado. Diferenciar coordenadas relativas y puntos nativos.
- Escenario base: app recién abierta, portrait, teclado cerrado, todas las listas al inicio. Diez ciclos Explorar → Reservas → Mis ventas → Cuenta. Repetir con scroll conservado y después de formulario, selector y logout cancelado.
- Contrastar salto de inset con desplazamiento de scroll, reaparición de escena, barra con altura variable y avisos condicionales. Hipótesis, no causas acreditadas todavía.
- Corregir al propietario real del espacio seguro/ajuste de scroll. Un solo responsable por borde; no sumar un espacio que el navegador ya reservó, no congelar cambios legítimos del sistema, ni ocultar el síntoma con offset negativo. Si cambia la jerarquía visual necesaria, actualizar DESIGN.md antes de extenderla.
- EV-01 exige antes/después en ambos dispositivos y el mismo recorrido; registrar también la condición sin avisos y con fallo de carga. Las capturas web son apoyo, no sustituto.

## 2. Contratos de ubicación

Introducir PickupMode = SPECIFIC_ZONE | ARRANGED y Publication.pickup_mode con default SPECIFIC_ZONE; zone_id y relación opcionales solo para permitir STATIC/ARRANGED. CHECK SQL: LIVE siempre SPECIFIC_ZONE y zona no nula; STATIC admite SPECIFIC_ZONE con zona o ARRANGED con null. No insertar zona ficticia ni usar ID cero.

- POST anterior con zona conserva semántica. STATIC/ARRANGED envía pickup_mode y zone_id:null explícitos. Combinaciones contradictorias reciben 400; no se descarta una zona en silencio.
- PATCH omitido conserva campos; pasar de un modo a otro cambia ambos de forma atómica. Validar contra el registro confirmado y conservar permisos/estado/imagen.
- Respuesta pública/propia añade pickup_mode; zone_id pasa a number|null. Frontend usa unión discriminada, sin casts para fingir zona válida. Detalle y tarjetas comparten un componente de ubicación.
- GET /publications: sin filtro de zona incluye ambos modos; zona concreta exige coincidencia real y excluye ARRANGED. Filtro pickupMode=ARRANGED solo STATIC; combinarlo con zoneId es 400. UI presenta Todas las zonas, zonas concretas y Entrega por acordar sin dos selecciones contradictorias. Actualizar conteos y búsqueda por intersección.
- LIVE sigue obligado a un punto concreto. La opción por acordar no significa entrega a domicilio ni disponibilidad en todos los lugares.

## 3. Recogida de reservas

Según la propuesta DEC-05: guardar pickup_zone_id/pickup_zone_name de nuevas reservas en la misma transacción que fija precio y descuenta stock. Incluir pickupLocation y sellerName en POST/reintento/GET propios y listado autorizado del vendedor; source = SNAPSHOT o LEGACY_CURRENT para distinguir históricos. El punto se devuelve sin consultar el detalle público.

- Reservation incluye publicación/zona actual únicamente como fallback de los registros sin instantánea. No rellenar históricos presentando una ubicación actual como prueba del punto original.
- PATCH de zona LIVE con reservas ACTIVE no vencidas: 409 PICKUP_LOCATION_LOCKED y mensaje accionable; otros campos permitidos conservan su comportamiento. Bloquear/releer la publicación antes de contar reservas; misma disciplina de bloqueo que reservas/venta física. Carrera: quien reserva antes obtiene y conserva ese punto; quien edita antes ofrece el punto nuevo a reservas posteriores.
- Componente común PickupLocation en confirmación, Mis reservas y datos necesarios del vendedor: pin, etiqueta Ubicación de recogida y nombre real del catálogo, con wrap. No hardcodear Cafetería Central: la zona actual se llama Cafetería Principal. Históricos usan Ubicación de referencia cuando no hay instantánea acreditada.
- Jerarquía de confirmación: Reserva confirmada → producto/unidad → punto → plazo → precio fijado → vendedor y WhatsApp/cancelación. Mis reservas expone el punto sin entrar al detalle. Mantener estados anteriores y privacidad de teléfonos.

## 4. Eventos y actualización del feed

Gateway, PublicationsService, QueueService/JobsService y useMarketplaceSync:

| Evento nuevo | Cuándo | Payload público mínimo |
| --- | --- | --- |
| publication_created | POST persistido y confirmado; LIVE/STATIC | { publicationId, type } |
| publication_updated | Cambio confirmado de la proyección pública | { publicationId, type } |
| publication_available | Llega el inicio de una LIVE programada aún válida | { publicationId, type: LIVE } |

Mantener stock_updated, publication_expired y ganga_activated. No emitir éxito antes del commit, ni datos de contacto, reservas o configuración futura de oferta. Rechazos no generan eventos de éxito. Cambios exclusivamente privados no requieren invalidación pública.

- Inicio futuro: trabajo durable con expectedAt/jobId que identifique la programación; worker valida estado/fecha actuales y descarta trabajos antiguos. Usar un marcador privado de inicio anunciado por programación para conciliación sin emitir en cada ciclo. No publicar futuras antes de su start_time; no spam al reconciliar filas antiguas.
- Cliente conectado reconsulta REST con filtros/búsqueda vigentes; agrupa eventos próximos, ignora respuestas antiguas y conserva contenido durante el refresco/error. Sin vaciar lista, cambiar tab ni duplicar filas. Preservar ancla de lectura; avisar de novedades sin forzar scroll. Al principio del feed la nueva coincidencia debe aparecer directamente.
- Conexión, reconexión y foreground reconsultan: Socket.io no garantiza replay de eventos perdidos por defecto. Ver research.md. Comprobar origen/puerto/CORS/transportes reales de los teléfonos.
- Prueba obligatoria: dos actores/cuentas y Socket.io reales contra Nest/PostgreSQL/Redis aislados; después dos sesiones móviles. Incluir publicación ajena a filtros, inicio futuro, actualización, desconexión, duplicados, fallo HTTP y stock cero. El fixture web no acredita este bloque.

## 5. Selector de duración

Componente DurationPicker con adaptador iOS y base Android/web, valor canónico totalMinutes. iOS: evaluar Stepper de horas y Picker de minutos de @expo/ui ya instalado; min/max y onValueChange existen en su fuente. Minutos 0..59; controles de incremento accesibles para horas evitan construir listas de millones de opciones ante horarios extremos. Host con ancho y tamaño estables: wheel/segmented no deben colapsar con matchContents.

Guardar total = horas*60+minutos. No DatePicker de hora del día, zona horaria ni DST para una duración. Máximo válido deriva de end_time y max(start_time, ahora): total*60000 debe ser estrictamente menor al intervalo disponible y respetar el entero del servidor. Cero programado inválido. No añadir un tope comercial de 23 horas.

Mostrar resumen: Se activará N minutos antes del fin, y fecha/hora calculadas cuando proceda. Cambiar horario no ajusta el adelanto en silencio: conservar selección y pedir corrección si queda inválida. Edición 75 ↔ 1h15; cerrar descarta, Guardar valida. Oferta ya aplicada sigue inmutable. No nuevas dependencias nativas sin necesidad acreditada; probar primero en Expo Go.

## 6. Nombre, catálogo y seed

Recomendación de DEC-03: Productos. Matriz a validar: selector/elección Productos; creación Nuevo producto/Publicar producto; insignia PRODUCTO; estado de venta En venta/Vendido sin mezclar género o modalidad. Ayuda explicita contacto y entrega por acuerdo sin apartado. Los códigos API LIVE/STATIC no cambian.

Antes de cambiar código: cerrar decisión, actualizar DESIGN.md/guías/requisitos afectados y luego PUBLICATION_COPY, componentes, nombres accesibles, mensajes, fixtures, pruebas e índice de Impeccable en el mismo bloque. El comprobador no se desactiva para aceptar nombres incongruentes. Prueba de comprensión con estudiantes; no afirmar que la investigación documental demuestra aceptación local.

DEC-06 propone cuatro familias nuevas de productos: Ropa y calzado, Mochilas y bolsos, Deportes, Juegos y videojuegos. STATIC queda con las seis existentes más cuatro; LIVE conserva seis alimentos y añade las diez categorías de productos, para ventas presenciales de libros/materiales/tecnología, etc. Total aprobado 26 filas; unicidad actual (name,type) lo permite. No es un catálogo universitario oficial ni introduce servicios o productos regulados.

- Upsert aditivo por nombre/tipo; conservar los doce IDs y las cinco zonas actuales. No recrear catálogos ni resetear secuencias.
- Conservar las 48 publicaciones/UUID originales de 0046 en su orden lógico. Las nuevas muestras se agregan con identidades estables al final o claves explícitas, sin desplazar IDs por insertar categorías en medio del array.
- Al menos una muestra coherente por nueva categoría tipada, fotos correspondientes y ficticias claramente declaradas de demostración; obtener assets adecuados para las nuevas familias. No usar comida como foto de un libro/ropa. Cubrir cero stock, horarios futuros/finalizados, ganga, NEW/USED y estados de reserva, preservando lo que el usuario ya editó.
- No rejuvenecer en silencio horarios existentes. Si hacen falta ventas actuales para una demostración, usar un lote nuevo identificado, aditivo e idempotente. La categoría puede existir sin publicaciones: filtro debe mostrar cero real, no ocultarla por confundir catálogo con resultados.
- Selector con búsqueda/scroll y selección conservada. Conteos por tipo/ubicación/búsqueda; LIVE no debe quedar limitado a alimentos. Verificar respuesta real del origen usado por el móvil y recarga de catálogos al volver/foco o tras ampliación.

## 7. Logout y agotamiento

Confirmación de logout en Cuenta con ConfirmationDialog: Cerrar sesión/Cancelar. Confirmar llama una sola vez al servicio actual; aviso si se descarta edición de cuenta. Cancelar conserva sesión, borrador y posición; pendiente bloquea repetición/cierre; fallo no declara éxito. No interceptar expiración ni 401 con esta confirmación.

Stock cero: conservar RF-04; retirar de disponibles sin borrar filas ni marcar FINISHED por esa sola razón. Comunicar Sin unidades disponibles en una transición observada; detalle abierto y reservas ofrecen salida coherente. No retener minutos una tarjeta aparentemente comprable. Cancelación/expiración que devuelven stock mantienen las reglas de horario/estado y actualizan por evento. No esconder las reservas confirmadas ni su recogida.

## Datos, compatibilidad y reversión

Ensayo primero en PostgreSQL aislado y copia/respaldo local conforme al flujo existente. Migración aditiva: defaults de pickup_mode para anteriores, nullables de instantánea, CHECK combinado, marcador privado de disponibilidad. Las filas anteriores mantienen lugares/precios/stock/contactos. Instantáneas antiguas no se inventan.

Backend y frontend que leen zone_id nullable deben desplegarse coordinados antes de activar ARRANGED. Requests antiguos con zona siguen funcionando. No prometer edición compatible en clientes antiguos que asumen zona obligatoria. Rollback preferente: desactivar creación del modo nuevo, conservar lector compatible y datos. No restaurar NOT NULL ni fabricar lugares si existen filas ARRANGED; resolverlas explícitamente antes de un down destructivo. Las categorías usadas no se eliminan como reversión; se conserva integridad y usuarios reales.

## Constitución y verificación

| Principio | Aplicación |
| --- | --- |
| I | Especificación/decisiones antes de implementación; no se cierra el comportamiento con propuestas abiertas. |
| II | RF/US → AC-01..10 → T-01..13 → EV-01..10, con baseline EV-00 separado. |
| III | Precio/plazo/stock e idempotencia existentes; nueva ubicación prometida bajo bloqueo y carreras comprobadas. |
| IV | Contratos de modos/nulls/eventos/proyecciones y privacidad documentados; reserva autorizada independiente del feed. |
| V | Evidencia nueva; ni 207 pruebas anteriores ni 157 capturas se heredan como aceptación de esta ampliación. |
| VI | MVP y feedback acotados; sin GPS, pagos ni cambio de tipos internos. |

Recorridos finales: vendedor publica LIVE → otro comprador la recibe sin salir → aparta → confirma lugar en ambas vistas → entrega/cancelación/expiración; STATIC con zona y por acordar → búsqueda/filtros → contacto → vendido; oferta programada H:M → activación; logout cancelar/confirmar/fallo/401; diez ciclos de tabs en ambos iPhone antes/después de teclado/formularios/modales.

Pruebas backend HTTP/SQL/Socket/BullMQ reales aislados para campos y concurrencia; frontend router/errores/tipos y componentes; capturas auxiliares con documentos activos y casos adversos; aceptación nativa diferenciada. Comandos finales: suites y tipos de ambas capas, build/lint backend, contratos actualizados de fases 2/3, check:design, exports si cambian imports/plataformas, check-sdd y diff --check. Reejecutar pruebas cuyo contrato cambie; no modificar verificadores solo para rebajar aserciones.
