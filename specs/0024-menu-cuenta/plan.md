# 0024 — Plan

Estado: Planificado

Refinamiento posterior solicitado: Impeccable polish sobre el mundo existente, sin rerun de context ya cargado en esta sesión. Inspección independiente sin snapshot de crítica aplicable a account-menu. ui-ux-pro-max: consulta ux «modal focus management» → Focus States (All); stack «touch target accessibility» → Pressable/hit targets; pro-rules confirma 44 pt iOS/48 dp Android y accesibilidad modal. Mantener Inter/paleta sobre recomendaciones genéricas de plataforma. Añadir foco/retorno opcional y movimiento reducido en Sheet compartido; AccountMenu anuncia estados y usa activador tipado. Sin cambios a auth/backend. Verificar mediante pruebas y navegador, sin acreditar hardware.

1. AC-01: AccountMenu compartido como acción por defecto de PageHeader; acceso Cuenta con icono persona y etiqueta. Conservar action personalizado si existiera. No crear pestaña/perfil nuevo para mover una acción existente.
2. AC-02/03: hoja Sheet con logout existente, estado busy y candado síncrono, error local recuperable. Extender Sheet con dismissDisabled opcional (default false) para bloqueo coherente de fondo, botón y regreso del sistema durante logout. AuthContext y guardas no cambian.
3. AC-01: retirar useAuth/logout y botón del footer de ventas. Conservar publicar y demás funciones.
4. AC-01..03: pruebas del menú en tres encabezados, apertura sin logout, cierre, fallo/reintento y solicitud pendiente. Mantener navegación real AuthProvider/login testada; ajustar mocks aislados. Capturas de cuenta/estado y tres tamaños, tipos/suite/exports, documentos y check-sdd.

Impeccable: refinamiento de organización y contexto de acción, conserva identidad. Las búsquedas locales ui-ux-pro-max de account menu y consistent navigation no dieron una guía específica aplicable a este menú nativo; no se presentan como validación del patrón. Se aplica juicio de arquitectura de información y patrones Sheet existentes.

Constitución I/II: expediente y AC/T/EV previos. III: stock/reservas intactos. IV: sin contratos nuevos y AuthContext conservado. V: verificar sin cerrar sesión real del usuario desde herramientas. VI: solo reubicar sesión. Sin paquetes ni migraciones. Riesgo: error de SecureStore o doble envío; recuperación y pruebas. Reversión por diff de esta feature sin tocar datos.
