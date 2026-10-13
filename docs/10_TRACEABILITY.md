# Matriz de trazabilidad de TapCampus

Fecha: 2026-10-13. Esta matriz cubre **todos los requisitos identificados** en `02_REQUIREMENTS.md`. `TASKS.md` aporta tareas globales; solo `specs/` aporta `AC → T → EV`. Fases 1/2/3 backend y fase 4 arquitectura verificadas; pantallas completas/listeners móviles/Linking pendientes.

| Requisito | Historia | Tarea global | Feature / criterio | Evidencia y estado |
| --- | --- | --- | --- | --- |
| RF-01 Registro UABC | US-01 | 1.1–1.3, 2.1, 4.1–4.3, 5.1 | [0002](../specs/0002-autenticacion/spec.md) AC-01/02/03/05/06; [0010](../specs/0010-infraestructura-y-base-de-datos/spec.md) AC-01/02/04; [0011](../specs/0011-arquitectura-visual-movil/spec.md) AC-01/02/03 | 0010 EV-01/02/04 y 0002 EV-08 backend; 0002 EV-09 interceptor/JWT/401 y 0011 EV-01..04 arquitectura móvil aprobados. Formularios completos con backend/BD de 5.1 pendientes. |
| RF-02 Perfil obligatorio | US-01 | 1.3, 2.1, 4.2, 5.1 | 0002 AC-02/03, [0011](../specs/0011-arquitectura-visual-movil/spec.md) AC-02/03, [0008](../specs/0008-contacto-whatsapp/spec.md) AC-05 y 0010 AC-04; teléfono mexicano con o sin +52 | 0010 EV-04 y 0002 EV-08 backend; 0011 EV-02/03 componentes/formulario base aprobados. Registro completo de 5.1 y 0008 Linking pendientes. |
| RF-03 Publicación en vivo | US-03 | 1.3, 2.3, 2.4, 5.4 | [0003](../specs/0003-publicaciones-en-vivo/spec.md) AC-01/02/03/06; 0010 AC-03/04 | 0010 EV-03/04 y 0003 EV-08/09/10 backend aprobadas, T-02/T-03/T-08 completas; UI/temporizador pendientes. |
| RF-04 Expirar por tiempo/stock | US-03, US-08 | 2.4, 3.5, 5.2 | 0003 AC-03/04; [0001](../specs/0001-reservas/spec.md) AC-08 | 0003 T-04/T-09 → EV-04 y 0001 T-05/T-08 → EV-08 aprobadas: fin persistente/evento/reposición vigente; móvil pendiente. |
| RF-05 Cierre anticipado [SHOULD] | US-05d | 5.5 | 0003 AC-07; 0001 AC-07 | 0003 T-09 → EV-07 y 0001 T-04/T-08 → EV-07 aprobadas: cierre conserva reservas; UI pendiente. |
| RF-05b Venta física | US-05b | 2.6, 5.5 | 0003 AC-05/06 | 0003 T-05/T-09 → EV-05/10 aprobadas: carrera HTTP reserva/venta y eventos; UI pendiente. |
| RF-05c Filtros | US-05c | 1.4, 2.5, 2.7, 5.2 | [0005](../specs/0005-catalogos-y-filtros/spec.md) AC-01/02/03/04; 0010 AC-05 | 0005 T-02/T-03/T-06 → EV-06 aprobada HTTP catálogos exactos/filtros AND/errores. 0010 EV-05 seed aprobado; UI AC-04 pendiente. |
| RF-06 Catálogo estático | US-04, US-11 | 2.4, 2.6, 5.2, 5.4, 5.6 | [0004](../specs/0004-catalogo-estatico/spec.md) AC-01/02/03/04/05 | 0004 T-01/T-02/T-03/T-06 → EV-06 aprobada HTTP sin horario/stock, contacto directo y sold concurrente 200/409. Móvil pendiente. |
| RF-07 Reserva temporal | US-06 | 1.3, 3.1, 5.3, 6.1 | 0001 AC-01/02/03/09; 0008 AC-01; 0010 AC-03/04 (precio, clave y migración) | 0001 T-03/T-08 → EV-01/02/03/09 aprobadas: plazo/precio/JWT/50 claves/varias reservas/retry. 0008 EV-01 privacidad API; móvil pendiente. |
| RF-08 Confirmar entrega | US-07 | 3.2, 5.5 | 0001 AC-04; también después de `end_time` dentro de sus 20 minutos | 0001 T-04/T-08 → EV-04 aprobada: vendedor, tras end_time dentro del plazo, terminales/carrera; UI pendiente. |
| RF-09 Expiración de reserva | US-08 | 1.3, 3.3, 3.4 | 0001 AC-06/08; 0010 AC-03/04 (datos de reserva) | 0001 T-05/T-08 → EV-06/08 aprobadas: Redis/BullMQ, reinicio real, jobs perdidos/duplicados, conciliación/devolución única. |
| RF-10 Cancelación [SHOULD] | US-07b | 3.2, 5.3 | 0001 AC-05/08 | 0001 T-04/T-08 → EV-05/08 aprobadas: comprador/stock único/feed/carreras; UI pendiente. |
| RF-11 Configurar ganga | US-05 | 2.4, 3.6, 5.4 | [0006](../specs/0006-precio-ganga/spec.md) AC-01/02/05 | 0006 T-02/T-04/T-07 → EV-01/02/05 aprobadas: configuración/encolado/reprogramación; formulario móvil pendiente. |
| RF-12 Activar ganga | US-05 | 3.5, 3.6, 5.2, 5.5 | 0006 AC-03/04/06; [0007](../specs/0007-tiempo-real/spec.md) AC-03; precio previo inmutable | 0006 T-03/T-04/T-07 → EV-03/04/06 y 0007 T-02/T-05 → EV-03 aprobadas: activación/evento/precio previo fijo; UI pendiente. |
| RF-13 WhatsApp | US-09, US-11 | 5.3, 5.6 | 0008 AC-01/02/03/04/05 | 0008 T-01/T-02/T-05 → EV-01/02/03/05 aprobadas API: LIVE protegido/STATIC directo/comprador activo/normalización; EV-04 URL/Linking pendiente. |
| RF-14 Ocultamiento [SHOULD] | US-10 | 6.4 | [0009](../specs/0009-reportes-y-moderacion/spec.md) AC-01/02/03 | 0009 EV-01/02/03 planificadas; DEC-01/02 abiertas, opcional y sin ejecutar. |
| RNF-01 Concurrencia | US-06, US-05b | 1.2, 1.3, 3.1, 6.1 | 0001 AC-02; 0003 AC-05; 0010 AC-02/03 | 0001 T-03/T-08 → EV-02: 50 claves 1×201/49×409; EV-09 misma clave 1×201/49×200/un ID. 0003 EV-05 carrera HTTP aprobada. |
| RNF-02 Tiempo real | US-03, US-05, US-06 | 3.5, 5.2 | 0007 AC-01/02/03/04/05 | 0007 T-01/T-02/T-05 → EV-01..05 aprobadas gateway: dos clientes/stock/fin/ganga/postcommit/reconexión+REST; móvil pendiente. |
| RNF-03 Sin GPS ni pagos | US-03, US-04, US-05c | Restricción en 2.4, 2.5, 5.2 | 0005 AC-04; alcance de 0001–0008 | 0005 EV-04 planificada; revisión transversal sin ejecutar. |

## Cómo mantenerla

Al verificar un feature, enlazar sus `EV` reales y resultado. Si un requisito comparte features, conservar exactamente qué parte cubre cada uno. Una evidencia planificada jamás se registra como aprobada. El estado del producto solo puede declararse completo cuando todas las filas `MUST` tienen evidencia aprobada y los `SHOULD` incluidos en el alcance acordado también la tienen.
