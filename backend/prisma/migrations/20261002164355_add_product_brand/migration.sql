-- AlterTable
-- Coluna obrigatória: linhas existentes recebem marca vazia e o default é removido
-- em seguida, para que novos produtos precisem informar a marca.
ALTER TABLE "products" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '';
ALTER TABLE "products" ALTER COLUMN "brand" DROP DEFAULT;
