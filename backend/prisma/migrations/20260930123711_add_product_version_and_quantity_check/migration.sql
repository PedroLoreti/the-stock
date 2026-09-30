-- AlterTable
ALTER TABLE "products" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- Rede de segurança: o saldo nunca pode ficar negativo, mesmo em caso de bug ou corrida.
ALTER TABLE "products" ADD CONSTRAINT "products_quantity_non_negative" CHECK ("quantity" >= 0);
