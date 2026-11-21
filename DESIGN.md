---
name: TapCampus
description: Marketplace universitario fotográfico con verde UABC e Inter local.
colors:
  primary: "#17613B"
  primaryDark: "#124D2F"
  background: "#F8F9F7"
  white: "#FFFFFF"
  textDark: "#202923"
  textMedium: "#58645D"
  textLight: "#68756D"
  inputBg: "#F1F3F0"
  border: "#E2E7E1"
  error: "#B42318"
  disabled: "#B9C2B9"
  primarySoft: "#EAF1EA"
  navigationSelected: "rgba(23, 97, 59, 0.12)"
  gangaSoft: "#FFF1E4"
  ganga: "#A44B16"
typography:
  brand: { fontFamily: "Inter_700Bold", fontSize: "28px", lineHeight: "36px" }
  title: { fontFamily: "Inter_700Bold", fontSize: "26px", lineHeight: "34px" }
  section: { fontFamily: "Inter_700Bold", fontSize: "22px", lineHeight: "30px" }
  heading: { fontFamily: "Inter_700Bold", fontSize: "18px", lineHeight: "25px" }
  body: { fontFamily: "Inter_400Regular", fontSize: "14px", lineHeight: "20px" }
  label: { fontFamily: "Inter_600SemiBold", fontSize: "14px", lineHeight: "20px" }
  caption: { fontFamily: "Inter_400Regular", fontSize: "13px", lineHeight: "19px" }
  badge: { fontFamily: "Inter_600SemiBold", fontSize: "12px", lineHeight: "17px" }
  price: { fontFamily: "Inter_700Bold", fontSize: "24px", lineHeight: "32px" }
  countdown: { fontFamily: "Inter_700Bold", fontSize: "20px", lineHeight: "28px" }
rounded:
  sm: "10px"
  md: "16px"
  lg: "16px"
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
  input: { backgroundColor: "{colors.inputBg}", textColor: "{colors.textDark}", rounded: "{rounded.lg}", typography: "{typography.body}", height: "52px" }
  card: { backgroundColor: "{colors.white}", rounded: "{rounded.lg}" }
  type-selected: { backgroundColor: "{colors.primary}", textColor: "{colors.white}", rounded: "{rounded.full}", height: "48px" }
  navigation-selected: { backgroundColor: "{colors.navigationSelected}", textColor: "{colors.primary}", rounded: "{rounded.md}" }
---

# Design System: TapCampus

## Overview

**Creative North Star: "Marketplace fotográfico del campus"**

La referencia Oakory aprobada se adapta a React Native/Expo: fondo casi blanco, verde UABC, Inter local y fotografías reales. La información de disponibilidad y precio acompaña al producto con encabezados compactos y controles familiares.

Este documento describe el tema claro implementado. Las vistas web auxiliares permiten revisar composición; la aceptación de teclado, lector de pantalla y texto ampliado en hardware sigue pendiente.

**Key Characteristics:**
- Fotografía superior y contenido flexible.
- Superficies claras con contornos discretos.
- Verde para acciones y selección; naranja para Oferta.

## Colors

El verde UABC estructura las acciones, los neutros separan superficies y el naranja identifica descuentos.

### Primary
- **Verde UABC**: primary en acciones, marca y selección; primarySoft en acciones secundarias y destacados reales.
- navigationSelected aporta el fondo translúcido de la pestaña activa. primaryDark existe en el tema; el botón compartido expresa la pulsación mediante opacidad.

### Neutral
- background rodea tarjetas blancas; inputBg ofrece una entrada suave y alternativa de fotografía.
- textDark contiene títulos y contenido; textMedium y textLight distinguen contexto e iconos secundarios.
- border separa superficies sin competir con imágenes; disabled identifica controles bloqueados.

El par ganga/gangaSoft distingue Oferta. error identifica validación y acciones destructivas.

**The Semantic Color Rule.** Mantener Oferta en naranja y errores o acciones destructivas en rojo.

## Typography

Inter se empaqueta localmente. La escala normativa conserva los nombres de TYPE en theme.js; no son tamaños CSS que deban copiarse literalmente a puntos nativos.

Marca y títulos usan Inter Bold; contenido usa Regular y etiquetas SemiBold. PageHeader ajusta la marca a 26/34 con espaciado de letras de -0.7; no altera el token brand. El precio compacto usa heading. Botones y selector compactos usan 13/19; la etiqueta activa de navegación usa Bold.

**The Compact Header Rule.** Usar encabezados breves sin subtítulos redundantes; conservar instrucciones y mensajes necesarios.

