# 0026 — Plan

Estado: Planificado

Revisión 2026-11-09 previa al código: sustituir fondo sólido por token rgba(23,97,59,0.12) solo de fondo (sin reducir opacidad del texto), color primary para etiqueta/icono. Cuenta usa Ionicons person-outline ya empaquetado. Mi cuenta presenta error controlado, sin interpolar mensajes remotos. Interceptor trata /auth/me como recurso privado. Reiniciar servicios locales actuales, comprobar 401 anónimo/200 autenticado por LAN y conservar datos. Esta revisión sustituye las menciones de sólido/blanco del plan inicial siguiente.

1. AC-01: ampliar MarketTab/BottomNavigation con Cuenta e icono SVG local del mismo estilo. Fondo activo sólido, etiqueta/icono blancos, tipografía activa y selected; cuatro destinos con espacio/tamaño flexible y safe area. PageHeader vuelve a título/acción explícita; eliminar AccountMenu y su hoja sustituida.
2. AC-02: UsuariosService.perfil con select explícito, AuthService.miCuenta y GET /auth/me con JwtAuthGuard/CurrentUser. Respuesta exacta id/name/email/phone; 401 ante usuario ausente. Cliente myProfile en auth.service sin cambiar sesión ni persistir más datos.
3. AC-03: ruta account protegida con MarketplaceShell active account, datos reales de lectura y carga/error/reintento; reutilizar Card/AppText/PrimaryButton. Conservar lógica de logout/candado/anuncios de estados; bloquear navegación solo durante logout. No añadir avatar/foto, edición o entradas de contraseña.
4. AC-01..04: sustituir pruebas de hoja antigua por perfil y navegación; cubrir selección de cuatro destinos, ausencia de duplicación, carga/error/valores y logout fallido/pendiente. Backend proyección, guardas y servicio; fixture con datos de muestra explícitos, estados y títulos largos. Tipos/suites/build/lint/exports/HTTP/capturas/docs.

Impeccable: extensión precisa del mundo establecido, usuario confirma contenido y propósito, sin torneo visual o nuevas fuentes. ui-ux-pro-max «selected state color alone» → Color Only/Contrast (All): selección por contenedor sólido, peso/etiqueta y semántica, no un tinte sutil. Contraste blanco/primary se calcula y revisa. Sin imágenes generadas para UI nativa.

Constitución I/II: intención y AC/T/EV previos. III: reservas/stock/precios intactos. IV: contrato privado mínimo y usuario derivado del JWT. V: evidencia antes de cerrar, límites nativos separados. VI: ampliación elegida por el usuario; no edición de perfil. Sin paquetes/migraciones. Riesgos: datos ajenos o sensibles, tab comprimido, errores de logout; mitigados por select/guardas, pruebas y layout flexible. Reversión por diff de 0026, sin datos a revertir.
