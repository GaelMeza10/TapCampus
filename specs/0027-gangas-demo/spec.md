# 0027 — Publicaciones de ejemplo en ganga

Estado: Verificado (datos locales y HTTP; aceptación física separada) | Fecha: 2026-11-09

Petición explícita del usuario: agregar algunas publicaciones en ganga al terminar 0026. RF-03/11/12; US-03/05; TASKS 1.6. Datos locales de demostración; no nuevas funciones ni Figma.

### AC-01 — Tres ejemplos visibles

Crear tres LIVE Demo: con fotografía ilustrativa existente, descripción de demostración, stock positivo, zona/categoría válidas, horario de siete días y ganga activa con precio previo mayor que el actual. El feed real muestra los tres y las imágenes responden 200.

### AC-02 — Conservación y repetibilidad

UUID fijos nuevos; segunda ejecución crea cero. No actualizar publicaciones anteriores, usuarios, reservas o catálogos, ni restablecer horarios o stock. Utilizar el vendedor de una publicación Demo histórica existente; si falta, fallar. Script optativo independiente del seed normal.

### AC-03 — Verificación trazable

Registrar conteos antes/después, conservación por hash de datos previos, GET feed y fotos reales. Tipos/build/lint y check-sdd. No equivale a UAT móvil de ganga.
