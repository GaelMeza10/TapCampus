# 0047 — Investigación y fundamento de las propuestas

Fecha: 2026-11-22. Fuentes primarias consultadas y observación de código/BD. Esta investigación no es una prueba nueva con estudiantes.

## Nombre de la modalidad sin horario

El usuario reportó que las personas interpretaron Anuncios como publicidad de marcas. Es evidencia cualitativa local sin tamaño de muestra registrado; no se inventan porcentajes. La acepción publicitaria está documentada por el [DLE de la RAE](https://dle.rae.es/anuncio), por lo que conservar el término exigiría deshacer una interpretación ya observada.

NN/G explica que las etiquetas aportan indicios sobre el destino y deben describirlo de forma breve y precisa: [Information Scent](https://www.nngroup.com/articles/information-scent/) y [Better Link Labels](https://www.nngroup.com/articles/better-link-labels/). De ello infiero que conviene nombrar lo que el comprador encuentra y explicar la entrega, en lugar de nombrar el formato técnico de la publicación. Estos artículos no establecen un nombre ganador para TapCampus.

El uso comercial de producto resulta familiar: [Mercado Libre México](https://www.mercadolibre.com.mx/l/bienvenido-a-mercado-libre) lo emplea en su búsqueda y [Wallapop](https://about.wallapop.com/) describe la compraventa con ese sustantivo. Esto aporta contexto léxico, no demuestra que sus usuarios o resultados sean equivalentes a los del campus. El [DLE](https://dle.rae.es/producto) también recoge su referencia a cosas producidas.

| Candidato | Evaluación para este contexto |
| --- | --- |
| Productos | Recomendado: corto, describe los bienes, sirve para nuevos/usados y para el historial de vendidos. Necesita ayuda visible para diferenciar la modalidad con horario. |
| Productos en venta | Muy explícito en Explorar; más largo y menos adecuado como nombre de un grupo propio que también conserva vendidos. Alternativa a contrastar. |
| Artículos en venta | Describe la intención; más largo para selector/lector y exige mantener formas contextuales coherentes. No se descarta si los estudiantes lo comprenden mejor. |
| En venta | Breve, pero también describe las ventas LIVE y resulta ambiguo al mostrar historial propio. |
| Mercado / Mercadito | Puede resultar cercano, pero nombra la actividad global de ambas modalidades más que su diferencia. |
| Catálogo | Describe una colección; por sí solo no explica la compra ni la entrega. |
| Anuncios | Se retira como candidato principal por la confusión observada por el usuario. |

**Propuesta:** Ahora en el campus / Productos. Ayudas: vendedor presente, horario y apartado de veinte minutos en la primera; compra y entrega por acuerdo, sin apartado, en la segunda. Creación: Nuevo producto/Publicar producto; detalle: PRODUCTO; estado separado En venta/Vendido. Mantener LIVE/STATIC como códigos internos evita migrar identidades por un cambio de lenguaje.

Validar con cinco estudiantes dos necesidades concretas: encontrar una calculadora/libro para contactar y acordar entrega, y encontrar comida disponible para apartar/recoger ahora. Preguntar qué esperan antes de abrir cada modalidad y registrar elección, explicación y dudas. Si Productos no distingue bien las opciones, revisar conjuntamente etiqueta y ayuda; no aprobarlo solo porque pasó un test de texto. Integrar estas observaciones a la usabilidad de docs07.

## Ubicación y confianza en la recogida

Mostrar el punto en la confirmación y en cada reserva evita exigir que el comprador recuerde información de otra pantalla. Es una aplicación al proyecto de [Recognition Rather Than Recall](https://www.nngroup.com/articles/recognition-and-recall/). La prioridad se apoya además en el problema original de docs01: perder tiempo por no saber dónde está el vendedor.

El usuario ya eligió entrega por acordar dentro del campus para STATIC. Esa elección no proporciona un punto confirmado y no debe aparecer como presencia en todas las zonas. Para LIVE se propone conservar el punto de nuevas reservas y evitar cambiarlo mientras haya compradores en camino; esa ampliación concreta queda en DEC-05.

## Disponibilidad y stock cero

RF-04 ya retira ventas sin unidades; no las elimina físicamente. Parte del stock puede estar apartado y regresar por cancelación/expiración, por lo que Sin unidades disponibles es más preciso que declarar venta definitivamente terminada. Mantener resultados aparentemente disponibles varios minutos perjudicaría la necesidad de compra inmediata. La recomendación es explicar el cambio y conservar reservas/historial, sin un periodo artificial de permanencia.

## Controles nativos y red

[Expo UI Picker de SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/ui/swift-ui/picker/) está incluido en Expo Go; la documentación advierte que wheel/segmented necesitan ancho asignado y pueden colapsar con matchContents. Se verificó también el Stepper del paquete instalado: value, min, max, step y onValueChange, sin instalar módulos. Una duración debe manejar enteros H:M, no hora civil o una fecha.

La [documentación oficial de Socket.io](https://socket.io/docs/v4/delivery-guarantees/) indica que la entrega por defecto no repite desde el servidor lo perdido por un cliente desconectado. Por eso los eventos nuevos deben acompañarse de consulta REST al conectar/volver y de jobs/conciliación para el inicio futuro; escuchar solo stock no detecta una creación. No se promete entrega exactamente una vez ni se utiliza una captura con sockets simulados como evidencia de red real.

## Evidencia local y límites

[baseline.json](evidence/baseline.json): doce categorías en BD y en ambas consultas HTTP, seis por tipo, cinco zonas; seed previo presente. La amplitud comercial aún es reducida. La propuesta de diez familias de productos incorpora Ropa y calzado, Mochilas y bolsos, Deportes y Juegos y videojuegos, además de las seis existentes; LIVE puede usar esas categorías y las seis de alimentos. Son categorías de aplicación propuestas, no oficiales de UABC ni un inventario medido de demanda.

Código confirmado: falta evento de creación; reservas sin ubicación en respuesta; zona obligatoria en esquema; duración manual; logout directo. El desplazamiento es un reporte reiterado del usuario, en dos modelos de iPhone/Expo Go. No se observó su causa en un dispositivo desde las herramientas de esta sesión; esa reproducción y sus mediciones son el primer paso del plan.
