# 0007 — Verificación

Estado: **Gateway backend verificado; cliente móvil pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01, T-02, T-03, T-04, T-05 | EV-01: stock en dos clientes | Aprobado gateway; render móvil pendiente |
| AC-02 | T-01, T-02, T-03, T-04, T-05 | EV-02: fin único/feed cerrado | Aprobado backend; móvil pendiente |
| AC-03 | T-01, T-02, T-03, T-04, T-05 | EV-03: precio/evento/orden REST | Aprobado backend; UI pendiente |
| AC-04 | T-03, T-04, T-05 | EV-04: reconexión/reconsulta REST | Aprobado soporte backend; automático móvil pendiente |
| AC-05 | T-01, T-02, T-04, T-05 | EV-05: rechazos/retry/bloqueo sin eventos falsos | Aprobado backend |

## Reproducción y resultados

`npm run build` y `npm run test:phase3`, PostgreSQL/Redis y dos conexiones socket.io-client reales. Ver [entorno/comandos](../0001-reservas/verification.md), [script](../../Backend/scripts/verify-phase3.mjs) y [phase3.json](../0001-reservas/evidence/phase3.json). Socket.io comparte puerto REST/namespace /, room feed; CORS_ORIGINS y cliente sin Origin. Payloads exactos sin contactos/email/password/tokens.

- EV-01, T-01/T-02/T-05: reserva/cancelación/expiración/venta física/edición efectiva emiten stock_updated {publicationId,newStock} confirmado. Última pieza/reintentos solo descuentan/emiten una vez.
- EV-02, T-01/T-02/T-05: fin natural/manual persiste FINISHED y emite publication_expired {publicationId} una vez; REST excluye publicación, nuevas reservas 409, previa confirmable; duplicado sin transición.
- EV-03, T-01/T-02/T-05: ganga emite {publicationId,newPrice} cadena de dos posiciones, marca/prioridad REST correctas; reprogramación/duplicados/finalizadas sin eventos espurios.
- EV-04, T-05: cliente 2 desconectado pierde descuento; al reconectar, GET publications recupera stock actual. Siguiente evento llega. No demuestra listeners Expo.
- EV-05, T-01/T-02/T-05: stock agotado, retry/terminales y jobs repetidos sin nuevo evento. Bloqueo SQL retiene reserva sin emisión antes del commit; confirmar stock cero causa 409 sin evento.

## Convergencia

T-01/T-02/T-05 completas; T-03/T-04 mantienen integración/pruebas móviles. 3.5 cubierta. REST es autoridad al perder eventos; no se promete replay durable ni despliegue multiinstancia en esta fase.
