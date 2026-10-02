# 0009 — Reportes y ocultamiento de publicaciones (SHOULD)

Estado: **Borrador + Bloqueado; fuera del núcleo MUST** | Fecha: 2026-10-01

## Contexto y fuentes

RF-14 y US-10; `docs/02_REQUIREMENTS.md` exige ocultar una publicación al recibir tres reportes de usuarios distintos hasta revisión de un moderador. `docs/03_ARCHITECTURE.md` incluye `Report` y el estado `HIDDEN_BY_REPORTS`. `TASKS.md` 6.4 lo mantiene opcional. El esquema actual no aporta la restricción única `(reporter_id, publication_id)` ni existe flujo verificado de moderación.

## Alcance y contrato observable

- Si se incluye este SHOULD, un usuario identificado puede registrar un reporte para una publicación. Solo un reporte suyo cuenta hacia el umbral de esa publicación. La vía exacta de reporte, el motivo requerido y la elegibilidad del vendedor para reportarse están pendientes de DEC-02.
- Tras el tercer reportante distinto, la publicación pasa a `HIDDEN_BY_REPORTS` y sale del feed público. Dos reportantes distintos no activan ese estado.
- El requisito dice que permanece oculta hasta revisión de un moderador, pero no define cómo se resuelve esa revisión ni si puede restaurarse; DEC-01 bloquea ese contrato. No se implementa este comportamiento mientras esas decisiones afecten el resultado esperado.
- Fuera de alcance del MVP MUST: reportes, panel de moderación, sanciones y reputación.

## Criterios de aceptación pendientes de decisión

### AC-01 — Umbral de reportantes distintos

**Dado** una publicación visible, **cuando** tres usuarios distintos registran un reporte válido, **entonces** solo el tercero provoca la transición a `HIDDEN_BY_REPORTS` y la publicación deja de aparecer en el feed público.

### AC-02 — Reporte repetido y carrera

**Dado** una publicación con dos reportantes distintos, **cuando** el mismo usuario reintenta su reporte o llegan reportes simultáneos, **entonces** cada usuario cuenta una sola vez y no se ejecuta más de una transición a `HIDDEN_BY_REPORTS`.

### AC-03 — Persistencia del ocultamiento

**Dado** una publicación en `HIDDEN_BY_REPORTS`, **cuando** se consulta el feed público antes de la revisión, **entonces** permanece oculta. El resultado posterior a la revisión depende de DEC-01.

## Decisiones abiertas

DEC-01 y DEC-02 figuran en `decisions.md`. Este expediente opcional no puede pasar a `Planificado` ni implementarse hasta resolverlas.
