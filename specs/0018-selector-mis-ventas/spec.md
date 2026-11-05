# 0018 — Selector explícito en Mis ventas

Estado: **Verificado** | Fecha: 2026-11-05 | Alcance: prototipo

El usuario identifica confusión en el botón superior derecho Catálogo/Disponibles ahora y solicita corregir el prototipo con criterios UI/UX. Fuentes: docs/04_UI_UX_GUIDELINES.md, docs/05_USER_FLOWS.md, RF-03/RF-06/RF-08, US-03/US-04/US-07 y TASKS 5.10. 0015 define las ventas y sus estados; 0017 añade iconos inferiores.

### AC-01 — Tipo y estado diferenciados
Mis ventas muestra debajo del título dos opciones simultáneas: Con horario y Catálogo. Con horario identifica publicaciones LIVE aunque hayan finalizado; no indica disponibilidad actual. Se retira el botón que mostraba solo el destino contrario. La selección conserva color y borde del sistema existente.

### AC-02 — Continuidad de acciones
El selector cambia entre ambas vistas con áreas de al menos 44 px y se mantiene en los siete estados existentes de Mis ventas. Se preservan reservas, precios, controles y destinos de los diálogos; el contenido queda desplazable dentro del espacio anterior a la barra inferior.

### AC-03 — Evidencia visual
Capturas y lectura de capas acreditan selección de ambos tipos, navegación válida, texto Inter, ausencia de solapamientos y acceso a los controles. El alcance es Figma; no cambia backend ni Expo.
