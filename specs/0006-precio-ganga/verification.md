# 0006 — Verificación

Revisión 2026-11-21: las EV siguientes conservan resultados históricos. La ampliación de AC-02 para rechazar igualdad y las reglas de configuración privada/cambio/retirada todavía no están aprobadas; comprobar [0037](../0037-control-y-privacidad-ofertas/verification.md). Esta nota no convierte una prueba anterior en evidencia del nuevo contrato.

Estado: **Backend fase 3 verificado; UI pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-06, T-07 | EV-01: configuración sin descuento | Aprobado backend |
| AC-02 | T-02, T-06, T-07 | EV-02: 400 sin filas/jobs en contrato histórico | Aprobado histórico; igualdad añadida en 0037 pendiente |
| AC-03 | T-03, T-05, T-06, T-07 | EV-03: manual/permisos/feed/evento | Aprobado backend; UI pendiente |
| AC-04 | T-04, T-05, T-06, T-07 | EV-04: delay/reinicio/evento único | Aprobado backend |
| AC-05 | T-04, T-06, T-07 | EV-05: horario/job antiguo/finalización | Aprobado backend |
| AC-06 | T-01, T-03, T-04, T-06, T-07 | EV-06: repetición/precio anterior/nuevo | Aprobado backend |

### EV-07 — Controles móviles (2026-10-13)

AC-01/02/03/04/06 → T-05/T-06: formulario configura ganga manual/programada y valida mínimo/minutos; feed muestra distintivo/precio recibido y Mis Ventas confirma activación manual. TypeScript, exportación Expo y 8 suites/25 pruebas frontend aprobaron; el backend real continúa acreditado por EV-01..06. No se recorrió activación desde dispositivo ni cambio de precio Socket.io real; T-05/T-06 y 5.2/5.5 siguen abiertos.

## Reproducción y registro

`npm run build`, `npm run test:phase2`, `npm run test:phase3` desde Backend con PostgreSQL/Redis reales. [0001 verification](../0001-reservas/verification.md) contiene entorno/comandos/aceleración/reinicio; [phase3.json](../0001-reservas/evidence/phase3.json) contiene dieciséis grupos PASS/311 HTTP. [Script](../../Backend/scripts/verify-phase3.mjs) conserva fixtures aislados/hash original, sin migración nueva.

- EV-01, T-02/T-07: MANUAL/SCHEDULED guardan mínimo/modo/minutos sin cambiar 12.50 ni activar; job delayed en fecha fin menos minutos.
- EV-02, T-02/T-07: mínimo cero/mayor, minutos cero/programación imposible →400, fila SQL y recuentos de jobs iguales antes/después. STATIC/incoherencias/faltantes cubiertos además por fase 2.
- EV-03, T-03/T-07: propia activa de una vez 9.25/is_ganga_active; dos clientes reciben {publicationId,newPrice:'9.25'}, primer lugar del feed REST. Ajeno 403, sin JWT 401, inexistente 404, UUID inválido 400; sin configuración/STATIC/finalizada 409.
- EV-04, T-04/T-07: job creado por API con delay real activa 7.50 una vez. Proceso worker apagado conserva job Redis; proceso nuevo consume y confirma 6.75 tras reinicio. Conciliación recupera configuración desde BD.
- EV-05, T-04/T-07: PATCH end_time crea nuevo job; ejecución adelantada/disparo real del antiguo no activan, nuevo sí. Finalizar antes del disparo impide activación/evento. Editar título/stock de ganga ya activa permite conservar disparo histórico.
- EV-06, T-01/T-03/T-04/T-07: manual repetida/edición de precio activo 409, job duplicado sin evento; reserva previa conserva 12.50, nueva captura 9.25, inventario no cambia por ganga.

## Convergencia

T-01/T-02/T-03/T-04/T-07 completas. T-05/T-06 mantienen distintivo/controles móviles; API/worker/feed/eventos verificados. Sin bloqueo 3.6, expediente En implementación por móvil.
