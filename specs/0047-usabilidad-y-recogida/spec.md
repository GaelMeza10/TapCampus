# 0047 — Usabilidad, recogida y actualización del mercado

Estado: En verificación; aceptación nativa y comprensión pendientes | Fecha: 2026-11-22

## Contexto y fuentes

Petición del usuario tras pruebas con personas: duración de oferta, stock cero, nombre Anuncios, categorías escasas, ubicación por acordar en STATIC, ubicación ausente en reservas, publicaciones nuevas sin refresco, confirmación de salida y desplazamiento repetido al cambiar tabs. Afecta a compradores que necesitan saber qué comprar y dónde recogerlo, y vendedores que necesitan publicar y entregar sin errores.

RF-02/03/04/05b/05c/06/07/08/09/10/11/12/13; RNF-01/02/03; US-02/03/04/05/05b/05c/06/07/07b/08/09/11. TASKS 5.36 y 6.5. Fuentes: docs01..10, DESIGN.md, 0001/0003/0004/0005/0037/0040/0044/0046, código actual y [investigación](research.md).

Usuario confirma: iPhone 14 Pro Max y 13 Pro Max, Expo Go, desplazamiento al cambiar de pestaña. Confirma también que la ubicación general de STATIC significa **Punto de entrega por acordar dentro del campus**. No significa presencia en todos los lugares.

## Línea base comprobada

- BD y API configurada en frontend: doce categorías, seis LIVE/seis STATIC; cinco zonas. El seed 0046 sí está aplicado. Consulta SQL de solo lectura y GET /categories en ambas rutas de API, no un fixture. [Registro](evidence/baseline.json).
- create de publicaciones no emite un evento de creación. Gateway/hook solo cubren stock, vencimiento y ganga, además de conexión/foco. Tampoco hay trabajo de inicio de visibilidad futura.
- La respuesta de reservas contiene título, imagen, precio, plazo/contacto, pero no zona. Publication.zone_id es obligatorio en Prisma; Category tiene unicidad por nombre/tipo.
- La programación de oferta usa texto numérico en Minutos antes del fin. Cuenta ejecuta logout directamente. Existe Stepper en el @expo/ui instalado y Picker compatible con Expo Go.
- Los cambios previos de insets y las capturas web no demuestran corregido el desplazamiento nativo. Se reabre ese hallazgo sin atribuir todavía una causa.

## Alcance

Incluye los nueve hallazgos y el recorrido completo publicar → descubrir → apartar/contactar → localizar → recoger/terminar, con carga, error, reconexión y accesibilidad. Mantiene colores, tipografías, cuatro tabs y glass solo en tabs según DESIGN.md.

Excluye GPS/mapas, pago, envíos, push, reputación y moderación SHOULD. Conserva códigos LIVE/STATIC, 20 minutos, precio fijado, idempotencia y permisos. No borrar/resetear datos para ampliar el seed. El alcance implementado y sus límites de aceptación se registran en verification.md.

## Comportamiento objetivo

1. Una duración se elige en horas/minutos sin teclado. Se convierte a minutos enteros para la API, sin usar fechas como duración ni limitar arbitrariamente la regla actual a 23 horas. Debe activar dentro del horario y en el futuro; Guardar confirma y cerrar descarta lo provisional.
2. Stock cero retira del feed de disponibles; no elimina filas ni termina automáticamente una venta con unidades apartadas. Una transición observada comunica Sin unidades disponibles. Mis ventas y reservas continúan; la liberación puede devolver la venta al feed si aún es válida. Sin permanencia artificial de varios minutos.
3. Nombre aprobado: **Productos** para STATIC; ayuda: Compra a otros estudiantes y acuerda la entrega. Sin apartados. Misma terminología en Explorar, Vender, filtros, creación, detalle, ventas, accesibilidad y mensajes. Investigación no equivale a validación con estudiantes.
4. Ampliación aprobada: diez categorías de productos y seis de alimentos; las diez de productos también admiten LIVE para quien vende físicamente en el campus. Resultado: 16 LIVE/10 STATIC, 26 filas tipadas. IDs existentes y datos anteriores permanecen. Selector buscable; filtros con ceros honestos.
5. LIVE requiere una zona concreta. STATIC permite zona concreta o entrega por acordar. No se añade una zona ficticia Todos ni se interpreta null como cualquiera. Ver contratos en plan.md.
6. Confirmación y Mis reservas muestran producto/unidad, precio fijado, plazo, vendedor y **Ubicación de recogida: nombre real**. No dependen de que la publicación siga siendo pública. Propuesta: guardar el punto de nuevas reservas y bloquear cambios de zona LIVE mientras existan reservas vigentes; históricos sin instantánea no se presentan como ubicación histórica acreditada.
7. Creaciones y cambios públicos invalidan la consulta por Socket.io tras confirmar SQL. Inicio futuro también actualiza el feed. Refetch con filtros/búsqueda actuales, sin navegación, vaciado, duplicados ni salto al principio. Reconexión/foco reconcilian por REST.
8. Cerrar sesión abre confirmación; cancelar conserva sesión y borrador. Doble envío bloqueado, error recuperable. Expiración/401 no espera confirmación del usuario.
9. El desplazamiento se reproduce y mide en los dos modelos indicados, en Expo Go. Se investiga insets, frames de navegación, scroll, reaparición de vistas y avisos que alteran altura. No se corrige con márgenes negativos, traslaciones ni insets congelados sin diagnóstico.

