-- CreateTable
CREATE TABLE "daily_route_metrics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "route" TEXT NOT NULL,
    "fromCode" TEXT NOT NULL,
    "toCode" TEXT NOT NULL,
    "bookings" INTEGER NOT NULL,
    "revenue" DECIMAL(12,2) NOT NULL,
    "avgFare" DECIMAL(10,2) NOT NULL,
    "cancellations" INTEGER NOT NULL DEFAULT 0,
    "loadFactor" DOUBLE PRECISION NOT NULL,
    "isWeekend" BOOLEAN NOT NULL,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "holidayName" TEXT,
    "weatherScore" DOUBLE PRECISION,
    "competitorFare" DECIMAL(10,2),
    "promotionActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "daily_route_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_route_metrics_route_idx" ON "daily_route_metrics"("route");

-- CreateIndex
CREATE INDEX "daily_route_metrics_date_idx" ON "daily_route_metrics"("date");

-- CreateIndex
CREATE INDEX "daily_route_metrics_route_date_idx" ON "daily_route_metrics"("route", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_route_metrics_date_route_key" ON "daily_route_metrics"("date", "route");
