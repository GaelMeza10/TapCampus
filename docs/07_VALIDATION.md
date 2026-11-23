# Plan de Validación (QA y UAT) - TapCampus

Pasada adversa 0045 (2026-11-22): [matriz y evidencia](../specs/0045-errores-y-datos-adversos/verification.md) para entradas inválidas, espacios, valores numéricos fuera de rango, texto largo/Unicode, imágenes y errores de carga/acciones en todas las rutas. Las interacciones con fixture web, Jest y HTTP aislado se distinguen de permisos/red real/teclado/lector en teléfono. No cierran los recorridos nativos de 0040 ni UAT.

Este documento define cómo sabremos que el proyecto fue un éxito, dividiendo la validación en el ámbito técnico (código) y el ámbito humano (usuario final).

Plan de cierre 2026-11-21: [0040](../specs/0040-validacion-y-entrega-mvp/plan.md) organiza regresión actual, aceptación nativa de ambos roles, despliegue persistente, instalable y UAT como puertas separadas. Depende de 0037/0038/0039 y del patrón de errores 0034; ninguna se considera aprobada por existir el plan.

## 1. Validación Técnica (QA - Quality Assurance)

### 1.1 Pruebas de Estrés y Concurrencia (Crítico)
*   **Objetivo:** Validar que el Bloqueo Pesimista funciona.
*   **Método:** Disparar 50 peticiones simultáneas con claves de idempotencia distintas (con herramientas como JMeter o un script de Node.js) al endpoint de crear reserva para un producto que solo tiene 1 pieza.
*   **Criterio de Éxito:** Solo 1 petición retorna `HTTP 201 Created`. Las otras 49 retornan `HTTP 409 Conflict`.

### 1.2 Pruebas de Resiliencia (Background Jobs)
*   **Objetivo:** Validar que las reservas expiran a los 20 minutos incluso en condiciones adversas.
*   **Método:** Crear una reserva. Apagar el servidor NestJS de inmediato. Esperar 21 minutos y volver a encender el servidor.
*   **Criterio de Éxito:** Redis/BullMQ debe procesar el job en cola tan pronto el servidor despierte, devolviendo el stock y marcando la reserva como `EXPIRED`.

### 1.3 Cobertura de aceptación por funcionalidad

Cada expediente `specs/0001`–`0008` tiene una matriz `AC → T → EV` en `verification.md`. Las siguientes comprobaciones son obligatorias antes de declarar el MVP verificado; una fila planificada no equivale a una prueba aprobada.

| Área | Comprobación indispensable |
| --- | --- |
| Autenticación (0002) | Registro UABC válido/inválido, cuatro campos, hash, duplicado, login, JWT y ruta protegida con BD real. |
| Teléfono mexicano (0002/0008) | Números de distintas regiones con diez dígitos o `+52`, normalización idéntica y rechazo de país ajeno/entrada ambigua. |
| Venta en vivo (0003) | Creación/imagen, horario y stock, propiedad, expiración y carrera entre reserva y venta física. |
| Estáticas (0004) | Crear/listar sin reserva, marcar «Vendida», excluir del catálogo y rechazar usuario ajeno. |
| Catálogos/filtros (0005) | Seed repetible, cinco zonas, categorías por tipo y filtros `AND` con respuesta vacía e inválida. |
| Ganga (0006/0037) | Activación manual/programada, configuración privada, mínimo estricto, retirada/cambio de modo, trabajos obsoletos, carreras/reinicio, precio decimal, evento, prioridad y reserva anterior inmutable. |
| Tiempo real (0007) | Dos clientes, stock/precio/fin actualizados y resincronización tras desconexión. |
| WhatsApp (0008/0039) | Consulta previa en detalle LIVE/STATIC visible; feed/eventos sin teléfonos; privacidad de comprador, contacto desde reserva aunque desaparezca detalle, URL codificada y apertura/error nativos. |
| Contenido (0038) | Cada entrada de política, falsos positivos, acentos/palabras completas, rechazo HTTP sin publicación/jobs y recuperación del borrador/foto; creación y texto editado de ambos tipos. |
| Reservas (0001) | 50 compradores por última pieza con claves distintas; dos reservas del mismo comprador con claves distintas; reintento concurrente con la misma clave sin doble descuento; precio fijado; confirmación tras `end_time` dentro de los 20 minutos; permisos y expiración. |
| Reportes SHOULD (0009) | Solo si se incluye RF-14: tres reportantes distintos, duplicados, concurrencia, visibilidad y resultado de revisión tras cerrar sus decisiones. |

La prueba de concurrencia requiere PostgreSQL real; mocks de Prisma no demuestran bloqueo de fila. La de reinicio requiere detener/reiniciar el proceso del worker con Redis persistente. En móviles, comprobar flujos en dispositivo o emulador y registrar versión/entorno.

### 1.4 Evidencia y puerta de cierre

Por cada `AC`, anotar comando o recorrido reproducible, datos iniciales, resultado observado, fecha y enlace a prueba/log/captura en `verification.md`. Un resultado fallido crea una tarea o un cambio de especificación. Solo se marca `[x]` en `TASKS.md` cuando el alcance global de esa casilla tenga evidencia aprobada. Antes del cierre ejecutar `node scripts/check-sdd.mjs` y revisar semánticamente la convergencia entre requisitos, contratos, pruebas y código.

## 2. Validación de Usuario (UAT - User Acceptance Testing)

### 2.0 Casos límite para la evaluación del profesor

El [plan de casos límite de 0040](../specs/0040-validacion-y-entrega-mvp/casos-limite.md) concreta las instrucciones recibidas: modo avión, vacíos, números inválidos, texto largo, pulsaciones repetidas, giro, salida/regreso, permisos y listas vacías. Incluye 43 casos con datos/pasos, resultado esperado y recuperación, más un recorrido corto de 12 casos para preparar la exposición. [Registro por sesión](../specs/0040-validacion-y-entrega-mvp/registro-casos-limite.md).

Evaluar estabilidad/recuperación y función/integridad por separado. Un rechazo controlado previsto puede aprobar; un defecto funcional no se oculta porque no hubo cierre. Portrait, ausencia de GPS y falta de persistencia prometida para borradores nunca guardados tras terminar el proceso se respetan como límites actuales. La preparación del documento no ejecuta los casos ni cierra AC-02/03 de 0040; tampoco sustituye usabilidad o piloto.

### 2.1 Prueba de Usabilidad (Pasillo)
*   **Objetivo:** Validar que las Heurísticas de Diseño funcionan.
*   **Método:** Darle la app a 5 estudiantes que nunca la han usado. Pedirles que completen dos tareas sin ayuda: "Encuentra dónde venden burritos y apártalo" y "Sube un producto para vender".
*   **Criterio de Éxito:** Los usuarios logran completar las tareas en menos de 2 minutos sin preguntar cómo se usa la interfaz.

### 2.2 Beta Testing (Prueba Piloto en Campus)
*   **Objetivo:** Validar que la app resuelve el "Planteamiento del Problema" original.
*   **Método:** Desplegar la app en producción (TestFlight / APK) durante 1 semana invitando a 3 vendedores reales de la facultad y 15 compradores.
*   **Criterio de Éxito:**
    *   No hay dobles ventas de un mismo producto en la vida real.
    *   Los vendedores logran usar el "Precio Ganga" exitosamente.
    *   La comunicación por WhatsApp fluye sin fricciones a través de los Deep Links.
