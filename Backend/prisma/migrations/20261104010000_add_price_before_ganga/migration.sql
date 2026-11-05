-- El precio histórico solo se captura en futuras activaciones; no se infiere para filas previas.
ALTER TABLE "publications" ADD COLUMN "price_before_ganga" DECIMAL(10,2);
