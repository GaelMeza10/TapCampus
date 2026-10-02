## Guía de desarrollo de aplicaciones móviles

# 1. El problema: empezar programando demasiado pronto

Una práctica común al iniciar un proyecto es hacer algo como:

> "Vamos a crear una app de gimnasio. Primero hagamos el login."

El problema es que todavía no hemos definido:

- ¿Quién usará la aplicación?
- ¿Qué problema resuelve?
- ¿Qué funciones son indispensables?
- ¿Qué datos necesitamos?
- ¿Qué debe ocurrir cuando algo falla?
- ¿Cómo sabemos que una funcionalidad está terminada?

Cuando comenzamos directamente con código, es muy fácil terminar con:

- pantallas que no se necesitan;
- funcionalidades incompletas;
- modelos de datos mal diseñados;
- cambios constantes;
- código que funciona, pero no resuelve correctamente el problema.

La idea de **SDD** es cambiar el orden.

En lugar de:

```text
Idea → Código → Corregir requisitos → Más código
```

trabajaremos así:

```text
Idea
↓
Problema
↓
Especificación
↓
Diseño
↓
Tareas
↓
Implementación
↓
Validación
```

---

# 2. Desarrollo guiado por especificaciones

**SDD significa Spec-Driven Development**, o desarrollo guiado por especificaciones.

La idea principal es sencilla:

> Antes de implementar una funcionalidad, debemos describir con suficiente claridad qué debe hacer.

Una **spec** es una descripción estructurada del comportamiento esperado del sistema.

No tiene que ser un documento enorme.

Puede ser un archivo Markdown pequeño como:

```text
specs/
  autenticacion.md
  perfil.md
  productos.md
  favoritos.md
```

Cada archivo explica una parte concreta del sistema.

---

# 3. Documentación suficiente

SDD no busca crear documentos de 100 páginas antes de programar.

Queremos especificaciones:

- pequeñas;
- claras;
- comprobables;
- actualizables;
- cercanas al código.

Una buena regla es:

> Una spec debe tener suficiente información para que otro desarrollador pueda implementar la funcionalidad sin tener que adivinar qué quisimos decir.

---

# 4. Aplicación en el proyecto final

En sus proyectos trabajarán con varias piezas:

- React Native / Expo;
- navegación;
- estado global;
- formularios;
- APIs;
- almacenamiento;
- cámara;
- sensores;
- ubicación;
- notificaciones;
- backend, cuando corresponda.

Si comenzamos a desarrollar sin especificar el comportamiento, los errores de diseño se multiplican.

SDD nos ayuda a:

1. pensar antes de programar;
2. dividir problemas grandes;
3. trabajar mejor en equipo;
4. repartir tareas;
5. revisar avances;
6. utilizar IA de manera más controlada.

---

# 5. La regla principal

Antes de programar una funcionalidad debemos poder responder:

```text
¿Qué debe hacer?
¿Quién la utiliza?
¿Qué información necesita?
¿Qué resultado produce?
¿Qué puede salir mal?
¿Cómo sabremos que funciona correctamente?
```

Si no podemos responder estas preguntas, todavía no estamos listos para implementarla.

---

# 6. Paso 1: definir el problema

No comiencen describiendo tecnologías.

Eviten:

> "Vamos a hacer una aplicación con React Native, Firebase y una API."

Eso describe herramientas, no el problema.

Empiecen con algo similar a:

> "Los estudiantes tienen dificultad para organizar las fechas de entrega de diferentes materias y necesitan una aplicación móvil que concentre tareas, fechas límite y recordatorios."

La tecnología se decide después.

---

# 7. Paso 2: identificar al usuario

Definan quién utilizará el sistema.

Ejemplo:

```md
## Usuario principal

Estudiante universitario que cursa varias materias y necesita organizar tareas y fechas de entrega desde su teléfono.
```

No intenten resolver problemas para "todo el mundo".

Mientras más claro sea el usuario, más fácil será diseñar la aplicación.

---

# 8. Paso 3: definir el MVP

**MVP = Minimum Viable Product**.

Es la versión mínima del sistema que ya resuelve el problema principal.

Supongamos que queremos una aplicación para organizar tareas.

Podríamos imaginar:

- login;
- perfil;
- calendario;
- materias;
- tareas;
- recordatorios;
- chat;
- estadísticas;
- modo oscuro;
- sincronización;
- widgets;
- IA.

Pero probablemente no necesitamos todo eso.

Un MVP podría ser:

```text
1. Crear materias.
2. Registrar tareas.
3. Asignar fecha límite.
4. Ver tareas pendientes.
5. Marcar tareas como completadas.
```

Primero hacemos que eso funcione bien.

Después agregamos extras.

---

# 9. Paso 4: dividir el proyecto en features

Una **feature** es una funcionalidad concreta del sistema.

Ejemplo:

```text
Proyecto: Organizador académico

Features:

F01 - Crear materia
F02 - Listar materias
F03 - Crear tarea
F04 - Editar tarea
F05 - Marcar tarea como completada
F06 - Mostrar tareas pendientes
F07 - Enviar recordatorio
```

