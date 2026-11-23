Confirmación posterior del usuario (2026-11-22): «ya esta solucionado». Se conserva este procedimiento como comprobación formal no ejecutada; no se exige otra prueba para continuar el trabajo actual.

# Comprobación nativa pendiente

Reporte del usuario: iPhone 14 Pro Max y 13 Pro Max, iOS 27.2.1 y Expo SDK 58, en Expo Go. La versión exacta de la aplicación Expo Go se obtiene de la traza de runtime; SDK no equivale a versión de Expo Go. No hay todavía una captura nativa que permita atribuir o cerrar el desplazamiento.

El usuario arranca manualmente `npm run start:dev` en Backend y `npx expo start` en Frontend. El agente no los inicia ni reemplaza. Las trazas están activas solo en desarrollo nativo; no envían datos a un servicio externo ni incluyen perfil, teléfono o tokens. El búfer conserva como máximo 400 entradas. Se puede desactivar con EXPO_PUBLIC_LAYOUT_DIAGNOSTICS=0 al arrancar Expo manualmente; en producción se desactiva automáticamente y no añade refs/vistas de medición.

1. En cada iPhone, recargar el bundle actual de TapCampus. Sin scroll, hacer diez ciclos Explorar → Reservas → Mis ventas → Cuenta → Explorar.
2. Repetir conservando un desplazamiento intencional en cada lista. Abrir/cerrar teclado en Cuenta y formulario; abrir/cerrar modal y volver a tabs. Distinguir retención del scroll de un cambio del origen de la pantalla.
3. Desde Frontend, con el teléfono conectado a ese Metro, ejecutar `node scripts/collect-layout-diagnostics.cjs 8081`. Es una lectura del runtime Hermes ya abierto; no arranca la app ni los servidores. Guarda JSON bajo evidence/native y no recoge otros logs.
4. Comparar por tab las muestras focus-settled: ventana/fontScale, safe-area de viewport/escena, frames de viewport/escena/header/nav, offsets e insets del scroll y altura de avisos. Sin scroll ni cambio de contenido, el origen estable debe variar como máximo un punto nativo. Registrar también el cambio visible y la versión exacta de Expo Go.

La instrumentación puede cambiar la retención de vistas nativas en desarrollo al medirlas. Si el problema desaparece al instrumentar, comparar también con la instrumentación desactivada antes de atribuir una causa. No aplicar márgenes negativos, fijar insets antiguos ni borrar offsets para simular estabilidad. Capturas web, Jest y exports no sustituyen esta aceptación.

Pendiente además: recorrido publicar/descubrir con dos sesiones móviles reales, picker nativo de duración, VoiceOver/teclado/glass y comprensión de Productos con cinco estudiantes. Son gates distintos de los contratos HTTP/Socket.io ya comprobados.
