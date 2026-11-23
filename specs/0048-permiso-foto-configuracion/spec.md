# 0048 — Permiso de foto bloqueado y acceso a Configuración

Estado: En verificación | Fecha: 2026-11-22

## Contexto y fuentes

- Necesidad / actor: vendedor que niega el permiso de cámara o fotos al añadir la foto de una publicación.
- Requisitos `RF/RNF` e historias `US`: RF-03, RF-06; US-03, US-04.
- Comportamiento actual observado: un permiso negado muestra «Permite usar la cámara…» o «Permite acceder a tus fotos…». Si el sistema ya no puede volver a preguntar (Android tras dos negativas o «No volver a preguntar»), el mensaje no indica cómo conceder el permiso y pulsar de nuevo no muestra diálogo.

## Alcance

- Incluye: mensaje específico para permiso bloqueado (`canAskAgain === false`), botón «Abrir configuración» y aviso si no se puede abrir.
- Excluye: cambios de API, subida o validación de imagen.
- Dependencias: `expo-image-picker` (PermissionResponse.canAskAgain) y `Linking.openSettings` de React Native.

## Reglas y contratos observables

- Permiso negado con `canAskAgain` distinto de `false`: se conserva el mensaje anterior y no hay botón.
- Permiso negado con `canAskAgain === false`: mensaje bajo la foto que indica activarlo en Configuración y botón secundario «Abrir configuración».
- Si abrir Configuración falla: desaparece el botón y se indica abrir Configuración manualmente.
- En todos los casos se conserva el borrador y no se abre cámara/galería ni se sube imagen.

## Criterios de aceptación

### AC-01 — Permiso bloqueado ofrece Configuración

**Dado** un permiso de cámara o fotos negado sin poder volver a preguntar, **cuando** el vendedor elige Tomar foto o Elegir de galería, **entonces** ve un mensaje que menciona Configuración y un botón que abre los ajustes de la aplicación, conservando el borrador.

### AC-02 — Fallo al abrir y permiso aún solicitable

**Dado** que abrir Configuración falla, **cuando** el vendedor pulsa el botón, **entonces** ve un aviso para abrirla manualmente y el botón desaparece. **Dado** un permiso negado que aún puede pedirse, **entonces** no aparece el botón.

## Decisiones abiertas

- Ninguna.
