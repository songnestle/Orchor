import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 初始化测试数据脚本
 * 用于本地开发和演示
 */
async function main() {
  console.log('🌱 开始初始化测试数据...\n');

  // 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { walletAddress: '0x1234567890123456789012345678901234567890' },
    update: {},
    create: {
      walletAddress: '0x1234567890123456789012345678901234567890',
      creditBalance: 1000,
    },
  });
  console.log('✓ 创建测试用户:', testUser.walletAddress);

  // 创建测试充值记录
  const deposits = await Promise.all([
    prisma.deposit.create({
      data: {
        userId: testUser.id,
        chain: 'tron',
        asset: 'USDT',
        amount: 100,
        address: 'TXXXtest123',
        txHash: '0xtest1',
        status: 'confirmed',
      },
    }),
    prisma.deposit.create({
      data: {
        userId: testUser.id,
        chain: 'evm-base',
        asset: 'USDC',
        amount: 50,
        address: '0xbasetest',
        txHash: '0xtest2',
        status: 'confirmed',
      },
    }),
  ]);
  console.log(`✓ 创建 ${deposits.length} 条测试充值记录`);

  // 创建测试技能
  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        creatorAddress: testUser.walletAddress,
        title: 'Web3 Contract Analyzer',
        description: 'Analyze smart contracts for vulnerabilities',
        category: 'security',
        rarity: 'Epic',
        energyCost: 5,
        status: 'active',
      },
    }),
    prisma.skill.create({
      data: {
        creatorAddress: testUser.walletAddress,
        title: 'Token Price Oracle',
        description: 'Real-time crypto price data',
        category: 'data',
        rarity: 'Rare',
        energyCost: 3,
        status: 'active',
      },
    }),
  ]);
  console.log(`✓ 创建 ${skills.length} 个测试技能`);

  // 创建测试技能运行记录
  const runs = await Promise.all([
    prisma.skillRun.create({
      data: {
        skillId: skills[0].id,
        userId: testUser.id,
        input: 'Test contract address',
        output: 'No vulnerabilities found',
        creditCost: 5,
        status: 'success',
      },
    }),
    prisma.skillRun.create({
      data: {
        skillId: skills[1].id,
        userId: testUser.id,
        input: 'ETH/USDT',
        output: 'Price: $3,245.67',
        creditCost: 3,
        status: 'success',
      },
    }),
  ]);
  console.log(`✓ 创建 ${runs.length} 条测试运行记录`);

  // 创建创作者收益记录
  const revenue = await prisma.creatorRevenue.create({
    data: {
      creatorAddress: testUser.walletAddress,
      amount: 560, // 70% of 800 credits from 100 runs
      platformFee: 160, // 20%
      treasuryFee: 80, // 10%
      source: 'skill_runs',
    },
  });
  console.log('✓ 创建测试收益记录:', revenue.amount, 'Credits');

  console.log('\n✅ 测试数据初始化完成！');
  console.log('\n📊 数据概览:');
  console.log(`  用户: ${await prisma.user.count()}`);
  console.log(`  充值: ${await prisma.deposit.count()}`);
  console.log(`  技能: ${await prisma.skill.count()}`);
  console.log(`  运行: ${await prisma.skillRun.count()}`);
  console.log(`  收益: ${await prisma.creatorRevenue.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
