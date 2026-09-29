# Guía de Diseño y UI/UX (TapCampus)

## 1. Principios de Consistencia Visual
Todas las interfaces deben basarse en el archivo principal de tokens (`theme.js`) y respetar la estructura sentada en las vistas de Autenticación (`login.tsx` / `register.tsx`).

## 2. Heurísticas de Usabilidad (Nielsen) Aplicadas
Para garantizar una experiencia intuitiva, el diseño se rige bajo las siguientes heurísticas:
*   **Visibilidad del estado del sistema:** El uso de temporizadores regresivos en tiempo real y contadores de stock aseguran que el usuario siempre sepa si el producto sigue disponible.
*   **Prevención de errores:** Los botones críticos (como cancelar reserva o finalizar publicación) deben requerir confirmación (Modal) antes de ejecutarse. Los inputs bloquean formatos incorrectos (ej. correo sin `@uabc.edu.mx`).
*   **Control y libertad del usuario:** El comprador siempre tiene visible un botón de "Cancelar Reserva" por si cambia de opinión, sin necesidad de contactar al vendedor.
*   **Reconocimiento antes que recuerdo:** Los filtros están expuestos visualmente (botones de categorías) en lugar de requerir que el usuario escriba la categoría exacta en un buscador.

## 3. Paleta de Colores (`COLORS`)
* `primary: '#4CAF6F'` - Botones primarios, acentos, y validaciones positivas.
* `primaryDark: '#3A9B5C'` - Hover o estado presionado.
* `background: '#EDEAE3'` - Fondo base para el 100% de las vistas principales.
* `white: '#FFFFFF'` - Usado exclusivamente dentro de las Cards, Modales y contenedores que flotan sobre el fondo general.
* `textDark: '#1A1A1A'` - Textos de encabezados (Títulos).
* `textMedium: '#6B7280'` - Subtítulos, párrafos, o descripciones de publicaciones.
* `textLight: '#A0AEC0'` - Placeholders e íconos inactivos.
* `inputBg: '#F3F4F6'` - Fondo para `TextInput`.
* `border: '#E5E7EB'` - Divisiones, líneas separadoras.
* `error: '#EF4444'` - Mensajes de advertencia o error.

## 3. Estilos de Componentes Comunes

### Layouts
* Todo screen principal debe estar envuelto en `<SafeAreaView>` con color de fondo `COLORS.background`.
* Los formularios siempre usarán `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` y un `<ScrollView>`.

### Tarjetas (Cards)
Para envolver las publicaciones o secciones importantes de información:
* Fondo: `COLORS.white`
* Borde redondeado: `RADIUS.lg` (24px).
* Sombras: Implementar constante `SHADOW.card` (sombra ligera difuminada).

### Entradas de Texto (Inputs)
* Fondo: `COLORS.inputBg`.
* Altura: `52px`.
* Bordes redondeados: `RADIUS.md` (16px).
* Fuente: `15px`, color `textDark`.
* Íconos alineados a la izquierda (ej. `<Ionicons>` en color `textLight`).

### Botones de Acción (Call to Action)
* Botón principal de la pantalla: Fondo `COLORS.primary`.
* Bordes redondeados absolutos: `RADIUS.full` (999px).
* Altura: `52px`.
* Texto centrado, color blanco, tipografía `fontWeight: '700'`.

### Estados de Error
Los mensajes de error deben aparecer en cajas rojas sutiles sobre los inputs, no mediante `Alert()` del sistema. 
* Caja: `backgroundColor: '#FEF2F2'` con bordes `RADIUS.md` (16px).
* Texto y el ícono: `color: COLORS.error`.

## 4. Mejores Prácticas de Layout y Rendimiento (React Native)
Para asegurar que la app corra a 60 FPS y el código se mantenga limpio, la IA (y los desarrolladores) deben seguir estrictamente estas reglas:

*   **Uso de Flexbox:** Todo el maquetado debe resolverse utilizando Flexbox. Evitar márgenes mágicos o posiciones absolutas (`position: 'absolute'`) a menos que sea estrictamente necesario (ej. un botón flotante superpuesto).
*   **Listas Dinámicas (`FlatList` vs `ScrollView`):**
    *   **Obligatorio usar `<FlatList>`** para el Feed Principal de publicaciones y para cualquier catálogo que contenga múltiples items. Esto garantiza que las tarjetas se reciclen en memoria (lazy loading) y la app no se congele.
    *   **Usar `<ScrollView>`** únicamente para pantallas de contenido estático o formularios pequeños (ej. Login, Formulario de crear publicación), donde todo el contenido cabe lógicamente en una o dos pantallas de altura.
*   **Imágenes Optimizadas:** Usar el componente `<Image>` nativo o de Expo especificando siempre el tamaño (`width` y `height` o mediante Flex) para evitar saltos de layout cuando la imagen cargue desde internet.
*   **Separación de Estilos:** Evitar a toda costa los estilos en línea (`style={{ color: 'red' }}`). Todos los estilos deben estar organizados al final del archivo usando `StyleSheet.create({})`.
