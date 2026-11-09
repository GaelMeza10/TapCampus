# 0025 — Barra de búsqueda de publicaciones

Estado: Verificado (técnico y visual auxiliar; aceptación física separada) | Fecha: 2026-11-06

El usuario detecta ausencia crucial de búsqueda y autoriza incorporarla. RF-05c ampliado; RNF-03; US-05c; TASKS 5.2/5.18. Fuentes: docs02/03/04/05/07/08/09/10, constitución y 0005. Implementación directa en código; identidad, Cuenta y funciones actuales conservadas. La auditoría previa describía ausencia de búsqueda como ampliación: esta petición la incorpora al alcance aprobado.

### AC-01 — Búsqueda real combinada

`GET /publications` añade q opcional: frase de hasta 100 caracteres, espacios extremos eliminados y consecutivos normalizados; coincidencia parcial en título O descripción, sin distinguir mayúsculas, combinada con tipo/zona/categoría por AND. Buscar en toda la consulta de publicaciones visibles del servidor; no filtrar solo filas ya descargadas. Conservar orden de ganga/fecha y proyección sin contactos. No se promete equivalencia de acentos, búsqueda difusa o por palabras separadas.

### AC-02 — Validación y compatibilidad

q ausente/vacío/solo espacios equivale a no buscar. q repetido/no string o mayor de 100 tras normalizar devuelve 400. %, _ y barra inversa son texto literal, no comodines. Mantener validación de catálogos y queries desconocidas. Sin migración, nuevas rutas o paquetes; clientes anteriores siguen válidos.

### AC-03 — Barra visible y recuperación

En Explorar, debajo de TapCampus/Cuenta y antes del tipo/filtros, campo Buscar productos con lupa, teclado de búsqueda y botón accesible de limpiar. Usar los componentes/tokens actuales y objetivo táctil apropiado. Conservar texto al cambiar tipo/aplicar filtros; limpiar solo búsqueda. Actualizar tras 300 ms de pausa y al enviar desde teclado inmediatamente; limpiar aplica inmediatamente. Máximo 100 caracteres.

### AC-04 — Estados y respuestas antiguas

Mostrar carga al cambiar consulta; no atribuir resultados antiguos al texto nuevo. Descartar respuestas de consultas anteriores, también con eventos/refrescos. Error conserva texto/filtros y ofrece reintento. Sin coincidencias explica cómo cambiar texto/filtros y permite limpiar. Conservar FlatList, navegación, disponibilidad y eventos actuales.

### AC-05 — Evidencia y entrega

Verificar servidor/DTO/cliente/UI con pruebas, consulta GET real sin mutaciones, capturas a tres anchos y tipos/build/exports. Actualizar API activa para iPhone sin tocar datos. Documentar límites: navegador no acredita teclado/VoiceOver nativos. AC→T→EV y check-sdd antes de cierre.
