# Plan de Validación (QA y UAT) - TapCampus

Este documento define cómo sabremos que el proyecto fue un éxito, dividiendo la validación en el ámbito técnico (código) y el ámbito humano (usuario final).

## 1. Validación Técnica (QA - Quality Assurance)

### 1.1 Pruebas de Estrés y Concurrencia (Crítico)
*   **Objetivo:** Validar que el Bloqueo Pesimista funciona.
*   **Método:** Disparar 50 peticiones simultáneas (con herramientas como JMeter o un script de Node.js) al endpoint de crear reserva para un producto que solo tiene 1 pieza.
*   **Criterio de Éxito:** Solo 1 petición retorna `HTTP 201 Created`. Las otras 49 retornan `HTTP 409 Conflict`.

### 1.2 Pruebas de Resiliencia (Background Jobs)
*   **Objetivo:** Validar que las reservas expiran a los 20 minutos incluso en condiciones adversas.
*   **Método:** Crear una reserva. Apagar el servidor NestJS de inmediato. Esperar 21 minutos y volver a encender el servidor.
*   **Criterio de Éxito:** Redis/BullMQ debe procesar el job en cola tan pronto el servidor despierte, devolviendo el stock y marcando la reserva como `EXPIRED`.

## 2. Validación de Usuario (UAT - User Acceptance Testing)

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
