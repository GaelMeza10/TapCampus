---
name: TapCampus
description: Mercado universitario en vivo con verde UABC, fondo crema y fotografía real. Primero dónde y hasta cuándo; después el producto.
terminology:
  live: "Ahora en el campus"
  static: "Productos"
  staticSingular: "Producto"
  offerBadge: "GANGA"
colors:
  primary: "#17613B"
  primaryDark: "#124D2F"
  background: "#FAF5EA"
  white: "#FFFFFF"
  textDark: "#202923"
  textMedium: "#58645D"
  textLight: "#68756D"
  inputBg: "#F1ECDF"
  border: "#DDD6C4"
  error: "#B42318"
  disabled: "#B9C2B9"
  primarySoft: "#EAF1EA"
  navigationBar: "#124D2F"
  navigationGlassTint: "rgba(18, 77, 47, 0.88)"
  navigationText: "#D9E8DD"
  navigationSelected: "rgba(255, 255, 255, 0.16)"
  gangaSoft: "#FFF1E4"
  ganga: "#A44B16"
  stockLowBg: "#FBE3E0"
  stockLowText: "#8F1D17"
typography:
  brand: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: "30px", lineHeight: "36px" }
  title: { fontFamily: "Inter_700Bold", fontSize: "26px", lineHeight: "34px" }
  section: { fontFamily: "Inter_700Bold", fontSize: "22px", lineHeight: "30px" }
  heading: { fontFamily: "Inter_700Bold", fontSize: "18px", lineHeight: "25px" }
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: "16px", lineHeight: "22px" }
  body: { fontFamily: "Inter_400Regular", fontSize: "14px", lineHeight: "20px" }
  label: { fontFamily: "Inter_600SemiBold", fontSize: "14px", lineHeight: "20px" }
  caption: { fontFamily: "Inter_400Regular", fontSize: "13px", lineHeight: "19px" }
  badge: { fontFamily: "Inter_600SemiBold", fontSize: "12px", lineHeight: "17px" }
  controlCompact: { fontFamily: "Inter_600SemiBold", fontSize: "13px", lineHeight: "19px" }
  place: { fontFamily: "Inter_700Bold", fontSize: "13px", lineHeight: "19px" }
  price: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: "24px", lineHeight: "30px" }
  priceHero: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: "30px", lineHeight: "36px" }
  countdown: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: "20px", lineHeight: "28px" }
rounded:
  sm: "10px"
  md: "16px"
  lg: "16px"
  hero: "18px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  page: "20px"
  xl: "24px"
  xxl: "32px"
  section: "40px"
components:
  button-primary: { backgroundColor: "{colors.primary}", textColor: "{colors.white}", rounded: "{rounded.full}", typography: "{typography.label}", padding: "12px 16px", height: "52px" }
  button-secondary: { backgroundColor: "{colors.primarySoft}", textColor: "{colors.primary}", rounded: "{rounded.full}", height: "52px" }
  button-destructive: { backgroundColor: "{colors.error}", textColor: "{colors.white}", rounded: "{rounded.full}", height: "52px" }
  button-ghost: { backgroundColor: "transparent", textColor: "{colors.primary}", rounded: "{rounded.full}", height: "52px" }
  button-danger-ghost: { backgroundColor: "transparent", textColor: "{colors.error}", rounded: "{rounded.full}", height: "52px" }
  button-warning: { backgroundColor: "{colors.ganga}", textColor: "{colors.white}", rounded: "{rounded.full}", height: "52px" }
  button-field: { backgroundColor: "{colors.white}", textColor: "{colors.textDark}", rounded: "{rounded.md}", height: "52px" }
  button-sell: { backgroundColor: "{colors.primaryDark}", textColor: "{colors.white}", rounded: "{rounded.full}", height: "52px" }
  input: { backgroundColor: "{colors.inputBg}", textColor: "{colors.textDark}", rounded: "{rounded.lg}", typography: "{typography.body}", height: "52px" }
  card: { backgroundColor: "{colors.white}", rounded: "{rounded.lg}" }
  card-ganga: { backgroundColor: "{colors.gangaSoft}", rounded: "{rounded.hero}" }
  header-brand: { backgroundColor: "{colors.primaryDark}", textColor: "{colors.white}" }
  reservation-banner: { backgroundColor: "{colors.primarySoft}", textColor: "{colors.primaryDark}", rounded: "{rounded.md}" }
  zone-chip-selected: { backgroundColor: "{colors.textDark}", textColor: "{colors.white}", rounded: "{rounded.full}", height: "44px" }
  type-selected: { backgroundColor: "{colors.primary}", textColor: "{colors.white}", rounded: "{rounded.full}", height: "48px" }
  navigation-selected: { backgroundColor: "{colors.navigationSelected}", textColor: "{colors.white}", rounded: "{rounded.md}" }
