# 0012 — Publicaciones de demostración

Estado: Verificado (ampliación 2026-11-03) | Evidencia anterior: 2026-10-19

## Contexto y fuentes

El catálogo inicial de 0010 contiene cinco zonas y ocho categorías, pero ninguna publicación. El usuario necesita contenido visible para recorrer el feed móvil y probar los flujos de RF-03 (US-03) y RF-06 (US-04). La base local tenía cero publicaciones y `GET /publications` devolvía `[]`.

## Alcance

- Ampliar la opción de desarrollo de ocho a veinticuatro publicaciones: doce LIVE y doce STATIC, con dos ejemplos nuevos por cada una de las ocho categorías.
- Dar a los dieciséis ejemplos nuevos títulos, descripciones, precios, existencias, zonas e imágenes fotográficas ilustrativas coherentes con una compraventa entre estudiantes.
- Usar un vendedor ya registrado, indicado mediante `SEED_DEMO_SELLER_EMAIL`; requerir `SEED_PUBLIC_BASE_URL` para que el móvil pueda cargar las imágenes.
- Mantener la ejecución normal del seed de 0010 limitada a catálogos. No crear cuentas, contraseñas ni datos reales de contacto.

## Reglas observables

- Las publicaciones de ejemplo se identifican por UUID fijos y título `Demo:`. El texto advierte que producto, imagen y contacto son de prueba.
- LIVE inicia antes de ejecutar el seed, termina siete días después y tiene stock positivo. STATIC no tiene horario ni stock.
- Repetir la opción de demo conserva los datos existentes y no crea duplicados. No restablece stock, horario, estado ni reservas alteradas durante las pruebas. Los ocho UUID anteriores mantienen su contenido.
- Si el vendedor no existe o el origen público de imágenes es inválido, se detiene sin insertar publicaciones.

## Criterios de aceptación

### AC-01 — Feed con contenido

**Dado** un vendedor existente y los catálogos migrados, **cuando** se ejecuta el seed con las dos variables de demo, **entonces** existen doce publicaciones LIVE y doce STATIC asociadas a categorías y zonas válidas. Los ocho anuncios nuevos LIVE y los ocho STATIC nuevos aparecen en sus feeds; los LIVE antiguos pueden haber vencido y se ocultan según RF-04.

### AC-02 — Repetición y compatibilidad

**Dado** el seed ejecutado, **cuando** se repite con las mismas variables, **entonces** no se duplican ni se sobrescriben publicaciones. Sin variables, las pruebas de 0010 mantienen el seed de solo catálogos.

### AC-03 — Imágenes y entradas inválidas

**Dado** el servidor local, **cuando** se consulta una imagen nueva, **entonces** se obtiene un PNG fotográfico local. Con vendedor ausente, URL inválida o recurso faltante, no se insertan publicaciones nuevas.

### AC-04 — Variedad creíble y segura

**Dado** el feed de demostración, **cuando** se revisan las publicaciones nuevas, **entonces** cada categoría tiene dos artículos diferenciados, con precio, descripción, zona y stock coherentes con su tipo. Al menos una LIVE permite probar ganga manual y otra la programada; ninguna crea cuentas ni usa teléfonos inventados.

## Decisiones

DEC-01 resuelta en `decisions.md`: la demo es optativa para preservar la semántica y los ensayos existentes del seed.
