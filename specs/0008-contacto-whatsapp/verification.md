# 0008 — Verificación

Revisión 2026-11-21: AC-01 se amplía con consulta previa en detalle LIVE. [0039](../0039-contacto-live-sin-reserva/verification.md) aporta nueva aprobación técnica: 674 HTTP, 102 backend/134 frontend, 16 capturas auxiliares y exports PASS; apertura nativa pendiente. EV-01/EV-06 siguientes son históricas y **no** aprueban por sí solas ese criterio actualizado. Privacidad del comprador y normalización previas conservan su alcance.

Estado: **Privacidad/contacto backend verificados; Linking pendiente** | Fecha: 2026-10-05

| AC | Tarea(s) | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-02, T-03, T-04, T-05 | EV-01 histórica: LIVE público no, reserva autorizada sí | Contrato anterior aprobado API; consulta previa 0039 y móvil pendientes |
| AC-02 | T-02, T-03, T-04, T-05 | EV-02: STATIC directo | Aprobado API fase 2; chat móvil pendiente |
| AC-03 | T-02, T-03, T-04, T-05 | EV-03: vendedor propio/vigencia/ajeno | Aprobado API |
| AC-04 | T-03, T-04 | EV-04: URL/fallo de apertura | Pendiente móvil, fuera de fase 3 |
| AC-05 | T-01, T-03, T-04, T-05 | EV-05: normalización/prefijo | Aprobado normalización backend; URL pendiente |

### EV-06 — URL y fallo controlado (2026-10-13)

AC-01/02/03/04/05 → T-03/T-04: `whatsappUrl` acepta únicamente `+52` y diez dígitos, elimina solo `+`, codifica título Unicode/con símbolos y distingue mensaje de reserva frente a interés STATIC. `openWhatsApp` convierte rechazo de `Linking.openURL` en error visible sin cerrar pantalla. `marketplace-contracts.test.tsx` prueba ambos formatos canónicos, rechazo extranjero y fallo simulado; frontend 8 suites/25 pruebas, tsc y exportación web aprobaron. Feed/LIVE público siguen sin teléfono; comprador usa contacto de su reserva y vendedor de reserva activa. Falta apertura WhatsApp real en Android/iOS y flujo completo con API/BD; T-03/T-04, AC-04 y 5.6 siguen abiertos.

## Ejecución

`npm run test:phase2`, `npm run test:phase3`; [0001](../0001-reservas/verification.md) documenta entorno/checks, [phase3.json](../0001-reservas/evidence/phase3.json) y [phase2-recheck.json](../0001-reservas/evidence/phase2-recheck.json) registran resultados. BD/Redis aislados; Linking/openURL y dispositivo sin probar.

- EV-01, T-02/T-05: feed/detalle LIVE sin teléfonos; POST reserva/mine/detalle comprador relacionado reciben sellerContact.phone correcto tras alta. JWT/propiedad verificados, eventos sin teléfonos.
- EV-02, T-02/T-05: detalle STATIC ACTIVE ofrece sellerContact sin reservar, feed sin contactos; fin impide detalle.
- EV-03, T-02/T-05: vendedor relacionado recibe buyer {id,name}/buyerContact.phone solo ACTIVE no vencida. Ajeno 403, sin JWT 401; terminal/vencida sin teléfono de comprador.
- EV-05, T-01/T-05: registro 6641234567 persiste/entrega +526641234567; otra región +525512345678 canónica en reserva. Fase 2 revalida diez dígitos/+52 y rechazo de otros países/ambiguos/faltantes/hash. Original cero usuarios, sin transformación histórica. Construcción de URL pendiente.

## Convergencia

T-01/T-02/T-05 completas, T-03/T-04/EV-04 pendientes en fase 5. No se cierra el expediente ni 5.6 con evidencia parcial de API. Sin bloqueo backend.
