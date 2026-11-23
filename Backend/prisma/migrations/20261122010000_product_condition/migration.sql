CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'USED');

-- Históricos conservan NULL: no inferir una condición comercial.
ALTER TABLE "publications" ADD COLUMN "condition" "ProductCondition";
ALTER TABLE "publications" ADD CONSTRAINT "publications_condition_static_only"
  CHECK ("type" = 'STATIC' OR "condition" IS NULL);
