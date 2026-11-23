# TapCampus — aplicación móvil

React Native 0.88 / Expo SDK 58. Rutas en `src/app`, tema en `src/theme.js` y componentes compartidos en `src/components`. Diseño vigente en [DESIGN.md](../DESIGN.md).

Desde esta carpeta:

```powershell
npm ci
npm start
```

Configura EXPO_PUBLIC_API_URL en `.env` con un origen de API alcanzable desde el teléfono. No uses localhost desde un dispositivo físico. Cámara y galería requieren sus permisos. El cliente conserva borradores y muestra errores; el servidor decide stock, precio y plazo.

Consulta [la guía de entrega](../docs/11_DELIVERY_GUIDE.md) para preparar cuentas y datos. El script de reinicio de la plantilla Expo se retiró porque no corresponde a esta aplicación.

```powershell
node node_modules/typescript/bin/tsc --noEmit
npm run check:design
npm test
```

La exportación no sustituye aceptación en teléfono. [Evidencia de casos adversos](../specs/0045-errores-y-datos-adversos/verification.md).

`npm test` ejecuta primero la comprobación de `DESIGN.md`. Detecta diferencias de tokens/nombres, materiales fuera de las tabs y patrones anteriores; las pruebas de navegación y de presentación comparan los recorridos y la misma publicación entre pantallas. Un cambio deliberado del sistema requiere actualizar su autoridad en DESIGN.md, los componentes compartidos y sus comprobaciones conjuntamente.

La comprobación incluye fuentes CSS y el índice local de Impeccable cuando existe. [Revisión de consistencia y evidencia](../docs/design/consistency-review.md): alcance comprobado, correcciones y aceptación nativa pendiente.