## Layout

Flexbox, safe areas y texto flexible organizan las pantallas. Formularios desplazan contenido y evitan el teclado según plataforma. Los valores del frontmatter expresan la escala numérica nativa en px para intercambio documental.

Explorar usa FlatList: margen efectivo de contenido de 20 puntos, fotos cuadradas arriba y cuerpo con padding md. La cuadrícula calcula columnas con ancho mínimo objetivo 160, separación de cálculo 12 y máximo tres columnas; pasa a una si fontScale supera 1.2. El cálculo es floor((width - 40 + 12) / (160 + 12)), limitado entre una y tres.

La fila de búsqueda y filtros precede al selector. El encabezado se desplaza con la lista. El destacado usa un producto real con foto, enlaza a detalle y aparece sin consulta ni filtros tras cargar datos. Esta composición pertenece a Explorar; no es plantilla obligatoria de otros módulos.

Controles normales tienen mínimo 52 puntos; compactos 48; FAB 56. Navegación de cuatro destinos, mínimo 76 más ajuste de safe area, con áreas de pestaña de mínimo 56.

## Elevation & Depth

Card usa borde de un punto y ninguna sombra. El contraste entre fondo, blanco y superficies suaves crea profundidad. SHADOW.card sigue declarado en el tema, pero no forma parte del estilo de Card ni se prescribe para tarjetas nuevas.

## Shapes

md y lg comparten curva de 16; sm conserva 10. Botones y selector usan full. Las fotografías se recortan dentro de la tarjeta; imágenes y alternativas mantienen tamaño estable.

## Components

- **Botones:** principal verde, secundario verde suave, destructivo rojo, warning naranja, ghost transparente y field blanco con texto alineado a la izquierda. Mínimos de altura, no altura fija ante texto ampliado. Pulsación a opacidad 0.75; bloqueados usan disabled y estado accesible; carga muestra indicador.
- **Entradas:** etiqueta persistente cuando corresponde, borde discreto, superficie suave o blanca. Error rojo con mensaje e icono; no editable a opacidad 0.55. Multilínea con mínimo 100. No se ha implementado un anillo de foco específico.
- **Formulario de publicación (0034/0038):** título fijo y resumen de errores fuera del scroll principal, limitado al 30% con desplazamiento propio; conservar altura al enfocar. Un solo anuncio y acción «Ir al primer campo»; texto/icono junto al origen. Validar conjuntamente tras intentar publicar, actualizar errores dependientes y conservar borrador/foto en rechazos. Catálogos con reintento individual; campos siguen el orden visual con categoría antes de precio. Tipos/foto/secciones se desplazan y el botón principal permanece en el pie. Revisión auxiliar no acredita teclado/lector nativos.
- **Tarjeta de publicación:** foto superior cuadrada, título, precio, zona y disponibilidad debajo. Alternativa Sin foto ante ausencia/fallo. Oferta conserva fondo suave naranja y distintivo sólido; sin truncar información.
- **Destacado de Explorar:** blanco y contorno discreto como las tarjetas normales; fondo gangaSoft solo si la publicación tiene oferta activa. Fotografía, precio y apertura del detalle se conservan.
- **Precio:** actual primero, anterior menor y tachado a su derecha solo cuando es válido y mayor; ahorro debajo. Permitir wrap. El temporizador queda separado de la etiqueta Oferta; reservas conservan su precio fijado.
- **Selector:** dos píldoras con texto blanco y fondo verde en selección; blanco y texto secundario en reposo. Pulsación a opacidad 0.7.
- **Navegación:** Explorar, Reservas, Mis ventas y Cuenta. Iconos de 24, etiqueta, selección translúcida y texto/icono verde. FAB de publicar encima de la barra. Cuenta usa person-outline.

Los snippets del sidecar son traducciones HTML/CSS para vista previa; no sustituyen componentes Expo ni acreditan comportamiento nativo. El foco visible del navegador se conserva mediante outline automático de la vista previa.

## Do's and Don'ts

### Do:
- **Do** reutilizar theme.js y componentes compartidos.
- **Do** usar fotos reales de la API y una alternativa estable si faltan.
- **Do** permitir wrap y crecimiento de texto antes de recortar.
- **Do** conservar cuatro destinos y diferenciar precio vigente de precio fijado.

### Don't:
- **Don't** añadir carrito, favoritos ni calificaciones.
- **Don't** usar promociones inventadas para rellenar el destacado.
- **Don't** añadir sombras a Card como regla del sistema.
- **Don't** declarar hardware o tema oscuro verificados mediante capturas web.
