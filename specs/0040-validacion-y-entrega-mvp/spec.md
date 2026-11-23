# 0040 — Validación integrada y entrega del MVP

Estado: Regresión técnica aprobada; aceptación física, distribución y UAT pendientes | Revisión: 2026-11-22

## Contexto y fuentes

RF-01, RF-02, RF-03, RF-04, RF-05, RF-05b, RF-05c, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-13, RF-15; RNF-01, RNF-02, RNF-03; US-01, US-02, US-03, US-04, US-05, US-05b, US-05c, US-05d, US-06, US-07, US-07b, US-08, US-09, US-11, US-12. TASKS 5.1–5.6, 5.15, 6.2/6.3/6.5/6.6. Fuentes docs07/08, auditoría y planes 0034/0037/0038/0039. Evidencia histórica de fases backend, exports y capturas no sustituye aceptación móvil.

## Alcance

Incidente INC-0040-02 (AC-02, formulario LIVE): en iPhone con Expo Go, Inicio/Fin abre un rectángulo gris y el selector aparece mal al tocarlo. Se requiere mostrar las ruedas de fecha/hora completas al abrir, conservar el resumen y guardar solo al pulsar «Guardar horario»; cerrar descarta la selección provisional. La corrección comprende también edición y no cambia las reglas de horarios ni los diálogos Android.

Incluye regresión integrada, recorridos nativos de ambos roles, resiliencia real, preparación de infraestructura/instalador y UAT definido por docs07. No introduce nuevas funcionalidades, moderación SHOULD, reputación, push, pagos, GPS o panel. Distingue cuatro resultados: técnico, móvil, distribución y UAT; aprobar uno no aprueba los restantes.

Complemento 2026-11-21 solicitado por el alumno según instrucciones del profesor: [plan de casos límite](casos-limite.md) con 43 casos, recorrido corto y [registro de resultados](registro-casos-limite.md). Se evalúan estabilidad/recuperación y función/integridad por separado; esta incorporación es planificación y no acredita ejecuciones ni cambia límites de producto.

## Puertas y reglas

- Antes de integración final: ejecutar y documentar 0037/0038/0039, resolver los AC pendientes del formulario 0034 y comparar versiones frontend/API utilizadas. No heredar PASS de una rama o proceso antiguo.
- Pruebas automatizadas de concurrencia usan PostgreSQL real y namespace Redis de prueba. Nunca truncar, migrar ni reiniciar la BD/API original para preparar fixtures.
- Recorrido nativo usa mínimo dos cuentas en dos dispositivos/emuladores, incluyendo al menos un teléfono físico. Registrar plataforma, SO/app/API, condiciones de red, pasos y datos inicial/final. Marcar plataforma no probada como pendiente.
- Entrega operativa requiere origen HTTPS persistente para API, Socket.io e imágenes, PostgreSQL/Redis y almacenamiento de uploads persistentes; un túnel temporal sirve para pruebas, no acredita despliegue final.
- Instalable Android de prueba con identidad coherente TapCampus, applicationId estable, versión, perfil de build e instrucciones de instalación. No declarar iOS distribuido por exportar JS; si forma parte de la entrega, exigir firma/canal y prueba propios.
- Usabilidad: cinco estudiantes nuevos completan encontrar/apartar y publicar en menos de dos minutos sin ayuda según docs07. Piloto separado: una semana, tres vendedores y quince compradores; sin dobles ventas, ofertas y WhatsApp funcionando. No inventar participantes o resultados.
- Guardar evidencias sin contraseñas/JWT/teléfonos completos ni rostros/datos personales innecesarios. Fallos generan tarea/corrección vinculada antes de volver a ejecutar solo las comprobaciones afectadas.
- No contratar servicios, asumir costes ni publicar una app en tienda como parte de redactar el plan. Preparar resultados revisables antes de cualquier aprobación externa realmente necesaria.

## Criterios de aceptación

### AC-01 — Regresión técnica actual
**Dado** los cambios funcionales integrados, **cuando** se ejecutan tipos completos, pruebas, build y validación documental, **entonces** no quedan fallos y cada RF MUST enlaza EV actual o evidencia reutilizable justificada.

### AC-02 — Recorridos móviles de ambos roles
**Dado** cuentas y servicios reales de prueba, **cuando** se registran/acceden, publican/editan LIVE/STATIC con foto, filtran, consultan/reservan/cancelan/entregan y cierran, **entonces** permisos, formularios, avisos y reservas previas funcionan en los dispositivos identificados.

El recorrido incluye los casos aplicables de casos-limite.md: red interrumpida, entradas vacías/inválidas/largas, pulsaciones repetidas, permisos, giro, segundo plano/reinicio, vacíos y recuperación. Registrar cierre inesperado, congelamiento o pantalla roja como fallo de estabilidad aunque otras comprobaciones aprueben. Se conserva por separado cualquier defecto funcional con fallo controlado.

### AC-03 — Concurrencia, ofertas y resiliencia
**Dado** última pieza, cambios de oferta y desconexión/reinicio del worker aislado, **cuando** compiten solicitudes y se recuperan servicios, **entonces** no hay doble descuento/liberación, el plazo es de servidor, no se activa programación retirada y ambos clientes se resincronizan.

### AC-04 — Despliegue persistente verificable
**Dado** entorno preparado, **cuando** se reinicia su servicio y se accede por HTTPS fuera de la red de desarrollo, **entonces** API/Socket.io/imágenes funcionan y datos/jobs/archivos persisten, con configuración y recuperación documentadas.

### AC-05 — Instalable probado
**Dado** artefacto de distribución, **cuando** se instala desde cero en un teléfono objetivo, **entonces** inicia sesión contra el entorno correcto y completa un recorrido; se registra identificador, versión y hash del artefacto.

### AC-06 — Usabilidad de pasillo
**Dado** cinco estudiantes sin experiencia previa, **cuando** completan las dos tareas de docs07, **entonces** cada resultado y tiempo se registra contra el umbral de dos minutos, sin sustituir fallos por una valoración subjetiva.

### AC-07 — Piloto y cierre
**Dado** piloto de una semana con tres vendedores y quince compradores, **cuando** finaliza, **entonces** se documentan dobles ventas/incidentes, uso de oferta y WhatsApp, y solo se declara MVP verificado cuando todos los AC obligatorios y sus expedientes tienen EV satisfactoria.

## Decisiones y dependencias

Alcance de QA/UAT ya definido por docs07; no se rebaja al redactar este plan. Proveedor/cuenta/identificadores/firma y disponibilidad de participantes son dependencias operativas de T-04/T-05/T-06, a inventariar antes de ejecutar esas tareas, sin impedir los bloques funcionales locales.
