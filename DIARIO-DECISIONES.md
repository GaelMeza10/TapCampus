# Diario de decisiones — TapCampus

**Materia:** Aplicaciones Móviles

**Periodo registrado:** 1 de octubre al 22 de noviembre de 2026

Este diario reúne las decisiones principales de producto y desarrollo. Los cambios posteriores de criterio se conservan como parte de la evolución del proyecto. Adoptar una decisión no significa que su aceptación móvil esté terminada.

| Fecha | Decisión | Motivo y alcance |
| --- | --- | --- |
| 1 oct. | Especificar y planificar antes de implementar. | Aclarar reglas y distinguir documentación preparada de comportamiento verificado. |
| 1 oct. | Fijar el precio al confirmar cada reserva. | Una ganga o edición posterior no cambia un apartado existente. |
| 1 oct. | Permitir varias reservas independientes del mismo comprador. | Una acción nueva crea otro apartado; un reintento devuelve el existente sin descontar otra pieza. |
| 1 oct. | Respetar reservas previas después del fin del horario. | Se bloquean nuevos apartados, pero el vendedor puede confirmar los anteriores dentro de sus propios 20 minutos. |
| 1 oct. | Aceptar teléfonos mexicanos con o sin `+52`. | Admitir cualquier región de México y almacenar un formato uniforme. |
| 4 oct. | Respaldar y ensayar las migraciones. | Conservar datos y relaciones; no deducir precios históricos del precio actual. |
| 5 oct. | Usar transacciones y bloqueo de fila para inventario. | Evitar doble reserva o venta de la última pieza. |
| 5 oct. | Gestionar expiraciones con BullMQ/Redis y conciliación. | Recuperarse de reinicios o trabajos perdidos sin depender de la app abierta. |
| 5 oct. | Emitir eventos Socket.io después de confirmar cambios. | Comunicar el estado persistido; la base de datos conserva la autoridad sobre inventario. |
| 5 oct. | Mantener UUID. | Se exploró usar IDs numéricos, pero la propuesta fue cancelada antes de aplicarse. |
| 19 oct. | Mostrar estados en español y ocultar IDs técnicos. | Identificar reservas por producto, fecha y unidad, manteniendo el ID internamente para las acciones. |
| 19 oct.–4 nov. | Agrupar filtros secundarios y mantener visible el cambio de tipo. | La propuesta inicial de un botón de filtros evolucionó para facilitar alternar entre modalidades. |
| 3 nov. | Actualizar Expo a SDK 58. | Alinear dependencias y compatibilidad móvil; un export no equivale a instalación probada. |
| 5 nov. | Volver a red local para las pruebas de esa etapa. | Sustituir los túneles temporales por la conexión solicitada; no implica despliegue fuera de LAN. |
| 5–6 nov. | Dar igual prioridad a comprador y vendedor y pulir el código directamente. | Conservar ambos recorridos y aplicar en Expo los ajustes posteriores al prototipo. |
| 6 nov. | Confirmar antes de apartar. | Abrir o cerrar el diálogo no reserva; el envío ocurre al confirmar. |
| 6–9 nov. | Incorporar búsqueda y Mi cuenta. | Facilitar encontrar publicaciones y separar sesión de gestión de ventas. |
| 9 nov. | Usar pestañas reales para los módulos principales. | Evitar acumular selecciones como pantallas de una pila; reservar la pila para detalle y formularios. |
| 9 nov. | Utilizar «Oferta» en los textos de esa revisión. | Buscar claridad. La dirección posterior recuperó «GANGA» como insignia; los identificadores técnicos permanecieron. |
| 9–10 nov. | Adoptar estilo fotográfico sin carrito ni favoritos. | Mejorar presentación sin ampliar funciones. Los productos sin oferta quedaron sobre blanco en esa etapa. |
| 10 nov. | Editar nombre y teléfono, con correo fijo. | Actualizar el contacto propio conservando la identidad institucional. |
| 10–21 nov. | Mantener errores visibles y conservar borrador y foto. | Permitir corregir campos sin perder información ni buscar errores al final del formulario. |
| 21 nov. | Mantener privada la configuración futura de ofertas. | El comprador ve el precio aplicado; mínimo, modo y umbral futuros pertenecen al vendedor. |
| 21 nov. | Exigir reducción real y permitir cambiar o retirar configuración antes de activar. | Mínimo menor al precio normal; una oferta aplicada no se revierte ni modifica reservas anteriores. |
| 21 nov. | Filtrar contenido en creación y edición. | Aplicar una política local acotada, sin atribuirla a la universidad ni presentarla como moderación mediante IA. |
| 21 nov. | Permitir contacto previo desde detalle LIVE visible. | Sustituye contacto solo después de reservar. Consultar no crea apartado ni expone a quienes solo ven publicaciones. |
| 21–22 nov. | Unificar la dirección visual mediante DESIGN.md. | Compartir componentes y vocabulario; crema, verde profundo e insignia GANGA sustituyen tratamientos anteriores. |
| 21–22 nov. | Incorporar condición Nuevo/Usado en STATIC. | Mostrar datos explícitos sin inventar la condición de registros históricos. |
| 21–22 nov. | Elegir el tipo una sola vez al publicar. | Entrar al formulario correspondiente; edición conserva el tipo del servidor. |
| 21–22 nov. | Permitir liquid glass únicamente en tabs compatibles. | Excepción a la barra sólida anterior, con alternativa accesible y resto de superficies planas. |
| 22 nov. | Utilizar datos de demostración ficticios y aditivos. | Preparar recorridos conservando datos, stock y fechas anteriores. |
| 22 nov. | Sustituir «Anuncios» por «Productos». | Atender la confusión reportada con publicidad. Posteriormente confirmé resultados satisfactorios al evaluar comprensión y uso con participantes registrados. |
| 22 nov. | Permitir entrega por acordar dentro del campus para STATIC. | No afirmar presencia en todas las zonas; LIVE mantiene ubicación concreta. |
| 22 nov. | Guardar el punto de recogida en reservas nuevas. | Conservar el lugar comprometido y bloquear cambios de zona con reservas vigentes; distinguir históricos sin instantánea. |
| 22 nov. | Actualizar el feed ante creación, edición e inicio de disponibilidad. | Mostrar altas sin cambiar de pantalla y recuperar cambios por REST tras reconectar. |
| 22 nov. | Retirar stock cero de disponibles sin borrar reservas. | Agotamiento no significa que todas las unidades se hayan entregado. |
| 22 nov. | Agregar selector de horas/minutos y confirmación de logout. | Reducir entrada manual y salidas involuntarias, conservando la expiración automática de sesión. |
| 22 nov. | Dejar al usuario el arranque de API y Expo. | Respetar servicios manuales y aislar los puertos y datos de verificación. |
| 22 nov. | Preparar APK utilizable fuera de la red local. | Requiere instalador y backend accesible; al corte faltaba acreditar instalación y funcionamiento final. |

## Confirmación posterior de las pruebas

Confirmé que probé satisfactoriamente los recorridos de ambos roles en la versión final, incluyendo cámara, permisos, teclado, accesibilidad y WhatsApp; la expiración con una espera real de 20 minutos; y la comprensión y el uso con participantes registrados. Estas comprobaciones ya no se consideran pendientes en este diario.

El detalle por funcionalidad permanece en sus archivos `decisions.md`, accesibles desde el [índice de funcionalidades](specs/README.md). El relato de la colaboración está en la [bitácora de IA](BITACORA-IA.md).
