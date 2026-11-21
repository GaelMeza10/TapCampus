# 0035 — Mi cuenta con identidad y jerarquía

Estado: Verificado (técnico y composición auxiliar; aceptación física separada) | Fecha: 2026-11-10

RF-02/13; US-02/09; TASKS 5.26. Fuentes: docs04/05/07/08/09/10, constitución, PRODUCT.md, DESIGN.md y 0033. Petición explícita con Impeccable: rediseñar Mi cuenta, percibida como genérica. Hereda sistema vigente de la app; sustituye composición de esta pantalla, no identidad global ni reglas.

### AC-01 — Perfil reconocible

Nombre confirmado destacado con iniciales derivadas del nombre real, sin foto ficticia, rangos ni afirmaciones de verificación. Editar datos junto al perfil. Correo y teléfono seleccionables en filas agrupadas con iconos vectoriales; correo identificado como no editable. Cierre de sesión separado y de menor peso visual, con etiqueta y área táctil suficiente. No añadir destinos ni funciones.

### AC-02 — Editor claro y seguro

Conservar nombre/teléfono precargados, correo en texto, validación, cambios parciales, Cancelar sin guardar, bloqueo de envío duplicado/campos/cancelación/logout/navegación y borrador ante fallo. Tras éxito mostrar perfil confirmado y mensaje accesible. Mantener contrato PATCH, sesión y contactos de 0033. No tocar API.

### AC-03 — Estados y adaptación

Carga con esqueleto estático accesible sin datos inventados; error con mensaje/reintento y cierre de sesión disponible. Encabezado desplazable para liberar pantalla horizontal; teclado evitado, safe areas, texto flexible, controles de al menos 48 y separación de ocho. Heredar Inter/colores/tokens, sin movimientos decorativos ni tema oscuro nuevo.

### AC-04 — Evidencia y convergencia

Verificar regresión de edición/cierre, tipos, composición auxiliar a 320/375/430 y horizontal 844, nombres/correos largos, texto ampliado, carga/error/reintento y guardado. Exportar Android/iOS y ejecutar check-sdd; revisión independiente Impeccable y cotejo documental. Identificar aceptación física pendiente sin atribuirla a web.
