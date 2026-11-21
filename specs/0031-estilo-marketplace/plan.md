# Plan

AC-06: el destacado de homePage usa COLORS.white y aplica COLORS.gangaSoft solo si featured.is_ganga_active. Publisher_Card ya cumple esta regla y no necesita cambios. Mantener tokens compartidos y borde discreto del sistema. Verificar tipos/feed y composición auxiliar de normal/oferta/catálogo; hardware separado. Sin contratos ni migraciones; reversión local del estilo. Principios I/II/V/VI cubiertos por AC/T/EV y petición; III/IV sin cambios.

AC-05: renderizar el texto de stock solo para LIVE en Publisher_Card; STATIC termina en la zona. Sin cambios de estilos ni contratos. Verificar con tipos y regresión existente del feed; registrar evidencia nueva sin modificar EV-04.

Revisión 2026-11-10, AC-04: condicionar la fila de estado de Publisher_Card a LIVE, sin contenedor vacío para STATIC. Verificar tipos, regresión existente de feed y convergencia documental. Sin datos, migraciones ni contratos nuevos; reversión local del condicional. Principios I/II/V/VI: petición, criterio y evidencia en este expediente; III/IV: inventario, reservas y seguridad sin cambios.

AC-01: evolucionar theme.js y componentes compartidos; sustituir tonos beige por blancos cálidos y contornos discretos. AC-02: PublisherCard con variante de cuadrícula; FlatList con columnas calculadas desde useWindowDimensions y fontScale, clave de montaje por columnas y encabezado desplazable. Banner del primer resultado con foto real; ocultar sin datos, con consulta o filtros. AC-03: conservar servicios, hooks y handlers; verificar con Jest/tsc, fixture visual existente y compilación Expo SDK 58. Sin paquetes nuevos, migraciones ni cambios de API.

Constitución I: spec previa. II: RF/US → AC → T → EV. III: stock, tiempo y reservas permanecen bajo autoridad servidor. IV: sin nuevos contratos/contactos. V: pruebas y evidencia antes de cierre. VI: cambio visual autorizado, sin pagos ni GPS.

Riesgos: textos largos y precios comparados en dos columnas; usar wrap y una columna con tipografía ampliada. Reversión: restaurar archivos visuales del cambio; no hay datos que recuperar. Verificación nativa física pendiente separadamente.
