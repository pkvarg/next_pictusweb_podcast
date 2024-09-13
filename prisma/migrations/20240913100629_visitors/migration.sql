-- CreateTable
CREATE TABLE "VisitorsCounter" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorsCounter_pkey" PRIMARY KEY ("id")
);
