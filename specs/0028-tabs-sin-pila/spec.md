# 0028 — Pestañas principales sin apilamiento

Estado: Verificado (técnico; aceptación física separada) | Fecha: 2026-11-09

RF-01/02/05c/06/07; RNF-03; US-01/02/04/05c/06; TASKS 5.20. Corrección solicitada por el usuario sobre la navegación de 0026. La barra usa navigate, pero sus destinos eran hermanos en Stack. Fuentes: docs03/04/05/07/08/09/10, constitución y documentación Expo SDK 58.

### AC-01 — Destinos del mismo nivel

Explorar, Reservas, Mis ventas y Cuenta pertenecen a un navegador Tabs protegido. Cambiar repetidamente y tocar el activo no añade entradas al Stack raíz ni duplica destinos. Se mantienen URLs, barra, selección y bloqueo durante logout.

### AC-02 — Estado y regreso

Cambiar pestañas conserva el estado local de las visitadas. Atrás desde una pestaña distinta regresa a Explorar, sin recorrer todas las pestañas visitadas. Detalles y formularios siguen en Stack; Atrás vuelve a la pestaña de origen. Ir a reservas desde detalle o ventas tras guardar reutiliza el navegador existente. El tipo guardado selecciona la vista de ventas correspondiente.

### AC-03 — Sesión y comprobaciones

Enlaces profundos a los cuatro destinos requieren sesión; logout/401 retiran todo el grupo protegido. Pruebas con router real en memoria verifican estructura, cambios repetidos, estado, regreso y accesos secundarios. Tipos, suite frontend y check-sdd aprobados. La aceptación de gestos físicos queda separada de esta verificación técnica.
