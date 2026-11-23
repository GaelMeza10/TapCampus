# 0042 — Condición del artículo

Estado: Verificado (técnico y composición auxiliar) | Fecha: 2026-11-21

## Contexto y alcance
Solicitud expresa del usuario: agregar Nuevo/Usado con plan por cambio de datos, API y formulario. RF-06; US-04/US-11; TASKS 5.32. DESIGN.md/refs especifican etiqueta sobre foto de Anuncios; 0041 la omitió al faltar contrato. Sustituye esa exclusión a partir de este cambio. No incluye el arreglo de áreas seguras entre pestañas, que se implementa directamente por petición del usuario.

## Contrato
`condition: NEW | USED | null` en respuestas públicas/propias. Creación STATIC exige NEW/USED; LIVE rechaza condición. PATCH acepta NEW/USED solo para STATIC; omisión conserva valor, null/valor desconocido se rechazan. Artículos históricos conservan null sin atribuirles una condición inventada. Edición en app exige elegir condición antes de guardar; API permite PATCH ajeno a condición para históricos. Contactos, permisos, reserva y stock no cambian.

### AC-01 — Persistencia conservadora
Dado un anuncio histórico sin condición, al migrar conserva datos y condition null; nuevos anuncios guardan únicamente NEW/USED y LIVE conserva null.

### AC-02 — Validación y permisos
Dado un usuario autenticado, al crear/editar STATIC con condición válida se persiste y se devuelve; faltante al crear, null explícito, valores desconocidos o condición LIVE se rechazan. PATCH ajeno conserva condición. Solo propietario puede editar.

### AC-03 — Formulario
Al crear/editar anuncio se muestra Condición con Nuevo/Usado y selección accesible sin valor inicial inventado; es obligatoria, error por campo y foco en orden visual. Carga precarga condición y reintento conserva selección. LIVE omite campo y payload.

### AC-04 — Presentación
Feed, detalle y tarjetas de anuncios muestran Nuevo/Usado solo si viene de API, sobre foto cuando corresponde; históricos sin condición no reciben etiqueta falsa. Verificación técnica y composición auxiliar separadas de aceptación nativa.
