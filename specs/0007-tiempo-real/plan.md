# 0007 — Plan técnico

Estado: **En implementación; backend fases 2/3 verificado, móvil pendiente**

## Diseño

RealtimeModule exporta gateway a productores sin importar esos módulos. Emisión room feed solo después del commit y sin evento para intento fallido/repetido. E2E usa dos socket.io-client reales y comparación SQL de payloads; desconectar/reconectar y consultar REST demuestra soporte backend, no listeners móviles. Cierre de proceso habilita shutdown hooks y cierra workers/colas.

- Crear gateway Socket.io con room global para el feed. Tipar y documentar nombres/payloads de `docs/03_ARCHITECTURE.md`; serializar `newPrice` como cadena decimal para no perder precisión monetaria.
- Emitir `stock_updated`, `publication_expired` y `ganga_activated` después del commit de sus transacciones. Un job repetido que no cambia estado no emite una transición adicional. En errores de emisión, la API de lectura permite recuperar estado; no considerar al socket como fuente de verdad.
- El cliente escucha mientras el feed está activo y reconsulta `GET /publications` al recibir cambios; el servidor aplica visibilidad y orden, incluida la salida de artículos agotados/finalizados. Al reconectar, cambiar filtro o volver del fondo, reemplaza datos locales. Evitar suscripciones duplicadas y limpiar listeners al salir.
- Aplicar `FlatList` y tokens de `docs/04_UI_UX_GUIDELINES.md`; el temporizador local solo representa el tiempo restante hasta `end_time`, sin decidir ventas o reservas.
- Seguridad: los eventos públicos no contienen teléfonos, compradores ni tokens. La reserva y las acciones siguen protegidas por REST/JWT; este canal distribuye únicamente estado público.

## Constitución

| Principio | Cumplimiento |
| --- | --- |
| I–II | RNF-02 y RF relacionados → AC-01..05 → T → EV. |
| III | Eventos reflejan transacciones confirmadas, no gobiernan stock. |
| IV | Tres nombres y payloads exactos, sin datos de contacto. |
| V | Pruebas de dos clientes, desconexión, reintentos y evento fallido. |
| VI | Sin chat ni push; cambio de eventos actualiza specs consumidoras. |

## Orden y pruebas

Depende de 0001 reservas, 0003 publicaciones y 0006 ganga para productores de eventos; gateway y cliente pueden prepararse antes. Probar con dos clientes Socket.io y BD de prueba: operación confirmada, rechazada, job repetido y reconexión con datos de API.
