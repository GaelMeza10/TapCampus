# 0044 — Consistencia de pantallas y publicación directa

Estado: En verificación; técnico y composición auxiliar aprobados, hardware pendiente | Fecha: 2026-11-22

## Contexto y fuentes

Petición explícita: aplicar Impeccable a toda la aplicación, respetar DESIGN.md, evitar elegir dos veces el tipo de publicación, unificar Mis ventas/Reservas y corregir contenido desplazado. RF-01/02/03/06/07/08/13, RNF-03; US-01/02/03/04/06/07/09/11; TASKS 5.34. Base: 0041–0043 y docs/04_UI_UX_GUIDELINES.md, docs/05_USER_FLOWS.md.

Actual: Vender transmite type, pero edit siempre dibuja TypeSelector; Mis ventas y Reservas conservan composiciones anteriores. Cada pantalla monta una barra inferior propia dentro del navegador con barra nula. Los scrolls no fijan explícitamente la política de ajuste automático iOS.

## Alcance y contratos

Todas las rutas Expo: acceso, registro, cuatro tabs, detalle y formulario; componentes compartidos y estados. API, inventario, privacidad, precios y plazos conservan los contratos existentes. Sin migraciones. Liquid glass exclusivamente en la barra de tabs, excepción solicitada a DESIGN.md (DEC-01). Los dispositivos sin soporte mantienen una barra sólida legible.

## Criterios de aceptación

### AC-01 — Elegir una vez
Dado Vender o Nueva publicación desde Mis ventas, cuando se transmite LIVE/STATIC, entonces el formulario muestra Venta en vivo/Anuncio y únicamente sus campos, sin selector repetido. Editar usa el tipo del servidor sin selector. Un enlace sin tipo permite elegirlo una vez en el formulario.

### AC-02 — Área visible estable
Dadas las cuatro tabs, cuando se alternan repetidamente o se abre y cierra detalle/formulario, entonces hay una sola barra persistente, una sola aplicación de insets superiores y ninguna acumulación del ajuste automático de scroll. Contenido flexible y desplazable con acciones inferiores alcanzables; texto ampliado no expulsa las tabs.

### AC-03 — Lenguaje visual compartido
Dadas todas las pantallas y sus estados, entonces comparten crema, verde UABC, tipografía empaquetada, contornos, botones y vocabulario Venta en vivo/Anuncio. Mis ventas y Reservas adoptan encabezado de campus desplazable; producto, zona/plazo y acciones son reconocibles. Urgencia de reserva ≤5 minutos usa texto e icono, conservando precio reservado. Acceso/registro y detalle/formulario mantienen controles compartidos y scroll explícito.

### AC-04 — Glass acotado y accesible
La única superficie glass es la barra inferior de cuatro destinos, con selección accesible, controles de mínimo 56 y safe area inferior. iOS compatible usa expo-glass-effect instalado; transparencia reducida o plataforma sin soporte usa superficie sólida sin perder contraste.

### AC-05 — Regresión y evidencia honesta
Tipos, suites, exports Android/iOS y check-sdd aprobados. Revisar composición auxiliar en 320/390/430 y texto ampliado, con recorrido Vender LIVE/STATIC y tabs repetidas. Registrar límites de evidencia nativa y no cerrar aceptación física sin ejecutarla.

## Decisiones abiertas

Ninguna que afecte a la implementación; DEC-01/02 resueltas en decisions.md. La aceptación física se registra separadamente.
