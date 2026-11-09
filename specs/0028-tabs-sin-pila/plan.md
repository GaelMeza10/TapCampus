# Plan

AC-01: mover las cuatro rutas a `(tabs)` sin cambiar URLs; usar Tabs de Expo Router y mantener la barra existente en MarketplaceShell, ocultando la barra automática. Esta elección conserva la apariencia aprobada y el bloqueo local durante logout sin introducir dependencias ni reemplazar controles. NativeTabs implicaría sustituir el diseño y no es necesario para corregir el modelo de navegación.

AC-02: backBehavior initialRoute, Explorar como ruta inicial; conservar las pantallas montadas y navegación navigate entre pestañas. Mantener detalles/edición en el Stack nativo raíz. Al volver de detalle/formulario usar dismissTo: navigate crea otra instancia del grupo en SDK 58, comprobado durante EV-01. Sincronizar cambios del parámetro type en ventas y actualizarlo al tocar su selector, pues ya no se desmonta al cambiar pestañas.

AC-03: conservar Stack.Protected y AuthContext; pruebas de integración con layouts reales y pantallas mínimas que usan la barra real. Actualizar imports de tests y fixture visual; comprobar tsc, Jest y check-sdd.

Constitución I: especificación antes de código. II: RF/US→AC→T→EV explícitos. III: inventario/reservas sin cambios. IV: API, BD, eventos y permisos sin cambios, sin migraciones. V: evidencia técnica reproducible y límites físicos explícitos. VI: corrección acotada, sin cambiar etiquetas ni ampliar producto. Reversión: restaurar organización previa y imports; no requiere revertir datos.
