# Plan

AC-01/02: UpdateProfileDto con transformación de espacios y validación estricta, PATCH en AuthController protegido por JwtAuthGuard, AuthService delega a UsuariosService; Prisma update con select seguro y manejo P2025. Nombre/teléfono son opcionales individualmente, pero cuerpo vacío rechazado. No copiar propiedades arbitrarias del cuerpo. Mantener esquema y JWT.

AC-03: servicio updateProfile con cliente Axios vigente (interceptor/timeout existentes), formulario local en account.tsx. Normalización compartida de teléfono ya disponible; errores de campo al editar, borrador separado de perfil confirmado, bloqueo síncrono con ref. Contenedores existentes y KeyboardAvoidingView. Las lecturas de reservas/ventas/detalle ya recuperan al reenfocar con useMarketplaceSync; comprobar su contrato y no añadir eventos públicos de perfil.

AC-04: pruebas HTTP con Nest/guard/servicios reales y repositorio aislado; tests UI de guardado/cancelación/reintento/no duplicación. Fixture visual aislado con PATCH persistido en memoria. Exports Android/iOS y convergencia. Reversión: retirar PATCH y editor; sin datos que migrar.

Constitución: I spec previa; II RF→US→AC→T→EV; III inventario/reservas sin cambios; IV contrato y permisos acordados, select sin secretos; V evidencia reproducible antes de cerrar; VI ampliación explícitamente aprobada del perfil en lectura.
