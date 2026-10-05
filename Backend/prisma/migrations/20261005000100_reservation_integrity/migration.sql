BEGIN;
-- Nunca usar publications.price como backfill. Para reservas previas, la ruta
-- segura carga valores comprobados antes de imponer NOT NULL.
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "unit_price" DECIMAL(10,2);
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "idempotency_key" UUID;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "reservations" WHERE "unit_price" IS NULL) THEN
    RAISE EXCEPTION 'Reservas sin precio histórico comprobado: ejecutar backfill con evidencia antes de migrar';
  END IF;
END $$;
-- Claves sintéticas solo para filas históricas, no representan solicitudes nuevas.
UPDATE "reservations" SET "idempotency_key" = gen_random_uuid() WHERE "idempotency_key" IS NULL;
ALTER TABLE "reservations" ALTER COLUMN "unit_price" SET NOT NULL;
ALTER TABLE "reservations" ALTER COLUMN "idempotency_key" SET NOT NULL;
ALTER TABLE "publications" ADD CONSTRAINT "publications_current_stock_nonnegative"
  CHECK ("current_stock" IS NULL OR "current_stock" >= 0);
CREATE UNIQUE INDEX "reservations_buyer_id_idempotency_key_key" ON "reservations"("buyer_id", "idempotency_key");
CREATE INDEX "reservations_status_reserved_at_idx" ON "reservations"("status", "reserved_at");
COMMIT;
