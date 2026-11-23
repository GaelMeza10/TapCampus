# 0049 — Ajustes de usabilidad y errores para la entrega

Estado: En verificación | Fecha: 2026-11-22

## Contexto y fuentes

- Necesidad / actor: compradores y vendedores en la demo final; hallazgos de pruebas de límites y revisión de usabilidad del 2026-11-22.
- Requisitos `RF/RNF` e historias `US`: RF-01, RF-02, RF-03, RF-06, RF-07, RF-08; RNF-01; US-01, US-02, US-03, US-06.

## Alcance

- Incluye: bloquear apartado de la propia publicación; mensaje único al fallar un apartado por stock; estado vacío de Explorar sin filtros; temporizadores legibles; precio con `$`, espacios o coma; errores de la API en español; motivo real al guardar Mi cuenta; registro que explica qué falta; espera y aviso en login/registro con servidor dormido.
- Excluye: cambios de modelo de datos o contratos de éxito de la API.

## Criterios de aceptación

### AC-01 — Publicación propia
**Dado** un vendedor en el detalle de su publicación, **entonces** no ve Apartar ni WhatsApp sino «Gestionar en Mis ventas»; la API responde 403 «No puedes apartar tu propia publicación» sin descontar stock.

### AC-02 — Mensajes claros
**Dado** un 409 al apartar, **entonces** se muestra una sola frase. **Dado** un error de validación, JSON inválido o cuerpo grande, **entonces** la API responde en español. **Dado** un 400 al guardar Mi cuenta, **entonces** se muestra el motivo del servidor.

### AC-03 — Explorar y temporizadores
**Dado** Explorar sin búsqueda ni filtros y sin resultados, **entonces** no se ofrece «Cambiar filtros». El banner muestra «Quedan mm:ss» y «Por vencer» con 5 min o menos; el cierre usa horas desde 60 min.

### AC-04 — Formularios
**Dado** un precio «$1,50 », **entonces** se guarda como 1.50. **Dado** el registro incompleto, **cuando** se pulsa Crear cuenta, **entonces** se marca lo que falta, incluido el aviso de privacidad. **Dado** un login de más de 5 s, **entonces** se avisa que el servidor puede tardar (timeout 70 s).

## Decisiones abiertas

- Ninguna.
