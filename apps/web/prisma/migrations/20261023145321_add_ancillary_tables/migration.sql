-- CreateTable
CREATE TABLE "AncillaryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "AncillaryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AncillaryPurchase" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AncillaryPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AncillaryPurchase_bookingId_idx" ON "AncillaryPurchase"("bookingId");

-- CreateIndex
CREATE INDEX "AncillaryPurchase_itemId_idx" ON "AncillaryPurchase"("itemId");

-- AddForeignKey
ALTER TABLE "AncillaryPurchase" ADD CONSTRAINT "AncillaryPurchase_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AncillaryPurchase" ADD CONSTRAINT "AncillaryPurchase_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AncillaryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
