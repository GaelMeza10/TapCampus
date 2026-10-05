# 0008 — Verificación

Estado: **Privacidad/contacto backend verificados; Linking pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-03, T-04, T-05 | EV-01: LIVE público no, reserva autorizada sí | Aprobado API; enlace móvil pendiente |
| AC-02 | T-02, T-03, T-04, T-05 | EV-02: STATIC directo | Aprobado API fase 2; chat móvil pendiente |
| AC-03 | T-02, T-03, T-04, T-05 | EV-03: vendedor propio/vigencia/ajeno | Aprobado API |
| AC-04 | T-03, T-04 | EV-04: URL/fallo de apertura | Pendiente móvil, fuera de fase 3 |
| AC-05 | T-01, T-03, T-04, T-05 | EV-05: normalización/prefijo | Aprobado normalización backend; URL pendiente |

## Ejecución

`npm run test:phase2`, `npm run test:phase3`; [0001](../0001-reservas/verification.md) documenta entorno/checks, [phase3.json](../0001-reservas/evidence/phase3.json) y [phase2-recheck.json](../0001-reservas/evidence/phase2-recheck.json) registran resultados. BD/Redis aislados; Linking/openURL y dispositivo sin probar.

- EV-01, T-02/T-05: feed/detalle LIVE sin teléfonos; POST reserva/mine/detalle comprador relacionado reciben sellerContact.phone correcto tras alta. JWT/propiedad verificados, eventos sin teléfonos.
- EV-02, T-02/T-05: detalle STATIC ACTIVE ofrece sellerContact sin reservar, feed sin contactos; fin impide detalle.
- EV-03, T-02/T-05: vendedor relacionado recibe buyer {id,name}/buyerContact.phone solo ACTIVE no vencida. Ajeno 403, sin JWT 401; terminal/vencida sin teléfono de comprador.
- EV-05, T-01/T-05: registro 6641234567 persiste/entrega +526641234567; otra región +525512345678 canónica en reserva. Fase 2 revalida diez dígitos/+52 y rechazo de otros países/ambiguos/faltantes/hash. Original cero usuarios, sin transformación histórica. Construcción de URL pendiente.

## Convergencia

T-01/T-02/T-05 completas, T-03/T-04/EV-04 pendientes en fase 5. No se cierra el expediente ni 5.6 con evidencia parcial de API. Sin bloqueo backend.
