#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  console.log('🔍 Checking database health...\n');

  try {
    // 1. Check connection
    await prisma.$connect();
    console.log('✅ Database connection: OK');

    // 2. Check users table
    const userCount = await prisma.user.count();
    console.log(`✅ Users table: ${userCount} records`);

    // 3. Check ledger entries
    const ledgerCount = await prisma.ledgerEntry.count();
    console.log(`✅ Ledger entries: ${ledgerCount} records`);

    // 4. Check deposits
    const depositCount = await prisma.deposit.count();
    const confirmedDeposits = await prisma.deposit.count({ where: { status: 'confirmed' } });
    console.log(`✅ Deposits: ${depositCount} total, ${confirmedDeposits} confirmed`);

    // 5. Check skill runs
    const runCount = await prisma.skillRun.count();
    const completedRuns = await prisma.skillRun.count({ where: { status: 'completed' } });
    console.log(`✅ Skill runs: ${runCount} total, ${completedRuns} completed`);

    // 6. Check creator revenues
    const revenueCount = await prisma.creatorRevenue.count();
    console.log(`✅ Creator revenues: ${revenueCount} records`);

    // 7. Check withdrawals
    const withdrawalCount = await prisma.withdrawal.count();
    console.log(`✅ Withdrawals: ${withdrawalCount} records`);

    console.log('\n🎉 Database health check passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseHealth();
