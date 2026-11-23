# Revisión Impeccable — Filtros, detalles y Mi cuenta

Modo Operate. Autoridad: DESIGN.md y refs Filtros, Detalle · Anuncio y Mi cuenta. Pase polish: revisar flujo, jerarquía, recuperación, texto ampliado, iconos, color semántico y fuentes. Capturas reales del bundle auxiliar Expo con fixtures aislados; no mocks HTML de las pantallas.

## Resultado observado
Composición auxiliar aprobada. Filtros usa selección oscura/check/chips envolventes y pie estable; conteos coherentes con datos, sin sustituir publicaciones por vendedores. Anuncio separa foto, atributos, precio y ubicación; WhatsApp permanece al alcance en el pie. LIVE hace explícitos cierre/stock/hora y conserva reserva confirmada. Cuenta reproduce marca/identidad/contacto y deja edición/salida claramente diferenciadas.

Revisados 320/390/430, horizontal y simulación de texto al 150%. Texto largo crece y el contenido se desplaza; el pie mantiene sus acciones. Color acompaña texto en urgencia/Ganga y radio seleccionado. Fuentes Inter/Bricolage empaquetadas; iconos Ionicons y silueta ya existente. No se incorporan nuevos raster a la app: producción usa fotos API, el fixture reutiliza PNG locales de demostración.

## Correcciones de pulido
- Cierre de Filtros se estiraba junto al subtítulo: alineación propia y mínimo 48, manteniendo contorno de referencia.
- Con texto ampliado, el título de detalle necesitaba retirar flex-basis de fila al apilar: altura vuelve a depender de su contenido.
- Teléfono de cuenta sin agrupación: presentación con espacios, editor y API intactos.
- Cantidad del botón Aplicar y de chips accesible como ayuda; retorno de foco al filtro de origen.
- Mensaje de publicación no disponible neutral para anuncio/LIVE; conserva acceso a reservas anteriores.

## Límites y decisiones respetadas
Sin P0/P1 observados en composición auxiliar; validación de gestos/lector/foco nativos y WhatsApp físicos separada. No hay referencia LIVE específica: composición derivada de reglas LIVE de DESIGN.md. No inventar edificios, categorías, condición histórica o reportes; Reportar excluido mientras 0009 siga opcional sin implementar.
