import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '0x1234567890123456789012345678901234567890' },
    update: {},
    create: {
      id: '0x1234567890123456789012345678901234567890',
      walletAddress: '0x1234567890123456789012345678901234567890',
      credits: 10000n, // 10000 credits = $100
    },
  });

  const user2 = await prisma.user.upsert({
    where: { walletAddress: '0x2345678901234567890123456789012345678901' },
    update: {},
    create: {
      id: '0x2345678901234567890123456789012345678901',
      walletAddress: '0x2345678901234567890123456789012345678901',
      credits: 5000n, // 5000 credits = $50
    },
  });

  console.log('✅ Created test users:', { user1: user1.walletAddress, user2: user2.walletAddress });

  // Create test deposits
  const deposit1 = await prisma.deposit.create({
    data: {
      userId: user1.id,
      chain: 'tron',
      asset: 'USDT',
      amount: 10_000000n, // 10 USDT (6 decimals)
      txHash: 'mock-tx-tron-12345',
      depositAddress: 'TYourMockTronAddress123456',
      status: 'confirmed',
      creditsMinted: 1000n,
      confirmedAt: new Date(),
    },
  });

  const deposit2 = await prisma.deposit.create({
    data: {
      userId: user2.id,
      chain: 'evm-monad',
      asset: 'USDC',
      amount: 50_000000n, // 50 USDC (6 decimals)
      txHash: 'mock-tx-monad-67890',
      status: 'confirmed',
      creditsMinted: 5000n,
      confirmedAt: new Date(),
    },
  });

  console.log('✅ Created test deposits:', { deposit1: deposit1.id, deposit2: deposit2.id });

  // Create ledger entries for deposits
  await prisma.ledgerEntry.create({
    data: {
      userId: user1.id,
      entryType: 'deposit',
      amount: 1000n,
      balanceAfter: 1000n,
      metadata: { depositId: deposit1.id, txHash: deposit1.txHash },
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      userId: user2.id,
      entryType: 'deposit',
      amount: 5000n,
      balanceAfter: 5000n,
      metadata: { depositId: deposit2.id, txHash: deposit2.txHash },
    },
  });

  // Create test skill runs
  const skillRun1 = await prisma.skillRun.create({
    data: {
      userId: user1.id,
      skillId: 0, // VC Research Agent
      creditsCost: 50n,
      runtimeCostUsdCents: 2,
      creatorRevenue: 35n,
      platformFee: 10n,
      status: 'completed',
      inputHash: 'hash-of-input-1',
      outputPreview: 'Monad Labs is a blockchain company...',
      runtimeMs: 1234,
      completedAt: new Date(),
    },
  });

  const skillRun2 = await prisma.skillRun.create({
    data: {
      userId: user1.id,
      skillId: 1, // Market Analyst
      creditsCost: 50n,
      runtimeCostUsdCents: 2,
      creatorRevenue: 35n,
      platformFee: 10n,
      status: 'completed',
      inputHash: 'hash-of-input-2',
      outputPreview: 'Market analysis shows...',
      runtimeMs: 2345,
      completedAt: new Date(),
    },
  });

  console.log('✅ Created test skill runs:', { skillRun1: skillRun1.id, skillRun2: skillRun2.id });

  // Create ledger entries for skill runs
  await prisma.ledgerEntry.create({
    data: {
      userId: user1.id,
      entryType: 'skill_run',
      amount: -50n,
      balanceAfter: 950n,
      metadata: { skillId: 0, skillRunId: skillRun1.id },
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      userId: user1.id,
      entryType: 'skill_run',
      amount: -50n,
      balanceAfter: 900n,
      metadata: { skillId: 1, skillRunId: skillRun2.id },
    },
  });

  // Create creator revenues
  const creatorRevenue1 = await prisma.creatorRevenue.create({
    data: {
      creatorAddress: '0xCreatorAddress1234567890123456789012345',
      skillId: 0,
      totalRuns: 1,
      totalRevenue: 35n,
      withdrawableCredits: 35n,
    },
  });

  const creatorRevenue2 = await prisma.creatorRevenue.create({
    data: {
      creatorAddress: '0xCreatorAddress1234567890123456789012345',
      skillId: 1,
      totalRuns: 1,
      totalRevenue: 35n,
      withdrawableCredits: 35n,
    },
  });

  console.log('✅ Created creator revenues:', { creatorRevenue1: creatorRevenue1.id, creatorRevenue2: creatorRevenue2.id });

  // Update user credits
  await prisma.user.update({
    where: { id: user1.id },
    data: { credits: 900n }, // After 2 skill runs
  });

  console.log('🎉 Seeding complete!');
  console.log('\n📊 Summary:');
  console.log('- Users: 2');
  console.log('- Deposits: 2 (confirmed)');
  console.log('- Skill Runs: 2 (completed)');
  console.log('- Creator Revenues: 2');
  console.log('- Ledger Entries: 4');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
