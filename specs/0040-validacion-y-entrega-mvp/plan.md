# 0040 — Plan de validación y entrega

Estado: Planificado | Especificación: spec.md

## Fases, datos y dependencias

1. AC-01: reunir EV de 0037/0038/0039 y 0034; comprobar el árbol/versiones reales, tsc completo de ambas capas, suites, lint backend, build, exports móviles y check-sdd. Corregir fallos en su feature, no ocultarlos en un informe de cierre.
2. AC-02: ejecutar checklist reproducible con comprador A, vendedor B y cuenta ajena C: dominio inválido, registro/login/logout/401, foto/cámara/permisos, LIVE y STATIC editables, filtros combinados, rechazo de contenido con borrador, WhatsApp previo, reserva y cancelación, entrega y venta física, cierre anticipado con reserva vigente y STATIC vendida. Registrar resultado HTTP/BD e interfaz; teclado, lector, texto ampliado y retorno de WhatsApp forman parte de aceptación nativa.
3. AC-03: extender verify-phase3.mjs o ejecutor aislado equivalente: 50 claves distintas última pieza 1×201/49×409, misma clave 1×201/49×200/un ID, carreras confirmación/cancelación/expiración, venta física/reserva y oferta/reconfiguración; probar dos clientes, pérdida de red, reconexión y retorno al primer plano. Reiniciar solo worker de fixtures. Distinguir timestamps acelerados de una comprobación real del plazo de 20 minutos según docs07.
4. AC-04: inventariar infraestructura disponible/credenciales sin imprimir secretos; seguir arquitectura actual o documentar alternativa antes de desplegar. Configurar secretos, CORS/origen, JWT, PostgreSQL, Redis persistente y volumen/almacenamiento durable de uploads. Ensayar migraciones en vacío y copia de prueba tras respaldo restaurable; no aplicar migraciones sobre datos reales sin inventario y ensayo. Probar HTTP, WebSocket y lectura de imagen después de reinicio y desde otra red; documentar rollback y recuperación.
5. AC-05: comprobar applicationId/bundleIdentifier definitivos y cuenta de build; preparar app.json y eas.json, perfil Android preview instalable y variables de API de ese perfil. Validar configuración/artefactos antes de solicitar cualquier autorización externa necesaria. Un APK requiere build nativo real y prueba de instalación limpia. Mantener APK/firmas/secretos fuera del historial; guardar hash y ubicación controlada en evidencia.
6. AC-06/07: preparar guion y fichas de observación mínimas, coordinar participantes disponibles y ejecutar UAT sin inventar datos. No hay envío automático de invitaciones. Registrar tiempos/incidentes anonimizados y plan de corrección; cada casilla global cierra solo con la EV correspondiente.

## Archivos y compatibilidad

Usar scripts existentes en Backend/scripts, Frontend/__tests__ y verificadores auxiliares. Crear checklist nativo en este expediente durante T-02; resultados en evidence/ con datos de prueba. Cambios a configuración de despliegue y docs de operación se redactan en T-04/05 después de conocer entorno real; no añadir proveedor contratado por defecto. Variables locales y secretos nunca se versionan. Sin cambio de esquema previsto por esta validación; cualquier fallo que requiera migración se especifica aparte.

## Constitución

| Principio | Aplicación |
| --- | --- |
| I | Escenarios, muestras y puertas definidos antes de ejecutar. |
| II | Matriz RF/US/AC/T/EV transversal enlaza pruebas originales y nuevas. |
| III | PostgreSQL real, invariantes, reinicio y precio/plazo de servidor. |
| IV | Entorno, permisos y datos de contacto comprobados por actor. |
| V | Técnico/móvil/distribución/UAT separados; fallo permanece abierto. |
| VI | Entrega del MVP vigente, sin módulos opcionales ni gastos inferidos. |

## Riesgos, reversión y orden

T-01 → T-02/T-03 → T-04 → T-05 → T-06 → T-07. T-02/T-03 pueden preparar recorridos en local antes de nube, siempre que se identifique el entorno. T-04 depende de acceso a infraestructura; T-05 de firma/build y teléfono; T-06 de participantes y semana de piloto. No detienen 0037/0038/0039. Riesgos principales: proceso API antiguo, origen temporal de imágenes, Redis efímero, mocks confundidos con bloqueo real y cambio manual de stock tras entrega no confirmada. Verificar explícitamente. Recuperación por respaldo restaurado, rollback localizado de configuración y conservación del artefacto anterior; nunca git reset global ni restaurar archivos con cambios previos.
