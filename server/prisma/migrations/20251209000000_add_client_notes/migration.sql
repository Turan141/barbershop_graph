-- CreateTable
CREATE TABLE "BarberClientNote" (
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "tags" TEXT,
    "barberId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberClientNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BarberClientNote_barberId_clientId_key" ON "BarberClientNote"("barberId", "clientId");

-- AddForeignKey
ALTER TABLE "BarberClientNote" ADD CONSTRAINT "BarberClientNote_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "BarberProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberClientNote" ADD CONSTRAINT "BarberClientNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