---

# Design System: TapCampus

## Overview

**Creative North Star: "Mercado del campus, en vivo"**

TapCampus mezcla dos conductas de venta y el diseño debe dejarlas claras a primera vista. En una **venta en vivo** el comprador necesita saber dónde está el vendedor, hasta cuándo y cuántas piezas quedan. En un **producto** manda la fotografía del artículo. Ambas comparten el mismo lenguaje: fondo crema, verde UABC profundo, fotografías reales y superficies planas con borde.

El sistema evita el aspecto genérico de las apps de comida: sin degradados, sin sombras difusas y sin acentos de color repartidos por toda la pantalla. La identidad local viene del encabezado con la silueta del campus de Ensenada. Excepción autorizada 0044 (2026-11-22): liquid glass exclusivamente en la barra de tabs; material nativo verde profundo en iOS compatible y barra sólida en plataformas sin soporte o con transparencia reducida. El resto de las superficies conserva su tratamiento plano.

Este documento describe el tema claro. Las vistas web auxiliares permiten revisar composición; la aceptación de teclado, lector de pantalla y texto ampliado en hardware sigue pendiente.

**Key Characteristics:**
- Jerarquía por tipo: en vivo lee lugar, hora y stock antes que la foto; en productos la foto manda.
- Superficies planas con contornos discretos.
- Verde para acciones y selección; naranja exclusivo para Ganga; rojo para urgencia, errores y acciones destructivas.
- Identidad local: encabezado de marca con silueta del campus.

## Colors

### Primary
- **Verde UABC** (primary): acciones, selección y precio actual.
- **Verde profundo** (primaryDark): encabezado de marca, barra de navegación y botón Vender.
- primarySoft: acciones secundarias, banner de reserva activa y chip de stock normal.

### Neutral
- background es crema cálido y rodea tarjetas blancas; inputBg y border derivan del mismo tono cálido.
- textDark contiene títulos y contenido; textMedium y textLight distinguen contexto. Sobre crema, textMedium mantiene contraste suficiente para texto pequeño.
- disabled identifica controles bloqueados.

### Semantic
- **ganga / gangaSoft:** solo para Ganga (precio especial activo).
- **error:** validación, acciones destructivas y **tiempo crítico** en la etiqueta de cierre.
- **stockLowBg / stockLowText:** stock crítico.
- navigationBar, navigationText y navigationSelected: barra inferior verde profundo; material liquid glass exclusivo de tabs donde hay soporte, con alternativa sólida accesible.

**The Semantic Color Rule.** Cada color tiene un único significado. Naranja es Ganga y nada más; no se usa para pestañas, selección ni navegación. Rojo expresa urgencia o error, no decoración.

**The Not-Color-Alone Rule.** Ganga, tiempo crítico y stock crítico llevan siempre texto o etiqueta además de color.

## Typography

Inter se empaqueta para texto. **Bricolage Grotesque ExtraBold** se empaqueta solo para marca, precios y cuenta regresiva; no se usa en párrafos ni etiquetas. La escala normativa conserva los nombres de TYPE en theme.js; no son tamaños CSS que deban copiarse literalmente a puntos nativos.

El precio hero (Ganga) usa priceHero; el precio de tarjeta usa price. El título de tarjeta usa cardTitle; la zona usa place (negrita). Botones y selector compactos usan 13/19; la etiqueta activa de navegación usa Bold.

**The Compact Header Rule.** Encabezados breves y sin subtítulos redundantes. El encabezado de marca no repite el nombre de la pantalla; la barra de navegación ya lo indica.

## Layout

Flexbox, safe areas y texto flexible organizan las pantallas. Formularios desplazan contenido y evitan el teclado según plataforma. Los valores del frontmatter expresan la escala numérica nativa en px.

