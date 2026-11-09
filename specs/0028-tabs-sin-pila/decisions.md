# Decisiones

- DEC-01 resuelta (2026-11-09): el fallo está en el navegador, no en la llamada de la barra, que ya usa navigate. Usar Tabs reales con la barra actual; Stack queda para jerarquía.
- DEC-02 resuelta: Atrás desde pestañas regresa a Explorar (initialRoute), evitando historial por cada selección. Las rutas públicas conservan sus nombres.
- DEC-03 resuelta por prueba con SDK 58: navigate desde Stack secundario añade otro grupo; dismissTo regresa al existente. Se usa al ir a reservas desde detalle y a ventas tras guardar. Entre pestañas se conserva navigate. Sin destino previo, dismissTo reemplaza la pantalla según contrato Expo.
