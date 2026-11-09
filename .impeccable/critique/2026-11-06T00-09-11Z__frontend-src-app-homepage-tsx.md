---
target: "TapCampus: compra y venta"
total_score: 27
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 1
target_identity: "file:C:\\AM_PF\\ProyectoFinal\\Frontend\\src\\app\\homePage.tsx"
target_fingerprint: "sha256:def2a7087365f6408418c06d198968e2659e5149335bff78643f5b96bd3eaf73"
target_path: "C:\\AM_PF\\ProyectoFinal\\Frontend\\src\\app\\homePage.tsx"
timestamp: 2026-11-06T00-09-11Z
slug: frontend-src-app-homepage-tsx
closed: true
---
Method: design review only (detector not applicable, native platform)

# TapCampus — crítica de compra y venta

Fecha: 2026-11-05. Igual prioridad de comprador y vendedor, confirmada por el usuario.
Target estable: Frontend/src/app/homePage.tsx; recorrido asociado: detalle, formulario, reservas y ventas.
Modo Operate. Identidad aprobada en Figma/0019/0020, Inter y paleta conservados.

Revisión de código y capturas auxiliares existentes de 0020, contrastadas con tokens/componentes actuales. No es evaluación de usabilidad observada ni captura nativa. SDK Android localizado; adb devices vacío y emulator -list-avds sin resultados. Sin simulador iOS en Windows. Detector HTML y evaluación B no aplican al método nativo.

## Especificidad y valoración
La dirección es coherente con TapCampus: precio visible, venta con horario diferenciada del catálogo, navegación rotulada y reservas independientes. Conservarla. No hay escaneo determinista ni overlay: no aplican a fuente React Native.

## Heurísticas
| # | Heurística | Puntuación | Observación |
| --- | --- | --- | --- |
| 1 | Estado | 3 | Carga, envío y plazos visibles |
| 2 | Lenguaje | 3 | Terminología comprensible |
| 3 | Control | 3 | Regreso, cancelación y confirmaciones |
| 4 | Consistencia | 3 | Recuperación de imagen desigual |
| 5 | Prevención | 3 | Validación y acciones protegidas |
| 6 | Reconocimiento | 3 | Tipos y destinos visibles |
| 7 | Eficiencia | 2 | Hay que buscar errores de campos superiores |
| 8 | Mínimo | 3 | Encabezados compactos y jerarquía clara |
| 9 | Recuperación | 2 | Foco y alternativa de imagen incompletos |
| 10 | Ayuda | 2 | Instrucciones no siempre visibles al necesitarlas |
| Total | | 27/40 | Valoración provisional de evidencia disponible |

## Fortalezas
- Precio y contexto separados en las tarjetas.
- Tipos de venta y destinos rotulados.
- Confirmaciones e idempotencia protegen acciones de reserva/entrega.

## Priority Issues
1. P1: formulario de publicación. invalid() cambia fieldErrors sin desplazar ni enfocar el campo; con CTA inferior y contenido largo, el error superior puede quedar fuera de vista. Añadir foco/desplazamiento al campo inválido y conservar datos. Comando: impeccable polish.
2. P2: fotografía del detalle. ExpoImage no implementa alternativa al error, a diferencia del listado. Compartir respuesta para imagen ausente/fallida sin ocultar precio ni CTA y permitir nueva URL. Comando: impeccable polish.

## Carga cognitiva y recorrido emocional
El comprador reconoce tipo, precio y ubicación sin recordar rutas; formularios y filtros agrupan decisiones. El selector de zona tiene seis opciones incluyendo Todas, categorías hasta cinco; son catálogos reales, no se recortan arbitrariamente. Los formularios largos conservan complejidad intrínseca; el problema evitable es buscar un error después de enviar. La confirmación de reserva refuerza plazo/precio, pero una imagen fallida deja incertidumbre.

## Personas y observaciones menores
- Vendedor frecuente: corregir stock/título fuera de vista puede parecer un envío sin respuesta.
- Comprador con conectividad irregular: detalle sin alternativa de imagen deja un hueco sin diagnóstico.
- Usuario con baja visión: comprobar foco y tipografía ampliada en hardware; las capturas web no lo demuestran.
Áreas compactas de 44 puntos y movimiento reducido requieren revisión nativa adicional; no se rediseñan navegación o temas en este refinamiento.

## Preguntas de reflexión
¿La corrección del dato señalado resulta evidente desde el botón de envío? ¿Se entiende que una foto falló sin perder acceso al producto?

Questions skipped: 2 Priority Issues; ambas correcciones están dentro del plan aprobado.
