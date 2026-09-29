# Index de Reglas y Contexto para TapCampus (Agent Rules)

Este archivo (`AGENTS.md`) sirve como el **punto de entrada principal** para la Inteligencia Artificial. Este proyecto sigue un estándar profesional de documentación distribuida. 

**NO debes hacer suposiciones sobre el proyecto.** Cuando el usuario te pida desarrollar una característica, **DEBES apoyarte en los siguientes documentos** leyendo los que correspondan al contexto de la tarea solicitada antes de escribir el código:

## Índice de Documentación (Carpeta `/docs`)

*   📄 **`docs/01_PROJECT_OVERVIEW.md`** 
    *   **Contenido:** Visión general, planteamiento del problema, objetivos y stakeholders (vendedores, compradores, moderadores).
    *   **Cuándo leerlo:** Si necesitas entender "para qué" sirve la aplicación o quién la va a usar, o si vas a crear flujos nuevos que involucren la experiencia general.

*   📄 **`docs/02_REQUIREMENTS.md`**
    *   **Contenido:** Reglas de negocio críticas (tipos de publicaciones, sistema de apartado de 20 minutos con bloqueo pesimista, innovación del "precio ganga").
    *   **Cuándo leerlo:** Antes de desarrollar lógica de backend, validaciones, creación de publicaciones, controladores de NestJS o jobs programados.

*   📄 **`docs/03_ARCHITECTURE.md`**
    *   **Contenido:** Stack tecnológico (React Native, NestJS, Prisma, Socket.io), diseño de esquema de base de datos (Entidad-Relación) y patrones de código exigidos.
    *   **Cuándo leerlo:** Cuando vayas a crear modelos de Prisma, migraciones, endpoints de la API, o configurar WebSockets (Socket.io).

*   📄 **`docs/04_UI_UX_GUIDELINES.md`**
    *   **Contenido:** Paleta de colores exacta (ej. verde UABC), diseño de inputs, tarjetas, bordes, sombras y comportamientos nativos (`SafeAreaView`, `KeyboardAvoidingView`).
    *   **Cuándo leerlo:** **OBLIGATORIO** antes de escribir, generar o modificar cualquier componente visual, hook o pantalla en React Native.

*   📄 **`docs/05_USER_FLOWS.md`**
    *   **Contenido:** Caminos paso a paso de los usuarios (comprador y vendedor), modales, navegación y alertas.
    *   **Cuándo leerlo:** Al configurar la navegación (`expo-router`), al encadenar pantallas o para entender en qué orden ocurren los eventos desde la perspectiva del usuario.

*   📄 **`docs/06_USER_STORIES_AND_TASKS.md`**
    *   **Contenido:** Historias de Usuario Ágiles y su desglose en tareas (Backend/Frontend).
    *   **Cuándo leerlo:** Al iniciar un nuevo Sprint o para entender el valor de negocio de una funcionalidad antes de programarla.

*   📄 **`docs/07_VALIDATION.md`**
    *   **Contenido:** Plan de pruebas de QA (Concurrencia) y UAT (Heurísticas y Piloto).
    *   **Cuándo leerlo:** Al escribir tests unitarios o End-to-End para verificar que el código cumple con los criterios de éxito del proyecto.

*   ✅ **`TASKS.md` (En la raíz del proyecto)**
    *   **Contenido:** Checklist ultra-optimizado (por fases) para ahorrar tokens.
    *   **Cuándo leerlo:** **SIEMPRE**, para saber en qué punto del desarrollo estamos. Debes marcar las casillas `[x]` conforme vayas terminando tareas.

---
## Reglas de Git y Control de Versiones
*   **Idioma:** Todos los mensajes de commit (`git commit -m`) **DEBEN estar en ESPAÑOL**.
*   **Convención:** Utilizar *Conventional Commits* traducidos (ej. `feat:`, `fix:`, `docs:`, `chore:`).

---
## Prompt Maestro Sugerido (Para el Usuario)
> *"Actúa como un Desarrollador Senior en React Native y NestJS. Revisa los archivos correspondientes en la carpeta `/docs` según sea necesario y ayúdame a desarrollar [INSERTA LA TAREA]."*
