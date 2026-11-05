# 0015 — Verificación

Estado: Verificado | Fecha: 2026-11-04 | Entorno: Figma MCP / Design

| Criterio | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-09 | EV-01, EV-09 | PASS |
| AC-02 | T-02, T-09 | EV-02, EV-09 | PASS |
| AC-03 | T-03, T-09 | EV-03, EV-09 | PASS |
| AC-04 | T-04, T-09 | EV-04, EV-09 | PASS |
| AC-05 | T-05, T-09 | EV-05, EV-09 | PASS |
| AC-06 | T-06, T-09 | EV-06, EV-09 | PASS |
| AC-07 | T-07, T-09 | EV-07, EV-09 | PASS |
| AC-08 | T-08, T-09 | EV-08, EV-09 | PASS |

## Evidencia reproducible

[Archivo Figma](https://www.figma.com/design/XvTMHHlXw8yfnd6x0v7Ulh?node-id=3-2). IDs y lecturas: [evidence/figma-state.json](evidence/figma-state.json). Reproducir con get_screenshot/use_figma sobre estos IDs.

- **EV-01:** 5:32/5:98 contienen descripción (instancias de 47:16). Viewports 48:46/48:59: overflow VERTICAL, altura 568; contenido 781/720 con todos los campos. Capturas de ambos formularios revisadas; botón de publicación fuera del área desplazable.
- **EV-02:** 6:116 no muestra venta física/edición/ganga. Dos reservas conservan confirmaciones individuales que regresan al estado finalizado. Captura revisada.
- **EV-03:** 5:2/11:40 incluyen cinco zonas y cuatro categorías por tipo, cotejadas con Backend/prisma/catalogs.ts. Chips con SET_VARIABLE exclusivo por grupo; texto de resumen enlazado y restablecimiento explícito. Capturas revisadas.
- **EV-04:** Venta termina en y Apartado vence en distinguen relojes. 6:86 muestra $85 tachado y precio vigente $65; ambas reservas previas y sus confirmaciones mantienen $85. La confirmación de una nueva reserva con ganga mantiene $65. Captura final revisada tras corregir el precio histórico.
- **EV-05:** 5:68 muestra unidades 1/2 ordenadas por vencimiento 08:32/16:08 y botones por unidad. Confirmar modifica la visibilidad de una unidad; condiciones actualizan contador y aviso sin entregas. Estado compartido entre venta activa, stock actualizado, ganga y cierre; cada diálogo retorna al contexto de origen. Capturas de lista/cierre y acciones inspeccionadas.
- **EV-06:** 5:63 abre 56:122; Sin ganga/Manual/Programada conectan 56:122/56:189/56:261. Precio mínimo $65; 10 minutos antes de 13:30 → 13:20. Guardar actualiza el resumen del formulario. Captura programada revisada: contenido 440 px sin recortes.
- **EV-07:** Mis ventas → 57:132; Editar → 5:98; Marcar vendido → 6:47 → 57:200; Volver → 57:132. El vendido retira acciones de edición/venta. Capturas de ambos estados revisadas.
- **EV-08:** 5:129/140/152 y 59:257/299/348 mantienen selector, filtros, FAB y navegación; vacío permite filtros/cambio de tipo y error permite reintentar. Lupa y reloj sustituyen símbolos de éxito. Seis estados originales trasladados a 3:2 porque NAVIGATE requiere la misma página. Capturas revisadas.
- **EV-09:** Auditoría final de 3:2: 1,226 nodos (728 TEXT, 372 FRAME, 89 INSTANCE, 22 RECTANGLE, 9 ELLIPSE, 6 VECTOR), única familia Inter, cero imágenes de pantallas aplanadas y cero destinos ausentes o fuera de página. Variables sustituidas retiradas por sus IDs. Comandos: `node scripts/check-sdd.mjs` y `git diff --check`.

## Alcance de la evidencia

Revisión estructural y visual con valores de demostración y acciones Figma inspeccionadas. No representa ejecución Expo/API ni simulación completa de búsqueda, inventario, reloj o edición. Usabilidad con cinco estudiantes y aceptación de la app corresponden a fases 5/6; no se cierran aquí.
