# 0014 — Plan

1. Configurar un túnel de API temporal en .local con la infraestructura de Expo ya instalada; guardar solo origen público en Frontend/.env. No versionar URLs efímeras ni credenciales.
2. Axios timeout 15000 y mensaje de timeout. El feed existente ya finaliza loading en finally y muestra error/reintento.
3. Resolver solo imágenes con pathname /uploads/UUID.(png|jpg|webp) en API_BASE_URL al consumir publicaciones (lista, detalle, propias y resultados de guardado); no reescribir enlaces arbitrarios ni la BD.
4. Probar fallo/reintento del feed, normalización y contratos; comprobar HTTP y Socket.io reales por HTTPS.

## Constitución

I: intención antes de código. II: AC→T→EV. III: no reintentos automáticos de reservas. IV: mismo JWT y privacidad, túnel temporal autorizado. V: separar evidencia de servicio y dispositivo. VI: corrección de conectividad, sin ampliación de negocio. Reversión: retirar configuración local de túnel y restaurar origen LAN; sin migraciones.