**Estructura de Explorar (de arriba abajo, todo dentro de la lista desplazable):**
1. Encabezado de marca (88 de alto): logo, «Campus Ensenada» y silueta del campus en blanco, abajo a la derecha. Esquina inferior izquierda redondeada.
2. Banner de reserva activa, solo si el usuario tiene una: nombre del producto, tiempo restante y botón «Ver».
3. Fila de búsqueda y filtros.
4. Selector de dos pestañas: **«Ahora en el campus»** y **«Productos»**, con una línea de ayuda que cambia con la pestaña.
5. Chips horizontales: zonas en «Ahora»; categorías en «Productos».
6. Contenido: Ganga destacada (si existe) y cuadrícula.

Los nombres de pestaña describen el comportamiento, no el tipo de producto: una venta en vivo puede ser material escolar y un producto puede ser comida.

**Cuadrícula.** FlatList con margen de contenido de 20, ancho mínimo objetivo 160, separación 12 y máximo tres columnas; pasa a una si fontScale supera 1.2. Cálculo: floor((width - 40 + 12) / (160 + 12)), entre una y tres. Ganga ocupa ancho completo.

Controles normales tienen mínimo 52 puntos; compactos 48; chips y «Ver» del banner 44; botón Vender 52. Navegación de cuatro destinos, mínimo 76 más ajuste de safe area, con áreas de pestaña de mínimo 56.

## Elevation & Depth

Card usa borde de un punto y ninguna sombra. El contraste entre fondo crema, blanco y superficies suaves crea profundidad. SHADOW.card sigue declarado en el tema, pero no forma parte del estilo de Card ni se prescribe para tarjetas nuevas. El encabezado permanece opaco. Solo las tabs pueden usar liquid glass por la petición explícita 0044.

## Shapes

md y lg comparten curva de 16; hero (Ganga) usa 18; sm conserva 10. Botones, selector y chips usan full. Las fotografías se recortan dentro de la tarjeta; imágenes y alternativas mantienen tamaño estable.

## Components

- **Botones:** principal verde, secundario verde suave, destructivo rojo, warning naranja (solo para acciones de Ganga), ghost transparente y field blanco con texto a la izquierda. Mínimos de altura, no altura fija ante texto ampliado. Pulsación a opacidad 0.75; bloqueados usan disabled y estado accesible; carga muestra indicador.
- **Entradas:** etiqueta persistente cuando corresponde, borde discreto, superficie suave o blanca. Error rojo con mensaje e icono; no editable a opacidad 0.55. Multilínea con mínimo 100. No se ha implementado un anillo de foco específico.
- **Formulario de publicación (0034/0038):** título fijo y resumen de errores fuera del scroll principal, limitado al 30% con desplazamiento propio; conservar altura al enfocar. Un solo anuncio y acción «Ir al primer campo»; texto/icono junto al origen. Validar conjuntamente tras intentar publicar, actualizar errores dependientes y conservar borrador/foto en rechazos. Catálogos con reintento individual; campos siguen el orden visual con categoría antes de precio. Tipos/foto/secciones se desplazan y el botón principal permanece en el pie. Revisión auxiliar no acredita teclado/lector nativos.
- **Tarjeta de venta en vivo:** foto superior baja (relación aproximada 16:10, no cuadrada) para dejar espacio a la información. Sobre la foto, arriba a la izquierda, la **etiqueta de cierre** «Cierra en N min». Debajo: título, precio y chip de stock en la misma fila; después **zona en negrita con pin** y, en texto secundario, «hasta h:mm pm · vendedor». Alternativa «Sin foto» ante ausencia o fallo. Sin truncar información.
- **Etiqueta de cierre:** fondo textDark con texto blanco; fondo error cuando quedan 15 minutos o menos (umbral propuesto, ajustable). Se actualiza en vivo.
- **Chip de stock:** «Quedan N» en primarySoft/primary; «Queda 1» o 2 o menos en stockLowBg/stockLowText (umbral propuesto, ajustable). Un solo patrón de texto en toda la app.
- **Tarjeta Ganga (ancho completo):** fondo gangaSoft con contorno ganga, etiqueta sólida «GANGA» en la foto y etiqueta de cierre. Precio vigente en priceHero con el anterior menor y tachado a su derecha; zona y hora de cierre en negrita; vendedor debajo. Botón «Reservar» a la derecha. Aparece arriba cuando hay una oferta activa y no se inventan promociones para llenar el espacio.
- **Tarjeta de producto:** foto cuadrada grande, etiqueta «Nuevo» o «Usado» sobre la foto, título (hasta dos líneas), precio y zona con pin. Sin temporizador, stock ni reservas; el contacto es por WhatsApp desde el detalle.
- **Banner de reserva activa:** fondo primarySoft, borde primary, texto «Reserva activa», producto y cuenta regresiva en countdown; botón «Ver» de 44 de alto. Cuando quedan 5 minutos o menos la cuenta pasa a error.
- **Chips de zona/categoría:** píldoras de 44 de alto con scroll horizontal. Seleccionado: textDark con texto blanco; reposo: transparente con borde. Las zonas vienen del catálogo del servidor, no del código.
- **Precio:** actual primero, anterior menor y tachado a su derecha solo cuando es válido y mayor; ahorro debajo. Permitir wrap. El temporizador queda separado de la etiqueta Ganga; las reservas conservan su precio fijado.
- **Selector:** dos píldoras con texto blanco y fondo verde en selección; blanco y texto secundario en reposo. Pulsación a opacidad 0.7.
- **Navegación:** barra única persistente en el navegador de tabs con Explorar, Reservas, Mis ventas y Cuenta. Material nativo liquid glass verde profundo cuando está disponible; alternativa sólida navigationBar con transparencia reducida o sin soporte. Contenedor con esquinas de 18 y margen lateral de 12; ocupa su espacio en el layout, sin cubrir contenido. Iconos de 24, etiqueta navigationText en reposo; seleccionado con texto/icono blanco en negrita sobre navigationSelected. Botón **«Vender»** extendido (icono + texto) encima de la barra, en primaryDark con texto blanco; abre la elección entre «Ahora en el campus» y «Productos» y entra directamente al formulario elegido.
- **Estados vacío, carga y error:** cada lista los define. Vacío de «Ahora»: «Nadie vende ahora. Mira los productos», con botón que cambia de pestaña. Carga con esqueleto de tarjetas.

