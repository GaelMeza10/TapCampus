# 0046 — Seed de entrega y limpieza

Estado: Verificado (técnico y carga local) | Fecha: 2026-11-22

## Contexto y fuentes

Usuario solicita seed más completo, categorías y datos verosímiles para entregar, y eliminar archivos basura. RF-01/02/03/05c/06/07/08/09/11/12/13; US-01/03/04/05/05c/06/07/09/11; TASKS 1.7. docs02/03/06/07/08/09/10, 0005/0010/0012/0027 y constitución. Dataset de demostración, no ventas/contactos reales.

## Decisiones y alcance

Catálogos ampliados de 8 a 12 categorías conservando nombres/IDs existentes: LIVE añade Desayunos y Panadería; STATIC añade Arte y Dibujo y Audio y Accesorios. Se conservan las cinco zonas ya aprobadas; no se inventan edificios ni se declara que sean un directorio oficial. Fotografías ilustrativas existentes se reutilizan según producto, sin descargar assets ni sustituir fotos del usuario.

Seed de entrega explícito: seis cuentas ficticias, 48 publicaciones (24 por tipo, cuatro por categoría), condición NEW/USED en STATIC, precios MXN ilustrativos, stock/horarios relativos coherentes y ofertas activa/manual/programada. Doce reservas distribuidas ACTIVE/COMPLETED/CANCELLED/EXPIRED; precio fijado, tiempos e inventario compatibles con cada estado. Cuentas pueden comprar y vender; no se inventa un rol persistido. Sin moderación, nuevos endpoints o migraciones.

## Criterios de aceptación

### AC-01 — Catálogos y datos
Base sembrada tiene las cinco zonas y doce categorías tipadas. El perfil de entrega crea seis cuentas, 48 publicaciones y doce reservas coherentes con RF vigentes; todas las categorías/zona tienen ejemplos, cada STATIC tiene condición y ninguna tiene campos LIVE. Fotos locales existentes, títulos/descripciones plausibles y datos ficticios explícitos.

### AC-02 — Repetición y preservación
Segunda ejecución no duplica ni restablece contraseñas, fechas, precios, stock o estados. Inserciones atómicas, IDs deterministas de namespace propio; conflicto con cuenta/ID ajenos aborta. Datos originales conservan filas/hashes, salvo inserción de categorías nuevas. No se actualizan ni borran publicaciones/reservas reales. Claves de acceso demo guardadas localmente en ruta ignorada, sin imprimirlas en logs.

### AC-03 — Carga y verificación
Ensayo en PostgreSQL aislado, dos ejecuciones y comprobación de integridad, login/feeds/catálogos/imagen/reservas mediante API. Después cargar el perfil en la base local configurada, con inventario antes/después que demuestre preservación. No resetear esquema ni volúmenes.

### AC-04 — Limpieza segura
Retirar únicamente exports/cache/logs temporales reproducibles y assets/scaffold de Expo sin referencias. Verificar rutas absolutas dentro del workspace antes de cualquier borrado recursivo y no seguir enlaces. Conservar node_modules, .env, backups, uploads, código, skills, migraciones y evidencia de specs. Manifestar cantidades/bytes y archivos retirados. README y scripts de operación reflejan la entrega actual.

### AC-05 — Calidad y trazabilidad
Tipos, pruebas relevantes, build/lint backend y check-sdd aprobados. Catálogos/verificadores/documentos actualizados a doce categorías. Evidencia AC→T→EV y guía de acceso/arranque. No declarar aceptación física ni entrega instalada por sembrar datos.

## Decisiones abiertas

Ninguna. Ver decisions.md.
