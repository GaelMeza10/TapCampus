# Plan

AC-01: SectionList virtualizada con grupos derivados de presentReservations; mantiene etiquetas estables, sin estado duplicado ni cambios al servicio. Comparadores de fechas toleran datos inválidos.

AC-02/03: componente buyer-reservation-card exclusivo de Mis reservas; conservar reservation-card usado por detalle y vendedor. Reutilizar PublicationPhoto, AppText y PrimaryButton. Estado auxiliar específico con esqueleto estático, vacío/error y recuperación existentes. Sin dependencias ni activos raster nuevos.

AC-04: heredar sistema 0031; modo Operate. Fotos y precio guían, bloque de tiempo verde y registros de historial discretos. Ajuste de foto/acciones a ancho estrecho o fontScale alto; sin altura fija de texto. Usar fixture aislado con escenarios de reservas, sin tocar API ni cuentas del usuario. Pruebas existentes más regresión de grupos/estados/contacto y capturas auxiliares; bundles móviles y check-sdd.

Constitución I: spec antes de código. II: RF/US→AC→T→EV. III: stock, idempotencia y servidor temporal intactos; canActOnReservation sigue controlando acciones. IV: sin contratos, migraciones ni permisos nuevos. V: evidencia ejecutada antes de cierre técnico. VI: alcance de comprador acotado; hardware no certificado mediante web. Reversión: retirar componente y agrupación, restaurando composición anterior sin efectos en datos.
