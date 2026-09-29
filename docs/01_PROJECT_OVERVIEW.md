# Visión General del Proyecto (TapCampus)

## 1. Planteamiento del Problema
En los campus universitarios, los estudiantes que venden comida, snacks o materiales escolares sufren de una mala organización logística. La comunicación ocurre fragmentada por WhatsApp, Facebook o Instagram, generando incertidumbre sobre la ubicación exacta del vendedor, el stock restante y los horarios. Esto ocasiona pérdida de tiempo para los compradores, quienes suelen llegar cuando el producto ya se agotó.

## 2. Solución: TapCampus
TapCampus es una aplicación móvil nativa que centraliza y organiza el mercado informal del campus mediante un sistema de publicaciones con inventario reactivo en tiempo real y filtrado por zonas.

## 3. Objetivos del Proyecto
* **Objetivo General:** Facilitar la compra, venta y reserva de artículos y alimentos dentro del campus universitario.
* **Módulo de ventas en vivo:** Inventario reactivo en tiempo real (WebSockets).
* **Motor de reservas:** Tolerancia de 20 minutos controlada de forma estricta por el servidor.
* **Autenticación restringida:** Comunidad universitaria exclusiva usando dominio `@uabc.edu.mx`.
* **Filtros rápidos:** Búsqueda por facultad, edificio o áreas específicas (catálogo manual, sin GPS).
* **Mecanismo "Precio Ganga":** Estrategia de innovación donde el precio baja instantáneamente al mínimo, activado por el vendedor para incentivar la venta urgente.

## 4. Stakeholders (Partes Interesadas)
* **Vendedores (Estudiantes):** Requieren crear publicaciones rápidas, actualizar stock de forma sencilla (incluso si la venta es física) y tener control sobre cuándo aplicar remates ("Ganga").
* **Compradores (Estudiantes):** Requieren información precisa sobre qué se vende, en dónde está el vendedor y si quedan piezas disponibles, con la capacidad de apartar temporalmente (20 min) mientras caminan hacia el punto de entrega.
* **Moderadores:** Usuarios regulares con un flag especial que pueden revisar publicaciones reportadas por la comunidad y decidir si ocultarlas permanentemente.
* **Institución Educativa (UABC):** Aunque indirecto, se benefician del orden y la reducción de spam en grupos de estudiantes, apoyados por el requisito de validación de correo.
