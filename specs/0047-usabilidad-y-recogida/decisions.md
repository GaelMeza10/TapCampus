# 0047 — Decisiones

| ID | Pregunta | Impacto | Estado | Resolución / fundamento |
| --- | --- | --- | --- | --- |
| DEC-01 | ¿Qué significa la ubicación general STATIC? | AC-03 | Resuelta | Usuario: Punto de entrega por acordar dentro del campus. Sin presencia prometida en todos los lugares. LIVE mantiene zona concreta. |
| DEC-02 | ¿Dónde y cuándo se reproduce el desplazamiento? | AC-01 | Resuelta como reporte; reproducción pendiente | Usuario: iPhone 14 Pro Max y 13 Pro Max, Expo Go, al cambiar entre tabs. Usuario añade iOS 27.2.1 y SDK 58. La versión exacta de Expo Go y la traza nativa siguen pendientes; no asumir causa. |
| DEC-03 | ¿Qué sustituye Anuncios? | AC-06 | Aprobada 2026-11-22 | Productos, con ayuda de compra/entrega por acuerdo. Matriz en research.md. Cerrar elección antes del cambio global y registrar nueva prueba con estudiantes. |
| DEC-04 | ¿Mantener ventas agotadas varios minutos? | AC-09 | Resuelta para el plan; conserva regla vigente | Retirada inmediata de disponibles conforme a RF-04, aviso de transición y datos conservados. Stock reservado no equivale necesariamente a vendido definitivamente. |
| DEC-05 | ¿Qué lugar promete una reserva si el vendedor cambia de zona? | AC-02 | Aprobada 2026-11-22 | Instantánea para reservas nuevas y rechazo del cambio de zona mientras haya reservas vigentes, bajo el mismo bloqueo. Históricos con referencia actual diferenciada. Cerrar esta ampliación antes de implementar la restricción. |
| DEC-06 | ¿Cómo ampliar categorías sin limitar LIVE a comida? | AC-07 | Aprobada 2026-11-22 | Diez categorías de productos disponibles en ambas modalidades y seis de alimentos LIVE; 26 filas tipadas. Conservar IDs originales y añadir muestras/fotos propias, sin resetear datos. |
| DEC-08 | ¿Quién inicia los servicios locales? | Operación | Resuelta | Usuario ejecuta manualmente npx expo start y npm run start:dev; el agente no los inicia ni detiene procesos del usuario. Pruebas con datos/puertos aislados. |
| DEC-07 | ¿Qué evidencia permite cerrar el bug de tabs? | AC-01, AC-10 | Resuelta | Mismo recorrido medido antes/después en ambos modelos/Expo Go, con y sin scroll y tras teclado/modales. Mock, export y web no sustituyen esa observación. |

El usuario aprobó el plan completo el 2026-11-22 («bien ponte manos a la obra»). DEC-03/05/06 quedan cerradas con las resoluciones descritas. La aprobación no sustituye la aceptación física ni las pruebas de comprensión con estudiantes.

Confirmación final del usuario: «ya esta solucionado» respecto al desplazamiento. Se acepta el reporte funcional, se evita investigación adicional y se conservan como no ejecutadas las métricas formales por modelo.
