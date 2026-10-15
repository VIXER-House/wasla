-- Admin area: account blocking + admin action log
ALTER TABLE "Account" ADD COLUMN "blockedAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN "blockedReason" TEXT;

CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "accountId" TEXT,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminLog_accountId_createdAt_idx" ON "AdminLog"("accountId", "createdAt");
CREATE INDEX "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");