Cada feature puede tener su propia especificación.

---

# 10. Paso 5: escribir una spec

Una estructura sencilla puede ser:

```md
# Feature: Crear tarea

## Objetivo

Permitir que el usuario registre una nueva tarea asociada a una materia.

## Actor

Estudiante.

## Precondiciones

- Debe existir al menos una materia registrada.

## Datos de entrada

- título;
- descripción opcional;
- materia;
- fecha límite.

## Flujo principal

1. El usuario presiona "Nueva tarea".
2. El sistema muestra el formulario.
3. El usuario introduce los datos.
4. El usuario presiona "Guardar".
5. El sistema valida los datos.
6. La tarea se almacena.
7. El usuario regresa a la lista de tareas.

## Validaciones

- El título es obligatorio.
- La materia es obligatoria.
- La fecha límite no puede estar vacía.

## Resultado esperado

La nueva tarea aparece en la lista de tareas pendientes.

## Casos de error

- Si faltan datos obligatorios, mostrar un mensaje.
- Si ocurre un error al guardar, informar al usuario.

## Criterios de aceptación

- [ ] El usuario puede abrir el formulario.
- [ ] El usuario puede capturar los datos.
- [ ] No se puede guardar una tarea sin título.
- [ ] La tarea queda almacenada.
- [ ] La tarea aparece en la lista.
```

---

# 11. Los criterios de aceptación son muy importantes

Los criterios de aceptación responden:

> ¿Cómo demostramos que la funcionalidad está terminada?

Un criterio debe ser verificable.

Mal criterio:

```text
La pantalla debe verse bien.
```

Mejor:

```text
El botón "Guardar" debe permanecer deshabilitado mientras el título esté vacío.
```

Otro ejemplo:

```text
Cuando el usuario guarde correctamente una tarea, debe regresar a la pantalla de tareas y la nueva tarea debe aparecer en la lista.
```

---

# 12. Pensar también en casos negativos

No diseñen únicamente el caso perfecto.

Pregunten:

- ¿Qué pasa si no hay Internet?
- ¿Qué pasa si la API falla?
- ¿Qué pasa si el usuario deja un campo vacío?
- ¿Qué pasa si niega el permiso de cámara?
- ¿Qué pasa si niega la ubicación?
- ¿Qué pasa si no existen datos?

Ejemplo:

```md
## Estados de la pantalla

La pantalla debe contemplar:

- cargando;
- datos disponibles;
- lista vacía;
- error de conexión.
```

Esto evita muchas aplicaciones que solamente funcionan durante la demostración ideal.

---

# 13. Paso 6: pensar en las pantallas

Después de definir las features, podemos comenzar a pensar en UI.

Ejemplo:

```text
Home
│
├── Materias
│   ├── Lista de materias
│   └── Nueva materia
│
└── Tareas
    ├── Lista de tareas
    ├── Detalle de tarea
    └── Nueva tarea
```

Todavía no necesitamos implementar.

Primero queremos entender el flujo.

---

# 14. Paso 7: definir navegación

Ahora podemos describir las rutas.

Ejemplo:

```text
RootStack
│
├── Home
├── Subjects
├── SubjectDetail
├── Tasks
├── TaskDetail
└── TaskForm
```

Preguntas importantes:

- ¿Desde dónde llega el usuario?
- ¿A dónde puede ir?
- ¿Qué información debe viajar entre pantallas?

Ejemplo:

```text
Subjects
   ↓ subjectId
SubjectDetail
```

---

# 15. Paso 8: definir los datos

Antes de crear estados, stores o bases de datos, describimos las entidades.

Ejemplo:

```ts
Subject {
  id
  name
  teacher
}
```

```ts
Task {
  id
  title
  description
  dueDate
  completed
  subjectId
}
```

Después podemos decidir si esos datos viven en:

- estado local;
- Zustand;
- Redux;
- SQLite;
- AsyncStorage;
- Firebase;
- API REST.

Primero entendemos los datos.

Después elegimos la herramienta.

---

# 16. Paso 9: convertir la spec en tareas

Una spec grande debe dividirse en tareas pequeñas.

Por ejemplo:

```md
# Feature: Crear tarea

## Tasks

- [ ] Crear pantalla `TaskFormScreen`.
- [ ] Crear componente `TaskForm`.
- [ ] Crear campos del formulario.
- [ ] Agregar validaciones.
- [ ] Crear función para guardar tareas.
- [ ] Mostrar errores.
- [ ] Navegar a la lista después de guardar.
- [ ] Probar criterios de aceptación.
```

Cada tarea debería poder completarse aproximadamente de forma independiente.

---

# 17. Flujo completo de trabajo

Para cada feature:

```text
1. Escribir spec
        ↓
2. Revisar comportamiento
        ↓
3. Diseñar datos
        ↓
4. Diseñar navegación/UI
        ↓
5. Crear tareas
        ↓
6. Implementar
        ↓
7. Validar criterios de aceptación
        ↓
8. Actualizar la spec si algo cambió
```

---

# 18. ¿Dónde entra la IA?

