# 0027 — Plan

Script optativo Backend/scripts/seed-demo-gangas.ts con PrismaPg y transacción createMany skipDuplicates. Tres IDs 27000000-0000-4000-8000-000000000001..003 y fotos existentes de brownie/café/torta. Validar vendedor Demo, catálogos y archivos antes de insertar; copiar a nombres de upload fijos sin sobrescribir. Ganga activa como fixture, precio previo original y precio actual mínimo; no cambiar la activación de producción. Origen público obligatorio.

Constitución I/II: AC y tareas antes de código, RF/US/EV explícitos. III: no cambiar reservas/stock previo. IV: sin API nueva ni migración; Prisma transaccional y datos de muestra identificados. V: evidencia de repetición/conservación/HTTP. VI: solo datos solicitados, sin ampliación de producto. Reversión: retirar únicamente IDs nuevos si no tienen reservas; no borrar automáticamente.
