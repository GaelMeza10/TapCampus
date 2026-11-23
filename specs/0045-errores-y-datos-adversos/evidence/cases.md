# Casos adversos ejecutados

| Caso | Recorrido | Resultado |
| --- | --- | --- |
| E01 | Acceso: correo inválido conserva error al editar otro campo | PASS |
| E02 | Acceso: contraseña vacía junto al campo | PASS |
| E03 | Acceso: Revisa tu conexión | PASS |
| E04 | Acceso: tardó demasiado | PASS |
| E05 | Acceso: El servidor no está disponible | PASS |
| E06 | Acceso: Correo o contraseña incorrectos. | PASS |
| E07 | Acceso: Hay demasiados intentos | PASS |
| E08 | Registro: nombre de espacios no envía y tiene ayuda | PASS |
| E09 | Registro: dominio, teléfono y contraseña inválidos | PASS |
| E10 | Registro: duplicado sin perder datos | PASS |
| E11 | Explorar: offline y recuperación | PASS |
| E12 | Explorar: búsqueda sin resultados con símbolos | PASS |
| E13 | Filtros: conteos fallidos no inventan ceros | PASS |
| E14 | Carga fallida y recuperación: /sales | PASS |
| E15 | Carga fallida y recuperación: /reservations | PASS |
| E16 | Carga fallida y recuperación: /account | PASS |
| E17 | Cuenta: nombre y teléfono inválidos junto al campo | PASS |
| E18 | Cuenta: fallo de guardado conserva borrador y error al editar | PASS |
| E19 | Ventas: acción fallida visible y sin éxito falso | PASS |
| E20 | Ventas: acción fallida visible y sin éxito falso | PASS |
| E21 | Ventas: acción fallida visible y sin éxito falso | PASS |
| E22 | Ventas: acción fallida visible y sin éxito falso | PASS |
| E23 | Ventas: acción fallida visible y sin éxito falso | PASS |
| E24 | Reservas: cancelación fallida permanece visible abajo | PASS |
| E25 | Detalle: offline muestra carga fallida y no publicación eliminada | PASS |
| E26 | Detalle: 404 confirmado conserva acceso a reservas | PASS |
| E27 | Apartado: conflicto 409 sin confirmar éxito | PASS |
| E28 | WhatsApp: fallo visible sin reservar | PASS |
| E29 | Crear LIVE vacío aplica errores correctos | PASS |
| E30 | Crear STATIC vacío aplica errores correctos | PASS |
| E31 | Formulario: precio/stock inválidos y corrección sin pérdida | PASS |
| E32 | Formulario: rechazo por contenido y borrador preservado | PASS |
| E33 | Formulario: fallo de guardado conserva foto y borrador | PASS |
| E34 | Formulario: catálogo fallido zona y reintento | PASS |
| E35 | Formulario: catálogo fallido categoría y reintento | PASS |
| E36 | Estado no feliz: reservation-pending | PASS |
| E37 | Estado no feliz: reservation-empty | PASS |
| E38 | Estado no feliz: sales-empty | PASS |
| L-feed-320 | Texto de 200 caracteres y precio máximo | PASS |
| L-sales-320 | Texto de 200 caracteres y precio máximo | PASS |
| L-reservations-320 | Texto de 200 caracteres y precio máximo | PASS |
| L-account-320 | Texto de 200 caracteres y precio máximo | PASS |
| L-detail-320 | Texto de 200 caracteres y precio máximo | PASS |
| L-feed-390 | Texto de 200 caracteres y precio máximo | PASS |
| L-sales-390 | Texto de 200 caracteres y precio máximo | PASS |
| L-reservations-390 | Texto de 200 caracteres y precio máximo | PASS |
| L-account-390 | Texto de 200 caracteres y precio máximo | PASS |
| L-detail-390 | Texto de 200 caracteres y precio máximo | PASS |
| L-feed-430 | Texto de 200 caracteres y precio máximo | PASS |
| L-sales-430 | Texto de 200 caracteres y precio máximo | PASS |
| L-reservations-430 | Texto de 200 caracteres y precio máximo | PASS |
| L-account-430 | Texto de 200 caracteres y precio máximo | PASS |
| L-detail-430 | Texto de 200 caracteres y precio máximo | PASS |
| E39 | Imagen corrupta usa alternativa sin errores JavaScript | PASS |
| E40 | Registro offline conserva datos y explica conexión | PASS |
| E41 | Precio superior al máximo muestra error local sin enviar | PASS |
| E42 | Oferta igual al precio normal se rechaza en su hoja | PASS |
| E43 | Permiso HTTP 403 se explica sin texto técnico | PASS |
| E44 | Mensaje largo de negocio conserva altura acotada y lectura propia | PASS |
| E45 | Errores con texto ampliado permanecen visibles y legibles | PASS |
| E46 | Carga parcial de reservas no inventa que están vacías | PASS |

Evidencia: fixture web en pantallas reales, con API aislada. Permisos nativos simulados en Jest; hardware no acreditado.
