/*
  Warnings:

  - Added the required column `address` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `closingTime` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offDay` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingTime` to the `SellerProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `storeName` on table `SellerProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "closingTime" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "offDay" TEXT NOT NULL,
ADD COLUMN     "openingTime" TEXT NOT NULL,
ALTER COLUMN "storeName" SET NOT NULL;
