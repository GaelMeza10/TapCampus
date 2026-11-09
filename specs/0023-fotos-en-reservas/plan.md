# 0023 — Plan

Estado: Planificado

1. AC-01: añadir image_url al select de publicación en ReservationsService y devolver publicationImageUrl nullable en el serializador central. No cambiar consultas de permisos, transacciones, esquema o rutas. Campo aditivo documentado en docs03/0001.
2. AC-02/03: ampliar Reservation opcionalmente y extraer normalización de imagen compartida con publicaciones; aplicarla en create/listados/acciones de reserva, sin consultas por fila.
3. AC-02: en ReservationCard para comprador, cabecera foto 80×80 y columna flexible con título/unidad/precio; estado/plazo/acciones conservados. PublicaciónPhoto compartido resuelve fallos. Mis reservas y tarjetas de comprador en detalle coherentes; rama de vendedor compacta intacta.
4. AC-01..03: probar proyección y permisos en backend, resolución de URL y tarjeta/lista en frontend; fixture real con imagen y 38+ capturas. Build/tsc/suites/lint aplicable, reiniciar solo API compilada para exponer campo a iPhone, verificar HTTP sin modificar inventario ni repetir seed. Actualizar AC→T→EV y check-sdd.

Skill: consulta ux «image alternative text» → Alt Text (All); stack react-native «image loading list» → expo-image. Se conserva implementación Expo Image existente y se contrasta con tipos instalados SDK 58; la referencia stack fue escrita para RN0.86 y no sustituye RN0.88 local. Primera búsqueda genérica de reconocimiento devolvió rendimiento; solo se aplica guía de accesibilidad e imágenes que encaja en este cambio.

Constitución I/II: expediente y trazabilidad previos. III: precio, stock, plazos e idempotencia intactos. IV: campo aditivo, permisos existentes. V: evidencia reproducible y límites físicos separados. VI: mejora acotada. Sin migraciones/dependencias. Reversión por diff de esta feature; cliente admite campo ausente. Riesgo: foto editada posteriormente cambia la miniatura, se documenta como foto actual.
