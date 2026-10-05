# 0004 — Verificación

Estado: **Backend fase 2 verificado; móvil pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia requerida | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-04, T-05, T-06 | EV-01 plan móvil; EV-06 creación 201 sin horario/stock | Aprobado backend; formulario pendiente |
| AC-02 | T-01, T-05, T-06 | EV-02 plan; EV-06 entradas inválidas 400 sin fila | Aprobado backend |
| AC-03 | T-02, T-04, T-05, T-06 | EV-03 plan móvil; EV-06 listado/detalle/contacto sin reserva | Aprobado backend; Linking móvil pendiente |
| AC-04 | T-02, T-03, T-04, T-05, T-06 | EV-04 plan móvil; EV-06 sold/exclusión/repetición/carrera | Aprobado backend; UI pendiente |
| AC-05 | T-03, T-05, T-06 | EV-05 plan; EV-06 edición/sold ajenos 403 | Aprobado backend |

## Convergencia

### EV-06 — HTTP STATIC de fase 2

T-01/T-02/T-03/T-06, AC-01..05, 2026-10-05. Entorno, comandos y [resumen](../0003-publicaciones-en-vivo/evidence/phase2.json) compartidos con [0003 EV-08..10](../0003-publicaciones-en-vivo/verification.md). Desde Backend: build, tsc, unitarias (9), E2E existente (1), lint y `npm run test:phase2`: salida 0. Script con PostgreSQL 16.15 aislado migrado/sembrado desde fase 1; hashes de BD original intactos. SDD desde raíz: salida 0.

STATIC completa →201 ACTIVE con stock/horas null, categoría/zone correctos, precio decimal e imagen servida. Faltantes/null/extra, categoría LIVE, zona ausente, precio cero/negativo/precisión excedida, imagen ausente/externa y campos stock/horario/ganga →400 sin fila parcial. PATCH propio válido →200; campo LIVE, estado/tipo/propietario enviados en body o valor inválido →400; ajeno →403, sin token →401 y ausente →404. Feed sin teléfonos, detalle ACTIVE incluye únicamente sellerContact.phone canónico y seller id/name; ni email ni password_hash.

sold propio →200 FINISHED, excluido del feed, detalle →404; LIVE →409, ajeno →403, sin JWT →401, body extra →400 e inexistente →404. Dos sold simultáneos →200/409; repetir →409 y editar FINISHED →409. No hay DELETE. T-01/T-02/T-03/T-06 completas. T-04/T-05, apertura WhatsApp y gestión móvil siguen pendientes; no se declara expediente Verificado completo.
