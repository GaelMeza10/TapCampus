/*
  Warnings:

  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publicaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reportes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zonas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('LIVE', 'STATIC');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('ACTIVE', 'FINISHED', 'HIDDEN_BY_REPORTS');

-- CreateEnum
CREATE TYPE "GangaActivationMode" AS ENUM ('MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "publicaciones" DROP CONSTRAINT "publicaciones_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "publicaciones" DROP CONSTRAINT "publicaciones_vendedorId_fkey";

-- DropForeignKey
ALTER TABLE "publicaciones" DROP CONSTRAINT "publicaciones_zonaId_fkey";

-- DropForeignKey
ALTER TABLE "reportes" DROP CONSTRAINT "reportes_publicacionId_fkey";

-- DropForeignKey
ALTER TABLE "reportes" DROP CONSTRAINT "reportes_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_compradorId_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_publicacionId_fkey";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "publicaciones";

-- DropTable
DROP TABLE "reportes";

-- DropTable
DROP TABLE "reservas";

-- DropTable
DROP TABLE "usuarios";

-- DropTable
DROP TABLE "zonas";

-- DropEnum
DROP TYPE "EstadoPublicacion";

-- DropEnum
DROP TYPE "EstadoReserva";

-- DropEnum
DROP TYPE "ModoActivacionGanga";

-- DropEnum
DROP TYPE "TipoPublicacion";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "is_moderator" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PublicationType" NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" UUID NOT NULL,
    "type" "PublicationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seller_id" UUID NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "initial_stock" INTEGER,
    "current_stock" INTEGER,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "is_ganga_active" BOOLEAN NOT NULL DEFAULT false,
    "ganga_min_price" DECIMAL(10,2),
    "ganga_activation_mode" "GangaActivationMode",
    "ganga_minutes_before" INTEGER,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "buyer_id" UUID NOT NULL,
    "publication_id" UUID NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporter_id" UUID NOT NULL,
    "publication_id" UUID NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_type_key" ON "categories"("name", "type");

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
