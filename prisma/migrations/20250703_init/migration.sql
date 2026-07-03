-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE "SkillRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE "WithdrawalStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet_address" TEXT NOT NULL,
    "credits" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "entry_type" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "balance_after" BIGINT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "deposit_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "credits_minted" BIGINT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "skill_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "credits_cost" BIGINT NOT NULL,
    "runtime_cost_usd_cents" INTEGER,
    "creator_revenue_credits" BIGINT,
    "platform_fee_credits" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input_hash" TEXT,
    "output_preview" TEXT,
    "runtime_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "skill_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "creator_revenues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator_address" TEXT NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "total_revenue_credits" BIGINT NOT NULL DEFAULT 0,
    "withdrawable_credits" BIGINT NOT NULL DEFAULT 0,
    "last_withdrawal_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "creator_address" TEXT,
    "chain" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "credits_burned" BIGINT NOT NULL,
    "amount_sent" BIGINT NOT NULL,
    "destination_address" TEXT NOT NULL,
    "tx_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fee_credits" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "ledger_entries_user_id_created_at_idx" ON "ledger_entries"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_tx_hash_key" ON "deposits"("tx_hash");
CREATE INDEX "deposits_user_id_created_at_idx" ON "deposits"("user_id", "created_at");
CREATE INDEX "deposits_status_idx" ON "deposits"("status");

-- CreateIndex
CREATE INDEX "skill_runs_user_id_skill_id_created_at_idx" ON "skill_runs"("user_id", "skill_id", "created_at");
CREATE INDEX "skill_runs_status_idx" ON "skill_runs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "creator_revenues_creator_address_skill_id_key" ON "creator_revenues"("creator_address", "skill_id");
CREATE INDEX "creator_revenues_creator_address_idx" ON "creator_revenues"("creator_address");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_created_at_idx" ON "withdrawals"("user_id", "created_at");
CREATE INDEX "withdrawals_creator_address_created_at_idx" ON "withdrawals"("creator_address", "created_at");
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");
