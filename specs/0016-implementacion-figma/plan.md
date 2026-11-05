# 0016 — Plan de implementación

Estado: Implementado y comprobado técnicamente | Fuente: spec.md

## Orden

1. Extraer contextos de alta fidelidad y capturas de las familias de pantallas; inventariar componentes/dependencias/rutas. Preservar trabajo documental 0015 sin commits implícitos.
2. Alinear docs04; evolucionar theme.js y componentes existentes (texto, botones, campos, tarjetas), añadir selector, barra inferior, estados, confirmación y reloj reutilizables. Cargar Inter empaquetado con expo-font, sin llamadas remotas al arrancar.
3. Migrar acceso y feed: layout horizontal de tarjetas, filtros de borrador/aplicados, control de peticiones antiguas y recuperación. Mantener FlatList virtualizada y listener Socket.io con limpieza.
4. Adaptar detalle/reserva y Mis reservas preservando idempotencia y permisos de contacto; tarjeta de éxito con precio/plazo propio y acciones por unidad.
5. Adaptar formulario/edición: campos rotulados, descripción multilinea, pickers de catálogo/horario, configuración de ganga, acción accesible con teclado. Conservar validaciones/API y borrador.
6. Adaptar Mis ventas: selector de tipo, tarjetas por estado, reservas activas primero ordenadas por vencimiento, historial y confirmaciones contextuales; eventos/refoco.
7. price_before_ganga: añadir columna Decimal(10,2) opcional y proyección; capturar p.price al activar en transacción existente. Inventario/respaldo, Prisma generate/migrate deploy; probar precio previo y precio reservado en base real.
8. Ejecutar tsc, Jest, build/backend y bundles iOS/Android; revisar composición renderizada con fixtures aislados, sin alterar datos del usuario para capturas. Convergencia AC→T→EV, check-sdd y diff limpio de whitespace.

## Contratos y recuperación

Se conservan rutas, payloads, eventos y propiedad. Única ampliación aditiva: price_before_ganga: string|null en publicaciones; no se acepta en DTO de entrada. No hay backfill. Volver a código anterior tolera la columna adicional; no borrar históricos para revertir. El backend es autoridad de stock/precios/plazos; UI refresca después de mutaciones y eventos.

Riesgos: fuentes nativas/teclado no se comprueban completamente en Windows; registrar límite de evidencia. Preservar filtros al cerrar hoja, solicitudes fuera de orden y claves de reserva ante respuesta perdida. Acciones deshabilitadas al vencer no sustituyen validación del servidor.

## Referencias de implementación

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [expo-font](https://docs.expo.dev/versions/v58.0.0/sdk/font/) y [Expo UI](https://docs.expo.dev/versions/v58.0.0/sdk/ui/), contrastados con los tipos instalados.
- Figma: acceso 3:3/3:20; feed 3:42/3:87; filtros 5:2/11:40; detalle 4:2/4:23; éxito 4:42; reservas 4:62; formularios 5:32/5:98; ganga 56:261; ventas 5:68/6:86/6:116/57:132/57:200. Contextos get_design_context y capturas de la sesión 3568f3d7-79c7-48aa-8160-4102d96c8823.
- Revisión local: `node scripts/verify-redesign-ui.cjs` desde Frontend genera capturas de componentes reales con fixtures en una entrada separada de `src/app`. Chrome sin ventana, sin modificar la API ni los datos de usuario. El navegador sirve como comprobación visual a tamaño móvil; no acredita interacción nativa física.
- Los cuatro SVG originales viven en Frontend/assets/icons; geometría 58×58 de éxito, 72×72 de fondo vencido y 28×28 de reloj/lupa. Fotografías de productos dinámicas desde API. La tipografía carga solo cuatro pesos locales de Inter.

| Principio | Aplicación |
| --- | --- |
| I | Spec y decisiones antes de editar código. |
| II | AC-01..10 enlazados a tareas/evidencia. |
| III | Ningún cambio a transacciones/20 min/idempotencia; columna histórica capturada bajo el mismo bloqueo. |
| IV | Contrato de campo nullable documentado; privacidad/JWT conservados. |
| V | Pruebas, bundles y revisión visual con límites explícitos. |
| VI | Rediseño aprobado, sin incorporar funciones fuera del MVP. |
