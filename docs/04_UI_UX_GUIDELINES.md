# Guía de Diseño y UI/UX (TapCampus)

## 1. Principios de Consistencia Visual

Refinamiento 0031 AC-06 (2026-11-10): en Explorar, publicaciones normales y destacado sin oferta sobre blanco; gangaSoft únicamente cuando is_ganga_active, incluido el destacado. Contorno discreto compartido con las tarjetas de Catálogo. Verde reservado a marca, acciones y selección.

Rediseño vigente 0031 (2026-11-09): estilo fotográfico inspirado en la referencia Oakory aprobada por el usuario. Fondo casi blanco, superficies blancas con contorno discreto, Inter local y verde UABC. Sustituye el fondo beige y la composición horizontal de publicaciones de 0020. Sin carrito, favoritos ni calificaciones. Búsqueda y botón de filtros comparten fila; selección de tipo en píldoras con fondo verde sólido y texto blanco. La selección de navegación inferior conserva su fondo translúcido y sus cuatro destinos. El encabezado de Explorar se desplaza con el contenido. Destacado de una publicación real, únicamente sin búsqueda/filtros y con datos cargados; abre su detalle.

Vocabulario vigente 0030: Oferta, Precio de oferta, Activar oferta, Oferta activa/programada y Sin oferta sustituyen Ganga en todo texto visible, ayudas, errores y confirmaciones. Se conserva el naranja de 0029 para diferenciar descuentos de errores/acciones destructivas rojas. Los identificadores técnicos ganga* permanecen por compatibilidad; los títulos Demo de 0027 usan en oferta.

