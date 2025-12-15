-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalculatorSession" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "calculatorId" UUID NOT NULL,
    "calculatorKey" TEXT NOT NULL,
    "calculatorGroup" TEXT,
    "calculatorVersion" TEXT,
    "embedName" TEXT,
    "publicId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "CalculatorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalculatorSessionData" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "completedAt" TIMESTAMPTZ(3),

    CONSTRAINT "CalculatorSessionData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_email_key" ON "public"."Subscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorSession_publicId_key" ON "public"."CalculatorSession"("publicId");

-- CreateIndex
CREATE INDEX "CalculatorSession_sessionId_idx" ON "public"."CalculatorSession"("sessionId");

-- CreateIndex
CREATE INDEX "CalculatorSession_calculatorId_idx" ON "public"."CalculatorSession"("calculatorId");

-- CreateIndex
CREATE INDEX "CalculatorSession_calculatorKey_idx" ON "public"."CalculatorSession"("calculatorKey");

-- CreateIndex
CREATE INDEX "CalculatorSession_calculatorKey_calculatorGroup_idx" ON "public"."CalculatorSession"("calculatorKey", "calculatorGroup");

-- CreateIndex
CREATE INDEX "CalculatorSession_embedName_idx" ON "public"."CalculatorSession"("embedName");

-- CreateIndex
CREATE INDEX "CalculatorSession_publicId_idx" ON "public"."CalculatorSession"("publicId");

-- CreateIndex
CREATE INDEX "CalculatorSession_createdAt_idx" ON "public"."CalculatorSession"("createdAt");

-- CreateIndex
CREATE INDEX "CalculatorSession_updatedAt_idx" ON "public"."CalculatorSession"("updatedAt");

-- CreateIndex
CREATE INDEX "CalculatorSession_deletedAt_idx" ON "public"."CalculatorSession"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorSession_sessionId_calculatorId_key" ON "public"."CalculatorSession"("sessionId", "calculatorId");

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorSessionData_sessionId_key" ON "public"."CalculatorSessionData"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."CalculatorSessionData" ADD CONSTRAINT "CalculatorSessionData_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CalculatorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
