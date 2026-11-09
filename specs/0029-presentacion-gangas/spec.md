# 0029 — Gangas reconocibles

Estado: Verificado (técnico y visual auxiliar; aceptación física separada) | Fecha: 2026-11-09

RF-11/12, RNF-03; US-05; TASKS 5.21. El usuario aprueba la propuesta de ui-ux-pro-max: precio actual primero, anterior tachado a la derecha, ahorro, etiqueta con icono y naranja suave. Fuentes: docs04/07/08/09/10, constitución, 0006 y 0027.

### AC-01 — Precio comprensible

Tarjetas, detalle y Mis ventas comparten orden actual/anterior y texto Ahorras. Solo comparar si ganga activa y precio previo numérico finito mayor al actual válido; no inventar precio previo, ahorro ni descuentos en productos normales. Diferencia calculada en centavos. Texto adaptable sin recortar importes.

### AC-02 — Distinción y consistencia

Gangas con etiqueta Ganga e icono de etiqueta, precio naranja oscuro y fondo naranja suave usando tokens existentes. En feed y detalle el temporizador va separado del distintivo. Tarjetas normales conservan apariencia. Mis ventas finalizadas no dicen Ganga activa. Las reservas conservan su precio fijado y controles.

### AC-03 — Evidencia

Tipos, pruebas de comparación y reservas, exportaciones móviles, revisión visual auxiliar de tres superficies y check-sdd. Texto/contraste comprobados; aceptación de lector y texto ampliado nativos se declara por separado.
