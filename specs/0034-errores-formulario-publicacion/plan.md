# 0034 — Plan técnico

Estado: Ejecutado técnicamente; aceptación nativa pendiente | Especificación: `spec.md`

Resultado 2026-11-21: helper de validación completa, estados por origen, aviso persistente fuera del scroll, mensajes locales, navegación tras layout y reintentos específicos implementados. T-01..03 con evidencia técnica aprobada; T-04/T-05 abiertas para teclado/lector/foco nativos. Se ajusta orden de categoría al diseño vigente y se fija título/aviso para cumplir AC-01; spec/decisiones registran el complemento.

Coordinación 2026-11-21: ejecución después del contrato backend/tipos de ofertas 0037 e integración con errores de contenido 0038. Las restricciones heredadas que impiden retirar configuración o pasar de programada a manual se sustituyen por 0037. La autorización de cierre MVP permitió ejecutar el patrón sin pedir otra confirmación; el plan siguiente conserva el diseño técnico aplicado.

## Solución

1. **Estado por origen (AC-02/04).** Separar errores de validación, foto, carga de catálogos, carga de edición y envío. Ampliar las claves actuales a foto/zona/categoría/horario/oferta. Extraer una función local de validación completa que reciba borrador, tipo, publicación original y hora actual; reutilizar los límites existentes sin alterar contratos. Elegir el primer error por orden visual, no por orden de los `if` actuales. Guardar si hubo intento de envío para evitar validación prematura.
2. **Aviso visible (AC-01/04).** Reutilizar tokens y presentación de InlineMessage en un contenedor de esta pantalla entre encabezado y ScrollView. Resumen breve para validación y texto específico para errores generales; acción para ir al campo, sin enumerar todos los errores en el encabezado. Quitar el mensaje global del final. Mantener la zona desplazable flexible y botón de envío accesible. En pantallas bajas/texto ampliado, ajustar composición o permitir desplazar el encabezado preservando el aviso visible; verificar que no consuma todo el espacio disponible.
3. **Mensajes locales (AC-02/04).** Reutilizar `CustomInput.error`. Para foto, selectores, horario y oferta, añadir mensaje junto al control con texto/icono y borde de error cuando corresponda. Extraer un componente pequeño solo si hay repetición real; evitar cambiar globalmente todos los botones o inputs. En hojas, mantener el error en la superficie activa; error de catálogo con reintento específico, y error de oferta junto a precio/minutos o a su regla de edición.
4. **Navegación al error (AC-03/05).** Ampliar registro `fieldPositions` y referencias a controles no textuales. Una solicitud de navegación pendiente se ejecuta tras render/layout de errores para no usar posiciones antiguas. Desplazar al wrapper completo dejando margen para el mensaje; enfocar un único objetivo, sin abrir hojas. Reusar mecanismos existentes de foco/accesibilidad según plataforma; confirmar APIs con la documentación Expo SDK 58 antes de codificar. Evitar temporizadores arbitrarios. Respetar teclado y Reduce Motion, sin animar el salto cuando esté activado.
5. **Ciclo de corrección (AC-03/04).** Revalidar campos con error y dependencias ya expuestas: precio ↔ oferta; inicio/fin ↔ programación; tipo ↔ categoría. El aviso de validación se deriva de los errores vigentes. Un cambio de título no oculta un fallo de subida o catálogos. Limpiar errores de acción al reintentar esa acción o completarla, según su origen. Al cerrar una hoja, conservar errores relevantes en su control del formulario.
6. **Guardado y compatibilidad (AC-04/05).** Conservar upload/patch, bloqueo durante envío y retorno a Mis ventas. Aplicar contrato 0037 de modos/retirada antes de activar y precio/configuración inmutables tras activación; integrar code/fields de 0038 conservando cada AC. Validar antes de upload/save y mantener borrador en fallos. No reenviar una publicación sin acción expresa ni afirmar idempotencia nueva en la API.

## Archivos previstos

- `Frontend/src/app/publication/edit.tsx`: validación, estados, aviso, mensajes y navegación.
- Un auxiliar local de validación/presentación en `Frontend/src/lib/` si permite aislar reglas y probarlas sin duplicación.
- `Frontend/src/components/CustomInput.tsx` o componente local de mensaje solo si falta asociación accesible; preservar consumidores actuales.
- `Frontend/__tests__/publication-form.test.tsx`, fixture y verificador visual existentes: casos observables.
- docs04 y este expediente: documentar el patrón después de implementarlo/verificarlo.

## Riesgos y alternativas

Mover únicamente el mensaje al inicio del ScrollView todavía permite que quede fuera de pantalla. Un modal interrumpe la corrección y oculta el contexto. Un toast temporal puede pasar inadvertido. Por eso se elige aviso compacto visible y mensajes por campo. Riesgos principales: posiciones que cambian al insertar mensajes, foco tras cerrar hojas, poco alto disponible con teclado y anuncios duplicados. Se resuelven con layout actualizado, foco único y pruebas nativas. No cambiar los componentes compartidos salvo necesidad demostrada.

## Constitución, contratos y reversión

| Principio | Aplicación |
| --- | --- |
| I | Spec y plan antes del código; entrega actual solo documental. |
| II | RF-03/06/11 → US-03/04/05 → AC-01..05 → T-01..05 → EV-01..05. |
| III | Servidor sigue siendo autoridad de stock, precio y horario; sin cambios de reservas. |
| IV | API, permisos y datos expuestos intactos; sin migraciones. |
| V | Evidencia prevista queda Pendiente hasta ejecutarse; aceptación nativa separada. |
| VI | Corrección acotada al formulario y sus hojas; preservar cambios existentes ajenos. |

Reversión: revertir únicamente los cambios futuros de presentación/validación de este feature; no hay datos que recuperar.

## Verificación prevista

Desde Frontend: `npx.cmd tsc --noEmit`; `npm.cmd test -- --silent --runTestsByPath __tests__/publication-form.test.tsx __tests__/components.test.tsx`; ampliar a la suite completa tras cambios compartidos. Ejecutar el verificador visual existente con escenarios de formulario inválido, permiso denegado y fallo de red a 320/375/430 y horizontal; añadir escenarios que falten. Exportar Android/iOS para comprobar compatibilidad. En raíz: `node scripts/check-sdd.mjs` y `git diff --check`.

En emulador/dispositivo iOS/Android: intentar publicar desde principio/mitad/final del formulario, con teclado abierto, lector de pantalla, texto ampliado y movimiento reducido. Comprobar aviso visible, error completo y foco real en campos/controles, incluidas hojas. Registrar plataforma y límites. No ejecutar migraciones ni usar datos reales para crear publicaciones de prueba.
