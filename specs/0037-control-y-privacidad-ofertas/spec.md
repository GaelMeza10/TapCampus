# 0037 — Control y privacidad de ofertas

Estado: En verificación; implementación técnica aprobada, aceptación nativa pendiente | Fecha: 2026-11-21

## Contexto y fuentes

RF-02, RF-07, RF-11, RF-12, RNF-01, RNF-02; US-02, US-05, US-06; TASKS 5.28. Fuentes: plan integral proporcionado por el usuario, auditoría 2026-11-16, docs02/03/04/05/07/08 y constitución. Amplía 0006 sin reescribir su evidencia histórica.

Línea base antes del cambio: list/detail/mine compartían proyección con configuración futura, se aceptaba igualdad, el formulario bloqueaba retirada/cambio a manual y el tipado completo fallaba en update-profile.spec.ts:62. Implementación y pruebas técnicas de esta revisión resuelven esos puntos; aceptación física separada en verification.md.

## Alcance

Incluye corregir primero el error de tipos de esa prueba, separar datos públicos/de propietario, mínimo estricto, cambio de modo y retirada antes de activación, trabajos obsoletos, compatibilidad con ofertas existentes y regresión de reservas. Excluye desactivar una oferta ya aplicada, descuentos graduales, rediseño, migraciones destructivas y actualización masiva de precios históricos. Depende de 0001/0003/0006/0007 y de PostgreSQL/Redis para demostrar carreras; no depende de moderación.

## Reglas y contratos observables

- GET /publications y GET /publications/:id omiten por completo ganga_min_price, ganga_activation_mode y ganga_minutes_before, incluso para una oferta activa. Mantienen price, price_before_ganga e is_ganga_active; nunca sustituyen los tres campos privados por null, pues eso también comunica configuración.
- GET /publications/mine y respuestas de mutaciones autenticadas del propietario conservan esos tres campos. Ninguna ruta pública, evento o respuesta de reserva revela programación futura.
- En creación/configuración nueva: 0 < ganga_min_price < price, dinero decimal de hasta dos posiciones. Igualdad, precio no positivo o configuración incompleta producen 400 sin escritura ni job. STATIC no admite configuración.
- Antes de activarse, propietario de LIVE ACTIVE antes del fin puede cambiar MANUAL ↔ SCHEDULED. MANUAL exige ganga_minutes_before:null al abandonar SCHEDULED. SCHEDULED exige minutos enteros positivos y disparo futuro dentro de la ventana.
- Retirada explícita por PATCH /publications/:id con los tres campos ganga_* de configuración en null; borra los tres atómicamente sin cambiar price, precio previo, stock ni reservas. Omisión significa conservar; null parcial/incoherente produce 400. Creación rechaza null explícito en campos de configuración.
- Tras activación, precio/configuración permanecen inmutables (409); editar título/stock sigue permitido. El precio de una reserva ya creada nunca cambia.
- Worker/conciliación releen bajo el mismo bloqueo de publicación que edición y reserva: tipo, estado, configuración, fecha esperada, horario y mínimo válido. Job de una configuración retirada o de otro modo/fecha no activa ni emite evento.
- Si edición y activación compiten, decide el primer commit válido: si retirar/reprogramar gana, el job anterior no actúa; si activar gana, la reconfiguración responde 409. Un único cambio/evento tras commit.
- Compatibilidad: no reinterpretar price actual de una ganga activa como precio normal para exigir mínimo estricto al editar título/stock. No inventar price_before_ganga si falta. Configuraciones antiguas con mínimo igual no se activan como oferta y requieren corrección del vendedor; no modificar filas en lote ni impedir una edición ajena a precio/configuración por esa igualdad histórica.

## Criterios de aceptación

### AC-01 — Base técnica verificable
**Dado** el test de perfil con unión comprador/vendedor, **cuando** se corrige mediante estrechamiento de tipos y se ejecutan tipos y pruebas, **entonces** pasa el chequeo completo sin any, casts que oculten el problema, exclusión del test ni pérdida de su aserción de contacto.

### AC-02 — Configuración privada
**Dado** ofertas sin configurar, manuales, programadas y activadas, **cuando** se consultan feed/detalle y mine desde identidades distintas, **entonces** solo el propietario en rutas autorizadas obtiene los tres campos privados; eventos y reservas no los exponen.

### AC-03 — Mínimo estrictamente menor
**Dado** creación o edición de precio/configuración no activada, **cuando** se envían mínimos menores, iguales o mayores, **entonces** solo el menor positivo es válido en servidor y formulario; rechazo no crea publicación ni trabajo.

### AC-04 — Cambio y retirada
**Dado** oferta aún no activada, **cuando** el propietario cambia entre modos o retira los tres campos, **entonces** se guarda exactamente la configuración elegida; omisión conserva, null incoherente se rechaza y otra cuenta no modifica la fila.

### AC-05 — Jobs y carreras
**Dado** programación reemplazada/retirada y un job antiguo, **cuando** se ejecuta, se reinicia el worker o compite con la edición, **entonces** solo la configuración vigente puede activarse una vez; se respeta el resultado del bloqueo y no hay eventos de activaciones rechazadas.

### AC-06 — Precio de reservas y ofertas activas
**Dado** reserva previa y oferta activa, incluso legado sin precio previo, **cuando** se edita título/stock o se intenta reconfigurar, **entonces** los campos ajenos se editan, precio/configuración activa se rechazan con 409 y unitPrice previo permanece intacto.

### AC-07 — Integración y compatibilidad móvil
**Dado** comprador/vendedor con los nuevos contratos, **cuando** publican, cambian programación, activan y reservan, **entonces** feed/detalle funcionan sin campos privados, Mis ventas permite gestionar la configuración y evidencia móvil/HTTP/SQL prueba precio, prioridad y evento.

## Decisiones

DEC-01..03 resueltas en decisions.md. Sin decisión de producto abierta; ejecución y evidencia pendientes.