Los snippets del sidecar son traducciones HTML/CSS para vista previa; no sustituyen componentes Expo ni acreditan comportamiento nativo.

## Filtros, detalles y Mi cuenta

Implementación 0043 según las referencias suministradas:

- **Filtros:** hoja crema con asa decorativa, cierre con contorno y chips envolventes; selección oscura con marca de verificación y texto blanco. Conteos de publicaciones reales por tipo/búsqueda y la otra dimensión seleccionada; ceros conocidos deshabilitados salvo la selección vigente. No confundir publicaciones con vendedores. Carga y fallo no inventan ceros. Pie fijo con total y Restablecer; cerrar descarta borrador. Controles de mínimo 48 y acciones de 52, con crecimiento de texto.
- **Detalle de producto:** foto amplia, etiquetas PRODUCTO/condición/categoría reales, título y precio en fila adaptable; ubicación en superficie blanca con pin, descripción abierta y vendedor con iniciales. Pie con explicación sin reserva y WhatsApp. No mostrar Reportar hasta implementar la moderación; no inventar edificios o condición histórica.
- **Detalle en vivo:** mismo lenguaje, con etiqueta de cierre, stock textual y zona/hora de fin. Ganga usa naranja y comparación válida de precios. Pie con Apartar una unidad y contacto; confirmación, idempotencia y reservas anteriores se conservan. No existe una referencia LIVE separada: se deriva de los tokens y reglas LIVE de este documento.
- **Mi cuenta:** encabezado de campus desplazable, avatar contorneado de 80, Editar datos con borde, contacto blanco agrupado, correo Solo lectura y ayuda para mantener el teléfono de WhatsApp actualizado. Salida con contorno rojo. Edición, carga, error y confirmación de guardado mantienen los contratos existentes; teléfono legible por grupos sin modificar el valor enviado.

## Do's and Don'ts

### Do:
- **Do** reutilizar theme.js y componentes compartidos.
- **Do** usar fotos reales de la API y una alternativa estable si faltan.
- **Do** poner zona y hora de cierre a la vista en toda venta en vivo.
- **Do** permitir wrap y crecimiento de texto antes de recortar.
- **Do** conservar cuatro destinos y diferenciar precio vigente de precio fijado.
- **Do** acompañar el color de urgencia y de Ganga con texto.

