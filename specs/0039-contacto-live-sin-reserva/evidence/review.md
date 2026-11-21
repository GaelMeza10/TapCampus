# Revisión de contacto — 2026-11-21

Veredicto: aprobado técnico y composición auxiliar; apertura nativa pendiente.

16 capturas finales de pantallas reales a 320×844, 390×844, 430×932 y 844×390; muestra adicional de texto ampliado 1.5. Apartar sigue como acción principal y Contactar por WhatsApp como secundaria LIVE. STATIC conserva su acción principal de contacto. Ambas acciones permanecen visibles, con texto completo y sin desbordamiento horizontal; el contenido se desplaza sin desplazar el pie.

Se inspeccionaron contact-live-320.png, contact-live-844.png, contact-error-390.png, contact-large-text.png y contact-reservation-unavailable.png. Fallo de apertura usa mensaje local y permite volver a pulsar Contactar; no ofrece un reintento que solo recargue el producto. Un detalle 404 conserva la tarjeta autorizada de reserva con WhatsApp y su propio plazo. Compatibilidad sin sellerContact y confirmación pendiente revisadas automáticamente.

El primer intento de Chrome restringido agotó DevTools; ejecución autorizada sin ventana funcionó. La revisión inicial detectó que Expo SDK 58 web navega mediante location, por lo que se sustituyó la interceptación de window.open por el adaptador RNLinking.web real, solo en scripts/visual-fixture.tsx. Import relativo del adaptador evita depender de un subpath no exportado; tipos y bundle auxiliar finales PASS. Las capturas finales se obtuvieron con esa interceptación y no abrieron WhatsApp.

Sin cambios de tokens, fotografías, jerarquía del detalle u otras pantallas. Contraste/estados siguen PrimaryButton compartido. No hay snapshot previo de crítica del target; se realizó revisión directa. Capturas web no acreditan lector de pantalla, teclado, retorno entre apps ni apertura nativa. Sin APK/despliegue/aceptación física.
