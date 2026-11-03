# 0013 — Plan

Actualizar expo a ^58.0.0 y ejecutar expo install --fix según https://expo.dev/blog/how-to-upgrade-to-sdk-58. Revisar APIs retiradas y peers; no usar force ni legacy-peer-deps. Validar expo install --check, expo-doctor, tsc, Jest y exportación web. No hay directorios nativos versionados ni migraciones de datos. La prueba en dispositivo sigue en fase 5. Reversión: recuperar únicamente las versiones previas de package y lock preservando cambios anteriores.

## Constitución

I: spec antes del cambio. II: AC→T→EV. III: sin cambios de inventario. IV: contratos intactos. V: evidencia automatizada y límites nativos explícitos. VI: mantenimiento autorizado del stack.
