/*
  Warnings:

  - A unique constraint covering the columns `[providerTransactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerPaymentIntentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "gatewayData" JSONB,
ADD COLUMN     "providerPaymentIntentId" TEXT,
ADD COLUMN     "providerTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerTransactionId_key" ON "payments"("providerTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerPaymentIntentId_key" ON "payments"("providerPaymentIntentId");
