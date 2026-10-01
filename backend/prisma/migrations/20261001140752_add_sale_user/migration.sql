/*
  Warnings:

  - Added the required column `user_id` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "sales_user_id_idx" ON "sales"("user_id");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
