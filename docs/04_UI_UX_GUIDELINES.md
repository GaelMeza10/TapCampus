# Guía de Diseño y UI/UX (TapCampus)

## 1. Principios de Consistencia Visual

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
* `background: '#EDEAE3'` - Fondo base para el 100% de las vistas principales.
* `white: '#FFFFFF'` - Usado exclusivamente dentro de las Cards, Modales y contenedores que flotan sobre el fondo general.
* `textDark: '#1A1A1A'` - Textos de encabezados (Títulos).
* `textMedium: '#56615B'` - Subtítulos, párrafos, o descripciones de publicaciones.
* `textLight: '#A0AEC0'` - Placeholders e íconos inactivos.
* `inputBg: '#F3F4F6'` - Fondo para `TextInput`.
* `border: '#D7DED8'` - Divisiones, líneas separadoras.
* `error: '#B42318'` - Acciones destructivas y errores legibles.

Selector «Disponibles ahora / Catálogo» encima de Filtros, hoja con selección provisional y botón Aplicar. Barra inferior Explorar/Reservas/Mis ventas/Cuenta (0026); FAB + de 56 puntos arriba de la barra. Reservas con precio fijado y reloj propio; venta finalizada conserva entregas vigentes y oculta acciones inválidas. Las fotos reales vienen de la API; no usar las ilustraciones de ejemplo como productos fijos.

Evolución del prototipo (0017/0018, aplicada a Expo en 0020): navegación inferior con SVG locales de brújula/comprobante/bolsa de 24 px y etiquetas; activo verde e inactivo gris, destinos táctiles de al menos 44 px. Mis ventas separa tipo y estado: selector Con horario/Catálogo debajo del título, con ambas opciones visibles. Con horario incluye publicaciones LIVE finalizadas. Explorar mantiene Disponibles ahora.

## 4. Estilos de Componentes Comunes

### Layouts
* Todo screen principal debe estar envuelto en `<SafeAreaView>` con color de fondo `COLORS.background`.
* Los formularios siempre usarán `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` y un `<ScrollView>`.

### Tarjetas (Cards)
En reservas de comprador (0023), cabecera con miniatura de 80×80, título/unidad y precio fijado en columna flexible; estado, plazo y acciones conservados. Reutilizar `PublicationPhoto` con etiqueta accesible y alternativa ante fallo/ausencia. La rama compacta de entregas del vendedor conserva su composición.

Para envolver las publicaciones o secciones importantes de información:
* Fondo: `COLORS.white`
* Borde redondeado: `RADIUS.lg` (24px).
* Sombras: Implementar constante `SHADOW.card` (sombra ligera difuminada).
* Listados: una estructura para todas las publicaciones, foto de 100×100 o «Sin foto»; estado, título, precio, zona y contexto separados. Texto flexible, sin altura fija ni formato distinto por posición del producto.

### Entradas de Texto (Inputs)
* Fondo: `COLORS.inputBg`.
* Altura mínima: `52px`; descripción multilínea de al menos 100 puntos; etiquetas visibles y variante blanca en formularios de publicación.
* Bordes redondeados: `RADIUS.md` (16px).
* Fuente: tokens `TYPE.body`/`TYPE.label` de 14 puntos, color `textDark`, texto escalable.
* Íconos alineados a la izquierda (ej. `<Ionicons>` en color `textLight`).

### Botones de Acción (Call to Action)
* Botón principal de la pantalla: Fondo `COLORS.primary`.
* Bordes redondeados absolutos: `RADIUS.full` (999px).
* Altura: `52px`.
* Texto centrado, color blanco, tipografía `fontWeight: '700'`.

### Estados de Error
Confirmación de apartado (0022): reutilizar `ConfirmationDialog` antes del primer apartado y de otra unidad, con producto, precio actual y plazo. «Sí, apartar» envía, «Volver» cierra sin efectos, «Apartando…» bloquea acciones y el error permite reintento idempotente. Modal desplazable, foco accesible y fondo excluido del lector; aceptación física de foco/lector/texto ampliado pendiente.

Errores de validación debajo del campo correspondiente, con borde, texto e icono `COLORS.error` y ayuda de accesibilidad. Los errores generales del servidor usan `InlineMessage` con fondo `COLORS.errorBg`; no se atribuyen arbitrariamente a la contraseña. Conservar el borrador y bloquear edición/envío mientras la solicitud real está en curso.

Refinamiento en código 0021: al enviar una publicación con título, descripción, precio o stock inválidos, enfocar y desplazar hasta el campo sin perder datos. Fotos de listados y detalle comparten `PublicationPhoto`: alternativa «Sin foto» ante ausencia/fallo, tamaño estable y nueva carga al cambiar URL; no ocultar información ni acciones. Verificación técnica y visual web; teclado y foco nativos pendientes.

## 5. Mejores Prácticas de Layout y Rendimiento (React Native)
Para asegurar que la app corra a 60 FPS y el código se mantenga limpio, la IA (y los desarrolladores) deben seguir estrictamente estas reglas:

*   **Uso de Flexbox:** Todo el maquetado debe resolverse utilizando Flexbox. Evitar márgenes mágicos o posiciones absolutas (`position: 'absolute'`) a menos que sea estrictamente necesario (ej. un botón flotante superpuesto).
*   **Listas Dinámicas (`FlatList` vs `ScrollView`):**
    *   **Obligatorio usar `<FlatList>`** para el Feed Principal de publicaciones y para cualquier catálogo que contenga múltiples items. Esto garantiza que las tarjetas se reciclen en memoria (lazy loading) y la app no se congele.
    *   **Usar `<ScrollView>`** únicamente para pantallas de contenido estático o formularios pequeños (ej. Login, Formulario de crear publicación), donde todo el contenido cabe lógicamente en una o dos pantallas de altura.
*   **Imágenes Optimizadas:** Usar el componente `<Image>` nativo o de Expo especificando siempre el tamaño (`width` y `height` o mediante Flex) para evitar saltos de layout cuando la imagen cargue desde internet.
*   **Separación de Estilos:** Evitar a toda costa los estilos en línea (`style={{ color: 'red' }}`). Todos los estilos deben estar organizados al final del archivo usando `StyleSheet.create({})`.
