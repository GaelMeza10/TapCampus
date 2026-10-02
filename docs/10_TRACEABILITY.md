# Matriz de trazabilidad de TapCampus

Fecha: 2026-10-01. Esta matriz cubre **todos los requisitos identificados** en `02_REQUIREMENTS.md`. `TASKS.md` aporta tareas globales; solo los directorios `specs/` aportan criterios `AC`, tareas detalladas `T` y evidencia `EV`. **Planificada** significa que existe una casilla de backlog; **sin evidencia** significa que ninguna prueba de aceptación ha demostrado todavía el requisito.

| Requisito | Historia | Tarea global | Feature / criterio | Evidencia y estado |
| --- | --- | --- | --- | --- |
| RF-01 Registro UABC | US-01 | 2.1, 5.1 | [0002](../specs/0002-autenticacion/spec.md) AC-01/02/03/06 | 0002 EV-01/02/03/06 planificadas; sin ejecutar. |
| RF-02 Perfil obligatorio | US-01 | 2.1, 5.1 | 0002 AC-02/03 y [0008](../specs/0008-contacto-whatsapp/spec.md) AC-05; teléfono mexicano con o sin `+52` | 0002 EV-02/03 y 0008 EV-05; sin ejecutar. |
| RF-03 Publicación en vivo | US-03 | 2.3, 2.4, 5.4 | [0003](../specs/0003-publicaciones-en-vivo/spec.md) AC-01/02/03/06 | 0003 EV-01/02/03/06 planificadas; sin ejecutar. |
| RF-04 Expirar por tiempo/stock | US-03, US-08 | 2.4, 3.5, 5.2 | 0003 AC-03/04; [0001](../specs/0001-reservas/spec.md) AC-08; cierre sin nuevas reservas y continuidad de las previas | 0003 EV-03/04 y 0001 EV-08; sin ejecutar. |
| RF-05 Cierre anticipado [SHOULD] | US-05d | 5.5 | 0003 AC-07; 0001 AC-07 | 0003 EV-07 y 0001 EV-07; sin ejecutar. |
| RF-05b Venta física | US-05b | 2.6, 5.5 | 0003 AC-05/06 | 0003 EV-05/06 planificadas; sin ejecución. |
| RF-05c Filtros | US-05c | 1.4, 2.5, 2.7, 5.2 | [0005](../specs/0005-catalogos-y-filtros/spec.md) AC-01/02/03/04 | 0005 EV-01..04 planificadas; sin ejecución. |
| RF-06 Catálogo estático | US-04, US-11 | 2.4, 2.6, 5.2, 5.4, 5.6 | [0004](../specs/0004-catalogo-estatico/spec.md) AC-01/02/03/04/05 | 0004 EV-01..05 planificadas; sin ejecución. |
| RF-07 Reserva temporal | US-06 | 3.1, 5.3, 6.1 | 0001 AC-01/02/03/09; 0008 AC-01; precio fijado, varias reservas y reintento | 0001 EV-01/02/03/09 y 0008 EV-01; sin ejecutar. |
| RF-08 Confirmar entrega | US-07 | 3.2, 5.5 | 0001 AC-04; también después de `end_time` dentro de sus 20 minutos | 0001 EV-04 planificada; sin ejecución. |
| RF-09 Expiración de reserva | US-08 | 3.3, 3.4 | 0001 AC-06/08 | 0001 EV-06/08 planificadas; sin ejecución. |
| RF-10 Cancelación [SHOULD] | US-07b | 3.2, 5.3 | 0001 AC-05/08 | 0001 EV-05/08 planificadas; sin ejecución. |
| RF-11 Configurar ganga | US-05 | 2.4, 3.6, 5.4 | [0006](../specs/0006-precio-ganga/spec.md) AC-01/02/05 | 0006 EV-01/02/05 planificadas; sin ejecución. |
| RF-12 Activar ganga | US-05 | 3.5, 3.6, 5.2, 5.5 | 0006 AC-03/04/06; [0007](../specs/0007-tiempo-real/spec.md) AC-03; precio previo inmutable | 0006 EV-03/04/06 y 0007 EV-03; sin ejecutar. |
| RF-13 WhatsApp | US-09, US-11 | 5.3, 5.6 | 0008 AC-01/02/03/04/05 | 0008 EV-01..05 planificadas; formato definido, sin ejecutar. |
| RF-14 Ocultamiento [SHOULD] | US-10 | 6.4 | [0009](../specs/0009-reportes-y-moderacion/spec.md) AC-01/02/03 | 0009 EV-01/02/03 planificadas; DEC-01/02 abiertas, opcional y sin ejecutar. |
| RNF-01 Concurrencia | US-06, US-05b | 3.1, 6.1 | 0001 AC-02; 0003 AC-05 | 0001 EV-02 y 0003 EV-05; sin ejecutar. |
| RNF-02 Tiempo real | US-03, US-05, US-06 | 3.5, 5.2 | 0007 AC-01/02/03/04/05 | 0007 EV-01..05 planificadas; sin ejecución. |
| RNF-03 Sin GPS ni pagos | US-03, US-04, US-05c | Restricción en 2.4, 2.5, 5.2 | 0005 AC-04; alcance de 0001–0008 | 0005 EV-04 planificada; revisión transversal sin ejecutar. |

## Cómo mantenerla

Al verificar un feature, enlazar sus `EV` reales y resultado. Si un requisito comparte features, conservar exactamente qué parte cubre cada uno. Una evidencia planificada jamás se registra como aprobada. El estado del producto solo puede declararse completo cuando todas las filas `MUST` tienen evidencia aprobada y los `SHOULD` incluidos en el alcance acordado también la tienen.