### Don't:
- **Don't** usar naranja para selección, pestañas o navegación: es solo de Ganga.
- **Don't** usar degradados, sombras difusas ni glass fuera de las tabs. Las tabs son la única excepción autorizada para el material nativo.
- **Don't** usar emojis como iconos; un solo set de iconos de línea.
- **Don't** añadir carrito, favoritos, calificaciones ni botones de pago.
- **Don't** usar promociones inventadas para rellenar el destacado.
- **Don't** mezclar los dos tipos en una misma tarjeta: lo en vivo muestra tiempo y stock; el producto no.
- **Don't** declarar hardware o tema oscuro verificados mediante capturas web.

## Pendientes de decisión

- Umbrales de urgencia (tiempo ≤ 15 min, stock ≤ 2, reserva ≤ 5 min): propuesta inicial.
- Catálogo aprobado 0047: seis categorías de alimentos LIVE y diez de productos por cada tipo (26 filas), con IDs originales conservados.
- Aceptación nativa de reserva, panel de vendedor y formulario con el lenguaje compartido de 0044; la evidencia auxiliar no acredita hardware.

## Consistencia integral 0044

Recuperación 0045: acceso/registro/cuenta conservan errores generales al escribir; la validación por campo solo se limpia al corregir ese campo. Ventas/reservas/detalle presentan avisos persistentes fuera del scroll principal, con máximo 30% y scroll propio. Fallo al consultar reservas no significa lista vacía; 404 se distingue de desconexión. No mostrar mensajes de infraestructura en inglés ni excepciones nativas de selección de foto.

- Todas las pantallas conservan crema, Inter, Bricolage para marca/precio/reloj y componentes compartidos. Acceso y registro incorporan CampusHeader; iconos Ionicons sustituyen glifos de regreso y checkbox.
- Las cuatro tabs tienen el encabezado de campus dentro del contenido desplazable. Mis ventas separa Ahora en el campus/Productos, presenta foto real, estado, precio, zona y disponibilidad antes de las acciones. Reservas mantiene Por recoger/Anteriores y precio fijado; a ≤5 minutos muestra «Por vencer», icono y reloj rojo.
- Los nombres de tipo se comparten en Explorar, Vender, filtros y Mis ventas: LIVE es «Ahora en el campus» y STATIC es «Productos». Vender pregunta una sola vez y explica horario/apartados frente a contacto directo. LIVE abre «Ahora en el campus», STATIC abre «Nuevo producto», sin selector. Edición tampoco muestra selector; el tipo se obtiene del servidor. Solo un enlace de creación sin tipo conserva la elección inicial.
- MarketplaceViewport aplica insets superiores/laterales una sola vez mediante padding explícito; BottomNavigation aplica el inferior. Los scrolls de páginas desactivan el ajuste automático de contenido e indicadores. Flex con minHeight 0 y barra fuera del scroll mantienen contenido dentro del área disponible al cambiar de tab.

## Comprobación de consistencia

La terminología de tipos y sus insignias procede de `src/lib/publication-copy.ts`; los selectores no aceptan nombres locales alternativos. «Producto» es la forma singular en el detalle; «Productos» nombra la sección sin horario, con compra y entrega por acuerdo. La insignia de un precio reducido es siempre «GANGA»; «Precio de oferta» describe su configuración. «Reservar» en el destacado abre el detalle; la operación confirmada sigue llamándose «Apartar una unidad».

0047: Productos permite zona concreta o «Punto de entrega por acordar dentro del campus»; LIVE siempre exige zona. Reservas muestran «Ubicación: …» desde su instantánea, vendedor, unidad y plazo. Históricos sin instantánea dicen «Ubicación de referencia» y solicitan confirmar con el vendedor. Oferta programada usa horas/minutos sin teclado, conserva valores al editar y no corrige silenciosamente duraciones inválidas. Cerrar sesión requiere confirmación con error/reintento. Stock cero sale de disponibles con aviso breve y conserva reservas e historial. Los insets/frames nativos se miden antes de dar por resuelto el desplazamiento al cambiar tabs.

`npm run check:design` contrasta los tokens de este encabezado con `src/theme.js`, valida la terminología y revisa todas las fuentes del frontend para detectar etiquetas anteriores, colores/fuentes locales, glass fuera de tabs, áreas seguras duplicadas en las tabs y glifos que sustituyan iconos. La comprobación también se ejecuta antes de `npm test`; las pruebas de navegación verifican la elección única del tipo y la edición con el tipo del servidor. Los ensayos visuales cubren rutas y estados; sus capturas auxiliares no certifican teclado, lector ni gestos en teléfono.