Gangas 0029: tarjetas de feed y venta activa con fondo gangaSoft (#FFF1E4), precio ganga (#A44B16), etiqueta sólida naranja con texto blanco e icono de etiqueta. Detalle usa el mismo distintivo y panel de precios suave. Orden actual → anterior menor/tachado a la derecha → Ahorras; comparar solo precio previo válido mayor al actual. Temporizador separado de la etiqueta en comprador; wrap antes que recorte. Reservas conservan su precio fijado. Contraste medido: naranja/fondo suave 5.27:1; blanco/naranja 5.84:1.

Búsqueda 0025: barra Buscar productos debajo de TapCampus/Cuenta, encima del selector; blanca, lupa y limpieza accesible, usando CustomInput/tokens actuales. Texto y filtros se combinan, se conserva la consulta al cambiar tipo, y limpiar texto conserva zona/categoría. Debounce 300 ms, tecla Buscar inmediata, carga/error y vacío recuperables; no mostrar resultados antiguos para texto nuevo.

Gestión de sesión vigente (0026, sustituye la hoja 0024): cuarta pestaña Cuenta con icono de persona y etiqueta. Abre Mi cuenta con nombre, correo y teléfono reales en lectura y Cerrar sesión. Retirar el acceso redundante del encabezado; no colocar logout en ventas. Bloquear repetición/navegación durante logout y mostrar error recuperable. La carga del perfil nunca muestra mensajes técnicos del servidor.

Refinamiento vigente 0026 con Impeccable/ui-ux-pro-max: cuatro destinos con minHeight 56 y safe area. Selección con fondo rgba(23,97,59,0.12), texto/icono primary y etiqueta en negrita, sin reducir opacidad de los contenidos. Icono Cuenta person-outline de Ionicons instalado. La hoja/foco de 0024 es evidencia histórica, sustituida por el módulo. VoiceOver y Dynamic Type se aceptan en dispositivo por separado.

Preferencia aprobada en Figma (0019 AC-05/EV-06) y aplicada a Expo en 0020: encabezados compactos, sin frases de apoyo debajo de TapCampus ni subtítulos redundantes en otros módulos. Aprovechar el espacio con contenido; conservar instrucciones necesarias, errores y mensajes de resultado. La aceptación física en dispositivo se verifica por separado.
Todas las interfaces deben basarse en el archivo principal de tokens (`theme.js`) y respetar la estructura sentada en las vistas de Autenticación (`login.tsx` / `register.tsx`).

## 2. Heurísticas de Usabilidad (Nielsen) Aplicadas
Para garantizar una experiencia intuitiva, el diseño se rige bajo las siguientes heurísticas:
*   **Visibilidad del estado del sistema:** El uso de temporizadores regresivos en tiempo real y contadores de stock aseguran que el usuario siempre sepa si el producto sigue disponible.
*   **Prevención de errores:** Los botones críticos (como cancelar reserva o finalizar publicación) deben requerir confirmación (Modal) antes de ejecutarse. Los inputs bloquean formatos incorrectos (ej. correo sin `@uabc.edu.mx`); el teléfono admite cualquier región de México, con diez dígitos nacionales o `+52` seguido de esos dígitos.
*   **Control y libertad del usuario:** El comprador siempre tiene visible un botón de "Cancelar Reserva" por si cambia de opinión, sin necesidad de contactar al vendedor.
*   **Reconocimiento antes que recuerdo:** Los filtros están expuestos visualmente (botones de categorías) en lugar de requerir que el usuario escriba la categoría exacta en un buscador.

## 3. Paleta de Colores (`COLORS`)
Fuente visual vigente: copias revisadas de Figma 0019, aplicadas en 0020 sobre la base de 0016. Prevalecen estos tokens y componentes compartidos; las pantallas se adaptan al tamaño y safe areas reales, sin dibujar la barra de estado del teléfono. Inter se empaqueta localmente; controles de al menos 44 puntos y texto escalable.

* `primary: '#17613B'` - CTA y texto de marca, contraste del prototipo.
* `primaryDark: '#124D2F'` - Estado presionado.
* `accent: '#4CAF6F'` - Verde original conservado como acento.
* `background: '#F8F9F7'` - Fondo casi blanco de las vistas principales.
* `white: '#FFFFFF'` - Tarjetas, navegación, entradas blancas y modales.
* `textDark: '#202923'` - Texto principal y encabezados.
* `textMedium: '#58645D'` - Texto secundario y placeholders.
* `textLight: '#68756D'` - Íconos secundarios.
* `inputBg: '#F1F3F0'` - Fondo para `TextInput` y alternativa de fotografía.
* `border: '#E2E7E1'` - Contornos y separaciones discretas.
* `error: '#B42318'` - Acciones destructivas y errores legibles.

Selector «Disponibles ahora / Catálogo» encima de Filtros, hoja con selección provisional y botón Aplicar. Barra inferior Explorar/Reservas/Mis ventas/Cuenta (0026); FAB + de 56 puntos arriba de la barra. Reservas con precio fijado y reloj propio; venta finalizada conserva entregas vigentes y oculta acciones inválidas. Las fotos reales vienen de la API; no usar las ilustraciones de ejemplo como productos fijos.

Evolución del prototipo (0017/0018, aplicada a Expo en 0020): navegación inferior con SVG locales de brújula/comprobante/bolsa de 24 px y etiquetas; activo verde e inactivo gris, destinos táctiles de al menos 44 px. Mis ventas separa tipo y estado: selector Con horario/Catálogo debajo del título, con ambas opciones visibles. Con horario incluye publicaciones LIVE finalizadas. Explorar mantiene Disponibles ahora.

## 4. Estilos de Componentes Comunes

Mi cuenta 0035: nombre e iniciales reales en composición abierta; Editar datos junto al nombre. Correo/teléfono en filas agrupadas con iconos decorativos, correo marcado Solo lectura. Logout separado por divisor, icono y texto rojo con mínimo 52, sin botón destructivo sólido compitiendo con edición. Carga con esqueleto estático accesible y error recuperable específico. Encabezado dentro del scroll; con fontScale >1.2 la identidad se apila. Sin identidad/tokens/funciones nuevos.

El editor 0033 se conserva en 0035: campos precargados de nombre y teléfono usando CustomInput y teclado apropiado; correo permanece como texto seleccionable. Guardar cambios solo ante cambios válidos, Cancelar descarta y error conserva borrador. Durante envío o cierre de sesión, campos/editor/acciones bloqueados. Aviso de éxito accesible, KeyboardAvoidingView y formulario desplazable.

### Layouts
* Nueva publicación/edición (0036, complementado por 0034): título fijo y aviso de errores fuera del scroll; tipo y fotografía amplia con acción de cambiar dentro del contenido. Secciones abiertas Producto/Precio y disponibilidad/Entrega y botón principal en pie visible. Campos blancos y selectores con icono outline/chevron; oferta secundaria. Filas apiladas bajo 360 puntos o fontScale >1.2; contenido limitado a 640 puntos. Reglas y contratos LIVE/STATIC conservados.
* Todo screen principal debe estar envuelto en `<SafeAreaView>` con color de fondo `COLORS.background`.
* Los formularios siempre usarán `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` y un `<ScrollView>`.

### Tarjetas (Cards)
Mis reservas (0032) prioriza «Por recoger» por vencimiento y separa «Anteriores» como registros compactos. Foto de 104×112 junto a título/unidad y precio reservado destacado; a menos de 360 puntos o fontScale mayor a 1.2, foto de ancho completo y acciones apiladas. Bloque de plazo verde suave, sin parpadeos ni alertas repetidas. Historial con foto de 72×80, texto/icono por estado y fecha real. Carga con esqueleto estático accesible; vacío/error con acción de recuperación. Reutilizar `PublicationPhoto` con alternativa ante fallo/ausencia. Se conservan los 20 minutos, precio fijado y acciones por unidad; vendedor y detalle conservan la composición previa de 0023.

Para envolver las publicaciones o secciones importantes de información:
* Fondo: `COLORS.white`
* Borde redondeado: `RADIUS.lg` (16 puntos).
* Profundidad: contorno de un punto `COLORS.border`, sin sombra en `Card`.
* Explorar: foto superior cuadrada del ancho de tarjeta o «Sin foto», información debajo con padding de 12 puntos. Una columna en ancho reducido o fontScale mayor a 1.2; dos desde aproximadamente 372 puntos y hasta tres en anchos mayores. Ancho mínimo objetivo de tarjeta 160 puntos. Estado, título, precio, zona y contexto separados; texto flexible sin truncar. Oferta conserva fondo naranja suave, etiqueta y ahorro. Reservas conservan su precio fijado y siguen la composición específica de 0032.

### Entradas de Texto (Inputs)
* Fondo: `COLORS.inputBg`.
* Altura mínima: `52px`; descripción multilínea de al menos 100 puntos; etiquetas visibles y variante blanca en formularios de publicación.
* Bordes redondeados: `RADIUS.md` (16px).
* Fuente: tokens `TYPE.body`/`TYPE.label` de 14 puntos, color `textDark`, texto escalable.
* Íconos alineados a la izquierda (ej. `<Ionicons>` en color `textLight`).

### Botones de Acción (Call to Action)
Contacto 0039: detalle LIVE visible conserva Apartar como principal y Contactar por WhatsApp como secundaria en el pie, con espacio de 8 puntos. STATIC conserva Contactar como principal. API anterior sin sellerContact oculta consulta previa; stock/horario/estado invalidado retira esa acción. Bloqueo durante confirmación/envío; fallo de apertura muestra aviso local y permite volver a pulsar Contactar sin recargar producto ni reservar. Contacto de reserva usa su propio título y no depende del detalle público. 16 capturas auxiliares/tipos/134 pruebas/exports PASS; apertura y retorno nativos pendientes.

* Botón principal de la pantalla: Fondo `COLORS.primary`.
* Bordes redondeados absolutos: `RADIUS.full` (999px).
* Altura: `52px`.
* Texto centrado, color blanco, tipografía `fontWeight: '700'`.

### Estados de Error

Ofertas 0037 (2026-11-21): Sin oferta/Manual/Programada disponibles antes del disparo; después de activar, modos y precio bloqueados. Mínimo estrictamente menor al normal con mensaje junto al campo; error de programación junto a minutos. Retirada/cambio de modo conservan el formulario y solo se confirman con Guardar cambios. Edición ajena al horario conserva el instante ISO original. Tipos/112 pruebas/exports y nueve capturas auxiliares PASS; aceptación nativa pendiente. Este ajuste no cierra el patrón completo 0034.

Errores 0034/0038 (2026-11-21): resumen persistente bajo el título, con altura máxima del 30% y desplazamiento propio si hace falta; no debe colapsar cuando el formulario enfoca un campo. Validación conjunta tras intentar enviar, texto/icono junto a cada origen y un solo anuncio. «Ir al primer campo» sigue el orden visual, incluida categoría antes de precio, tras actualizar layout. Fallos de acciones no se borran al escribir; reintentos por catálogo y foto ya subida reutilizable. Rechazo de contenido muestra mensaje del servidor y señala título/descripción sin perder borrador. 124 pruebas/19 capturas auxiliares/exports PASS; accesibilidad y teclado nativos pendientes.

Confirmación de apartado (0022): reutilizar `ConfirmationDialog` antes del primer apartado y de otra unidad, con producto, precio actual y plazo. «Sí, apartar» envía, «Volver» cierra sin efectos, «Apartando…» bloquea acciones y el error permite reintento idempotente. Modal desplazable, foco accesible y fondo excluido del lector; aceptación física de foco/lector/texto ampliado pendiente.

Errores de validación debajo del campo correspondiente, con borde, texto e icono `COLORS.error` y ayuda de accesibilidad. Los errores generales del servidor usan `InlineMessage` con fondo `COLORS.errorBg`; no se atribuyen arbitrariamente a la contraseña. Conservar el borrador y bloquear edición/envío mientras la solicitud real está en curso.

Refinamiento en código 0021: al enviar una publicación con título, descripción, precio o stock inválidos, enfocar y desplazar hasta el campo sin perder datos. Fotos de listados y detalle comparten `PublicationPhoto`: alternativa «Sin foto» ante ausencia/fallo, tamaño estable y nueva carga al cambiar URL; no ocultar información ni acciones. Verificación técnica y visual web; teclado y foco nativos pendientes.

## 5. Mejores Prácticas de Layout y Rendimiento (React Native)
Para asegurar que la app corra a 60 FPS y el código se mantenga limpio, la IA (y los desarrolladores) deben seguir estrictamente estas reglas:

*   **Uso de Flexbox:** Todo el maquetado debe resolverse utilizando Flexbox. Evitar márgenes mágicos o posiciones absolutas (`position: 'absolute'`) a menos que sea estrictamente necesario (ej. un botón flotante superpuesto).
*   **Listas Dinámicas (`FlatList` vs `ScrollView`):**
    *   **Obligatorio usar `<FlatList>`** para el Feed Principal de publicaciones y para cualquier catálogo que contenga múltiples items. Esto garantiza que las tarjetas se reciclen en memoria (lazy loading) y la app no se congele.
    *   Mis reservas usa `<SectionList>` (0032), también virtualizada, para separar pendientes e historial sin listas desplazables anidadas.
    *   **Usar `<ScrollView>`** únicamente para pantallas de contenido estático o formularios pequeños (ej. Login, Formulario de crear publicación), donde todo el contenido cabe lógicamente en una o dos pantallas de altura.
*   **Imágenes Optimizadas:** Usar el componente `<Image>` nativo o de Expo especificando siempre el tamaño (`width` y `height` o mediante Flex) para evitar saltos de layout cuando la imagen cargue desde internet.
*   **Separación de Estilos:** Evitar a toda costa los estilos en línea (`style={{ color: 'red' }}`). Todos los estilos deben estar organizados al final del archivo usando `StyleSheet.create({})`.
