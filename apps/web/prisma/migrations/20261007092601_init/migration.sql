-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "fromCode" TEXT NOT NULL,
    "fromCity" TEXT NOT NULL,
    "toCode" TEXT NOT NULL,
    "toCity" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "seatsAvailable" INTEGER NOT NULL,
    "aircraft" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "passengerEmail" TEXT NOT NULL,
    "passengerPhone" TEXT NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'in',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flight_flightNumber_key" ON "Flight"("flightNumber");

-- CreateIndex
CREATE INDEX "Flight_fromCode_toCode_departureTime_idx" ON "Flight"("fromCode", "toCode", "departureTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_pnr_key" ON "Booking"("pnr");

-- CreateIndex
CREATE INDEX "Booking_passengerEmail_idx" ON "Booking"("passengerEmail");

-- CreateIndex
CREATE INDEX "Booking_pnr_idx" ON "Booking"("pnr");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
