CREATE TYPE "PickupMode" AS ENUM ('SPECIFIC_ZONE', 'ARRANGED');
ALTER TABLE "publications" ADD COLUMN "pickup_mode" "PickupMode" NOT NULL DEFAULT 'SPECIFIC_ZONE',
  ADD COLUMN "availability_announced_for" TIMESTAMP(3),
  ALTER COLUMN "zone_id" DROP NOT NULL;
ALTER TABLE "publications" ADD CONSTRAINT "publications_pickup_location_check" CHECK (
  (pickup_mode = 'SPECIFIC_ZONE' AND zone_id IS NOT NULL) OR
  (type = 'STATIC' AND pickup_mode = 'ARRANGED' AND zone_id IS NULL)
);
-- Existing starts have already been discoverable; do not announce the whole history on rollout.
UPDATE "publications" SET "availability_announced_for" = "start_time"
WHERE type = 'LIVE' AND start_time <= CURRENT_TIMESTAMP;
ALTER TABLE "reservations" ADD COLUMN "pickup_zone_id" INTEGER,
  ADD COLUMN "pickup_zone_name" TEXT;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_pickup_snapshot_check" CHECK (
  (pickup_zone_id IS NULL AND pickup_zone_name IS NULL) OR
  (pickup_zone_id IS NOT NULL AND pickup_zone_name IS NOT NULL)
);
