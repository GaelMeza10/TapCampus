/*
  Warnings:

  - The values [ACTIVA] on the enum `EstadoReserva` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoReserva_new" AS ENUM ('RESERVADA', 'VENDIDA', 'CANCELADA', 'EXPIRADA');
ALTER TABLE "public"."reservas" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "reservas" ALTER COLUMN "estado" TYPE "EstadoReserva_new" USING ("estado"::text::"EstadoReserva_new");
ALTER TYPE "EstadoReserva" RENAME TO "EstadoReserva_old";
ALTER TYPE "EstadoReserva_new" RENAME TO "EstadoReserva";
DROP TYPE "public"."EstadoReserva_old";
ALTER TABLE "reservas" ALTER COLUMN "estado" SET DEFAULT 'RESERVADA';
COMMIT;
