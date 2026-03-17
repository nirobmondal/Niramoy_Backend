-- AlterTable
ALTER TABLE "Manufacturer"
DROP COLUMN IF EXISTS "updateAt";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Medicine_manufacturerId_idx" ON "Medicine"("manufacturerId");
