# Política inicial de contenido — v1

Fecha: 2026-11-21 | Estado: implementada; 62 pruebas de política y contratos HTTP/SQL aprobados, aceptación móvil separada

La categoría fue indicada por el usuario («groserías, términos despectivos») y la selección exacta se realiza con el análisis que delegó. Es una regla interna de TapCampus; no es una lista oficial de la UABC ni una conclusión jurídica sobre productos. No se bloquean automáticamente términos no enumerados ni todas sus derivaciones.

## Lista exacta normalizada

| Grupo | Entradas |
| --- | --- |
| Groserías | chingar, chinga, chingada, chingado, chingadas, chingados, pinche, pinches, mierda, mierdas, carajo, puta, putas, puto, putos |
| Insultos directos | pendejo, pendeja, pendejos, pendejas, cabron, cabrona, cabrones, cabronas, culero, culera, culeros, culeras, idiota, idiotas, imbecil, imbeciles, estupido, estupida, estupidos, estupidas |
| Insultos homofóbicos explícitos | maricon, maricones, joto, jotos |
| Sustancias del alcance inicial | cocaina, metanfetamina, marihuana |
| Objetos del alcance inicial | arma de fuego, armas de fuego, municion, municiones |

## Normalización y fronteras

Aplicar NFKC, minúsculas y equivalencia de á/é/í/ó/ú/ü con a/e/i/o/u/u, tanto en forma compuesta como descompuesta; preservar ñ. Tokenizar por secuencias de letras/números Unicode. Espacios, saltos de línea y puntuación separan tokens: «ARMA-de-FUEGO» coincide con la frase; «computadora» no contiene un token «puta». No borrar símbolos interiores para reconstruir palabras partidas: «m4rihuana» y «ma.rihuana» no están cubiertas por v1. No usar stemming, detección contextual ni inferencias sobre personas.

La normalización sirve solo para comparar; no reescribe el título/descripción enviado. Analizar campos por separado.

## Casos negativos obligatorios

- Computadora usada, Computación, Disputa académica, Putois (nombre de una obra): no son tokens iguales a los términos enumerados.
- Bata negra, Libro de historia indígena, Grupo gay universitario: no se bloquean negro/negra/indígena/gay por identidad o color.
- Coca-Cola, Pistola de silicón, Heroína de una novela, Jota musical: no se incluyen coca/pistola/heroína/jota por ambigüedad.
- Arma en título y de fuego en descripción no forma una frase bloqueada entre campos.
- Acentos y signos: «¡PÉNDEJO!» y «imbécil» sí coinciden; no confundir ñ con n.

Esta política tiene límites: puede bloquear una cita educativa que contenga exactamente un insulto, y puede no detectar evasiones ortográficas. Para el catálogo de ventas se prioriza una lista pequeña y predecible. Ampliar solo con casos reales y revisión de falsos positivos; no crear una lista enorme de palabras potencialmente ofensivas sin contexto.
