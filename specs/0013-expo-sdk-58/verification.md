# 0013 — Verificación

Estado: Verificado | Fecha: 2026-11-03 | Windows, Node 24.13

| AC | Tareas | Evidencia | Resultado |
| --- | --- | --- | --- |
| AC-01 | T-01 | EV-01 instalación limpia, npm ls, expo install --check y expo-doctor | Aprobado |
| AC-02 | T-02 | EV-02 tsc, 10 suites/32 pruebas y exportación Android/iOS/web | Aprobado |
| AC-03 | T-03 | EV-03 documentación activa SDK 58 y check-sdd | Aprobado |

## Comandos y resultados

Desde Frontend: `npm.cmd install --no-audit --no-fund --fetch-retries=0 --fetch-timeout=30000` instaló 1121 paquetes sin force ni legacy-peer-deps. `npm.cmd ls --depth=0` salida 0; Expo 58.0.23, Router 58.0.30, React 19.3.0, React Native 0.88.1 y Jest 30.5.2. `npx.cmd expo install --check`: Dependencies are up to date. `npx.cmd --yes expo-doctor@latest`: 20/20 checks aprobados.

`node node_modules/typescript/bin/tsc --noEmit --incremental false`: salida 0 tras retirar backgroundColor de StatusBar (API eliminada) y usar undefined en dos ListEmptyComponent según los tipos estrictos. `npm.cmd test -- --silent`: 10 suites/32 pruebas aprobadas. `npx.cmd expo export --platform all --clear --output-dir .expo/sdk58-export`: salida 0, bundles Hermes para Android/iOS y web con 10 rutas. Raíz: `node scripts/check-sdd.mjs` y `git diff --check`: salida 0.

## Incidencias y límites

La instalación sobre el árbol SDK 57 falló por un conflicto de peers Router/Symbols. Se conservaron node_modules y el lock intermedio en Backend/.local/sdk57-upgrade-backup y se instaló limpiamente con el mapa oficial, incluidas las dependencias de pruebas. Los accesos de red bloqueados por sandbox se repitieron con permisos ampliados. Se actualizaron AGENTS del frontend, arquitectura, trazabilidad e índice; la evidencia histórica SDK 57 se conserva.

No se generó APK ni se ejecutó en dispositivo: la exportación valida JS/Hermes y recursos, no la compilación o ejecución nativa. Esa aceptación sigue en fases 5 y 6.3; usar un cliente compatible con SDK 58 y regenerar cualquier development build previo.

Limpieza posterior solicitada por el usuario: se retiraron el respaldo temporal sdk57-upgrade-backup y las exportaciones generadas después de verificar SDK 58. La evidencia de resultados se conserva en este documento.

Fuentes: https://expo.dev/blog/how-to-upgrade-to-sdk-58 y https://docs.expo.dev/router/migrate/sdk-57-to-58/.