La IA puede ser muy útil dentro de este flujo.

Por ejemplo pueden pedir:

> "Analiza esta especificación y dime si existen casos límite que no estoy considerando."

O:

> "Convierte esta especificación en tareas pequeñas para implementar la feature con React Native."

O:

> "Implementa únicamente la tarea 3 siguiendo esta especificación."

Lo que no recomiendo es:

> "Hazme una aplicación completa de gimnasio."

Porque la IA tendrá que inventar:

- requisitos;
- arquitectura;
- datos;
- navegación;
- comportamiento;
- decisiones de UI.

Y ustedes perderán el control del proyecto.

---

# 19. Ejemplo de prompt útil para IA

```text
Estoy desarrollando una aplicación móvil con React Native y Expo.

Quiero implementar la siguiente feature:

[PEGAR SPEC]

Analiza la especificación antes de generar código.

1. Identifica ambigüedades.
2. Identifica casos límite.
3. Propón una lista de tareas.
4. No implementes todavía.
```

Después:

```text
Implementa únicamente la tarea 1.

Respeta la especificación original y no agregues funcionalidades nuevas.
```

---

# 20. Una posible estructura del repositorio

```text
project/
│
├── specs/
│   ├── 00-project.md
│   ├── 01-navigation.md
│   ├── 02-data-model.md
│   │
│   └── features/
│       ├── F01-create-subject.md
│       ├── F02-list-subjects.md
│       ├── F03-create-task.md
│       └── F04-complete-task.md
│
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── stores/
│   ├── services/
│   └── types/
│
└── README.md
```

---

# 21. Archivo `00-project.md`

Cada equipo puede comenzar creando:

```md
# Proyecto final

## Nombre

Nombre provisional del proyecto.

## Problema

¿Qué problema queremos resolver?

## Usuario objetivo

¿Quién utilizará la aplicación?

## Propuesta de solución

¿Cómo ayudará la aplicación?

## MVP

- Feature 1
- Feature 2
- Feature 3
- Feature 4

## Funcionalidades futuras

- Feature opcional 1
- Feature opcional 2
```

---

# 22. Primera actividad para los equipos

Antes de comenzar a programar, cada equipo debe crear:

```text
specs/
  00-project.md
```

El archivo debe contener:

1. nombre provisional;
2. problema;
3. usuario objetivo;
4. propuesta de solución;
5. entre 4 y 8 funcionalidades del MVP;
6. funcionalidades opcionales.

---

# 23. Segunda actividad

Seleccionen **una sola feature** del MVP.

Preferiblemente una funcionalidad central.

Ejemplo:

```text
F01 - Registrar gasto
```

Creen:

```text
specs/features/F01-register-expense.md
```

Debe incluir:

```md
# Feature

## Objetivo

## Actor

## Precondiciones

## Datos de entrada

## Flujo principal

## Validaciones

## Casos de error

## Resultado esperado

## Criterios de aceptación
```

---

# 24. Tercera actividad

Cuando la spec esté lista:

1. intercámbienla con otro equipo;
2. el otro equipo debe leerla;
3. debe intentar responder:

```text
¿Entiendo qué hay que construir?

¿Hay algo ambiguo?

¿Falta algún caso?

¿Podría implementar esta funcionalidad sin preguntarle al equipo qué quiso decir?
```

Si la respuesta es no, la spec todavía necesita trabajo.

---

# 25. Cuarta actividad

Después de revisar la spec:

```text
Spec
↓
Lista de tareas
↓
Implementación
```

Por ejemplo:

```md
## Tasks

- [ ] Crear modelo `Expense`.
- [ ] Crear formulario.
- [ ] Agregar validación.
- [ ] Crear store.
- [ ] Guardar gasto.
- [ ] Crear lista de gastos.
- [ ] Probar criterios de aceptación.
```

Ahora sí podemos comenzar a programar.

---

# 26. Regla para el proyecto final

Durante el proyecto:

> No implementen una feature importante si no existe primero una spec.

La spec puede cambiar.

Eso es normal.

Lo importante es que el código y la especificación permanezcan alineados.

---

# 27. Qué quiero revisar como profesor

Cuando revise sus proyectos no solamente voy a preguntar:

> "¿Funciona?"

También quiero poder revisar:

```text
Problema
↓
Especificación
↓
Implementación
↓
Resultado
```

Quiero que puedan explicar:

- por qué existe cada feature;
- qué requisito resuelve;
- qué decisiones tomaron;
- qué casos consideraron;
- cómo comprobaron que funciona.

---

# 28. Ejemplo de progreso sano

Semana inicial:

```text
Problema definido
+
MVP definido
+
4-8 features
+
1-2 specs completas
```

Después:

```text
Spec → código → prueba
```

No:

```text
50 pantallas
+
arquitectura enorme
+
muchas librerías
+
ninguna funcionalidad terminada
```

---

# 29. Idea principal para recordar

SDD no significa:

> "Documentar todo antes de hacer algo."

Significa:

> "Entender y especificar suficientemente una funcionalidad antes de implementarla."

La especificación guía al código.

No al revés.

---
