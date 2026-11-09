# 0020 — Plan

Estado: Ejecutado | Especificación: spec.md

1. Comparar Figma de alta fidelidad con componentes, pantallas, pruebas y fixture existentes (AC-01..04).
2. Actualizar primero shell/selector/tarjeta/campos/confirmación y activos locales; aplicar encabezados compactos en pantallas (AC-01/02).
3. Corregir atribución de errores y bloqueo durante envío reutilizando validaciones actuales. Sin modificar rutas/cuerpos API ni reglas de reserva (AC-03).
4. Ejecutar tsc/Jest; capturar pantallas reales con datos aislados, comprobar anchos pequeños/grandes, corregir defectos; exportar plataformas nativas (AC-04).
5. Converger documentación e índice/TASKS y check-sdd. Reversión: diff acotado de Frontend y activos nuevos; mantener originales Figma.

Constitución I: especificación previa. II: AC→T→EV. III: sin cambios de inventario/idempotencia/plazos. IV: contratos y privacidad conservados, cero migraciones. V: pruebas y evidencia antes del cierre. VI: delta visual autorizado, sin búsqueda textual ni funcionalidades extra.

Riesgos: SVG locales deben empaquetarse; comprobar en exportación. Usar flex/minHeight y texto escalable en lugar de coordenadas del prototipo. Validación visual mediante fixture no modifica API/BD del usuario. La prueba física requiere dispositivo y no se declara aprobada sin evidencia.
