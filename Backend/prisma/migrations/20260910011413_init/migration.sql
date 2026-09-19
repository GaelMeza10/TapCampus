-- CreateEnum
CREATE TYPE "TipoPublicacion" AS ENUM ('EN_VIVO', 'ESTATICA');

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('ACTIVA', 'FINALIZADA_MANUALMENTE', 'EXPIRADA', 'VENDIDA');

-- CreateEnum
CREATE TYPE "ModoActivacionGanga" AS ENUM ('MANUAL', 'PROGRAMADO');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('RESERVADA', 'ACTIVA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "esModerador" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "zonas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoPublicacion" NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoPublicacion" NOT NULL,
    "foto" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendedorId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "zonaId" INTEGER,
    "stockInicial" INTEGER,
    "stockDisponible" INTEGER,
    "horaInicio" TIMESTAMP(3),
    "horaFin" TIMESTAMP(3),
    "gangaHabilitada" BOOLEAN NOT NULL DEFAULT false,
    "gangaActivada" BOOLEAN NOT NULL DEFAULT false,
    "gangaPrecioMinimo" DOUBLE PRECISION,
    "gangaModo" "ModoActivacionGanga",
    "gangaMinutosAntes" INTEGER,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" SERIAL NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'RESERVADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiracion" TIMESTAMP(3) NOT NULL,
    "compradorId" INTEGER NOT NULL,
    "publicacionId" INTEGER NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" SERIAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "publicacionId" INTEGER NOT NULL,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "zonas_nombre_key" ON "zonas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_tipo_key" ON "categorias"("nombre", "tipo");

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "zonas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
