# 0015 — Plan

Estado: Planificado | Especificación: spec.md

1. Reutilizar componentes/tokens locales: no existen Code Connect ni bibliotecas suscritas y la búsqueda requerida no encontró activos publicados. Mantener Inter y capas editables.
2. Corregir formularios y venta finalizada; después catálogos y tiempos; después reservas, ganga, catálogo del vendedor y estados. Conservar IDs de entrada para mantener conexiones.
3. Usar auto-layout para grupos, contenedores desplazables y botones de al menos 44 px. Añadir únicamente controles y estados necesarios.
4. Verificar estructura, destinos de navegación, fuentes, capas y capturas; corregir defectos de composición. Registrar IDs y evidencia en evidence/figma-state.json y verification.md.

No cambia datos/API/eventos/seguridad. No hay migración. Reversión: historial Figma y retiro por IDs de estados agregados; no se borran pantallas ajenas.

| Principio | Cumplimiento |
| --- | --- |
| I | Ocho AC definidos antes de editar. |
| II | RF/US → AC → T → EV. |
| III | Reservas independientes y precios/plazos preservados. |
| IV | Sin nuevos contratos; WhatsApp sujeto a reglas vigentes. |
| V | Lecturas estructurales, capturas y check-sdd. |
| VI | Solo prototipo; sin GPS, pagos ni ampliación de categorías. |

Pruebas previstas: inspección Figma por AC-01..08, capturas de composiciones afectadas y `node scripts/check-sdd.mjs`. No se atribuye evidencia UAT a una revisión visual.