## Criterios de aceptación

### AC-01 — Estabilidad nativa al cambiar de pestaña
En iPhone 14 Pro Max y 13 Pro Max/Expo Go, con versión/SO registrados, diez ciclos de cuatro tabs sin scroll mantienen origen del viewport y logo dentro de 1 punto de tolerancia tras estabilizarse; sin acumulación de espacio ni contenido tapado. Otra secuencia con scroll deliberado conserva el estado esperado por pestaña. Hay reproducción anterior y prueba posterior del mismo recorrido, también tras teclado/formulario/modal.

### AC-02 — Saber dónde recoger una reserva
Confirmación, Mis reservas y lectura autorizada muestran el punto, producto/unidad, vendedor, precio fijado y plazo sin abrir otra pantalla. Sigue disponible con stock cero, fin de venta y reconexión. Se distingue la ubicación de referencia de históricos sin instantánea. Carrera reserva/cambio de zona respeta DEC-05 y nunca promete dos lugares distintos para una misma reserva.

### AC-03 — Entrega por acordar sin ubicación inventada
STATIC crea/edita con zona concreta o modo ARRANGED y zone_id null explícitos; LIVE rechaza ARRANGED. Datos antiguos conservan su zona. Detalle/listas explican por acordar, sin fingir presencia en una facultad. Filtro de zona concreta no incluye ubicaciones desconocidas; Todas y Por acordar tienen conteos coherentes.

### AC-04 — Publicaciones nuevas sin salir del feed
Dos cuentas/clientes reales conectados: una publicación visible nueva aparece en el comprador en hasta dos segundos en el entorno de referencia, sin cambiar pantalla ni recargar. Se respetan filtros y permisos; futura aparece al comenzar y no antes. Actualización, reconexión, eventos repetidos y fallidos no duplican tarjetas ni reinician la lectura. Se conserva SQL como autoridad.

### AC-05 — Duración de oferta comprensible
Elegir 1 h 15 min envía 75; editar 75 reconstruye los mismos valores. Cerrar no cambia lo guardado; Guardar valida. Cero, fuera del horario, tiempo ya pasado y oferta aplicada se gestionan correctamente sin pérdida de foto/borrador. No teclado para elegir la duración ni rueda gris/colapsada en los iPhone indicados.

### AC-06 — Comprender la modalidad sin confundir publicidad
Se valida el nombre candidato con cinco estudiantes usando tareas de encontrar un producto y contactar sin apartado frente a encontrar una venta para recoger ahora. Se registran interpretación, dudas y resultado por persona; los fallos reabren la decisión. El nombre adoptado y sus formas de acción/estado coinciden en todo el recorrido y guardrails. No se hereda aprobación de los tests que aceptaban Anuncios.

### AC-07 — Categorías reales y seed verificable
Catálogo aprobado de 26 categorías tipadas confirmado en código, PostgreSQL y API usada por el móvil, incluidos formulario y filtros. Seed aditivo/repetible con IDs previos intactos; nuevas muestras coherentes y fotos correspondientes, estados variados y cero datos de prueba en cuentas reales. No inventa disponibilidad ni resetea ventas/reservas/horarios modificados.

### AC-08 — Salida explícita y recuperable
Abrir confirmación no borra sesión; cancelar no cambia autenticación ni estado. Confirmar ejecuta logout una vez; error permite reintento. Avisa si se descarta edición de cuenta sin guardar. 401/expiración siguen protegiendo las rutas sin un diálogo que los bloquee.

### AC-09 — Agotamiento sin falsas promesas ni pérdida de reservas
Al llegar a cero no se permiten apartados nuevos ni se borran publicación/reservas. El comprador que observó el cambio recibe explicación; el que ya apartó conserva ubicación/contacto/precio/plazo. Cancelación/expiración reponen visibilidad solo si corresponde. Concurrencia de última pieza conserva un ganador.

### AC-10 — Convergencia del recorrido completo
Comprador y vendedor completan los recorridos de plan.md con datos normales/adversos y versiones identificadas. Se documentan evidencia nativa y auxiliar por separado, tipos/suites/build/contratos y comprobación SDD. Ningún bug del iPhone se cierra solo con mock, export o captura web. Tareas globales solo se cierran con su alcance acreditado.

## Decisiones

DEC-01/02 y DEC-07 están resueltas por la petición/confirmaciones. DEC-03/05/06 son propuestas concretas del plan que deben cerrarse antes de implementar el comportamiento afectado; ver decisions.md. DEC-04 conserva RF-04 vigente.
