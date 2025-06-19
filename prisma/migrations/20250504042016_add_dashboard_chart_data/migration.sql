-- CreateTable
CREATE TABLE "DashboardChartData" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardChartData_pkey" PRIMARY KEY ("id")
);
