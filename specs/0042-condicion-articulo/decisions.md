# Decisiones
- DEC-01 resuelta: alcance STATIC, coherente con DESIGN.md y refs; LIVE no lleva condición.
- DEC-02 resuelta: enum NEW/USED nullable sin default para conservar históricos. No inferir condición por título/descripción ni aplicar backfill arbitrario.
- DEC-03 resuelta: crear exige condición; PATCH omite para conservar y admite actualizaciones ajenas de históricos. Frontend exige selección al guardar anuncio histórico.
- DEC-04 resuelta: condición pública sin nuevos permisos/eventos; misma actualización protegida por bloqueo y propiedad existentes.
