# 0025 — Plan

Estado: Planificado

1. AC-01/02: ampliar PublicationQueryDto con q validado/normalizado; PublicationsService añade OR por title/description usando Prisma contains/mode insensitive y texto escapado para LIKE. Intersectar con visibilidad y filtros existentes, sin SQL concatenado, cambios de permisos/orden o migración. Cliente listPublications añade cuarto parámetro opcional y omite q vacío.
2. AC-03/04: estado de texto y consulta aplicada en Home; debounce 300 ms cancelable, submit/limpiar inmediatos. Reutilizar CustomInput con trailingAction/iconColor opcionales para lupa/limpiar; preservar defaults. Invalidar generación al aplicar consulta y esconder filas antiguas mientras texto difiere. Mantener consulta al cambiar tipo/zonas, reloj/eventos y listas virtualizadas.
3. AC-01..05: pruebas DTO/consulta y cliente/UI para combinación, case-insensitive, comodines literales, limpiar, sin resultados, respuestas fuera de orden y reintento. Fixture con filtros de texto reales; capturar búsqueda/empty y 320/390/430. Comandos, reinicio de API compilada y smoke GET sin mutaciones.
4. AC-05: docs02/03/04/05, 0005, índice, trazabilidad y TASKS. Guardar evidencia y distinguir revisión auxiliar de teclado/lector físicos.

UX: búsqueda siempre visible, sin desplegable ni nuevo módulo; texto/filtros independientes. ui-ux-pro-max consulta ux «search feedback empty» → Empty States (All); stack «search input keyboard» → teclado/visibilidad, contrastado con SDK58 instalado. Impeccable Operate: precisión y recuperación, conserva identidad. Sin autocompletado, historial, búsqueda difusa o nuevas funciones.

Constitución I/II: fuentes/expediente/AC/T/EV previos. III: reservas, stock, precios/plazos intactos. IV: contrato q acordado, parámetros Prisma y proyección pública actual. V: evidencia reproducible y límites nativos. VI: ampliación expresa de RF-05c. Riesgo: respuestas fuera de orden y coincidencias amplias; generación/pruebas y literales. Reversión por diff de esta feature, sin datos que revertir.
