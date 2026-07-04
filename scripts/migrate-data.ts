import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 数据迁移工具
 * 用于在不同环境间迁移数据
 */

async function exportData() {
  console.log('📤 导出数据...\n');

  const users = await prisma.user.findMany();
  const deposits = await prisma.deposit.findMany();
  const skills = await prisma.skill.findMany();
  const skillRuns = await prisma.skillRun.findMany();
  const revenues = await prisma.creatorRevenue.findMany();

  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    users,
    deposits,
    skills,
    skillRuns,
    revenues,
  };

  const filename = `export_${Date.now()}.json`;
  await Bun.write(filename, JSON.stringify(data, null, 2));

  console.log(`✅ 数据已导出到: ${filename}`);
  console.log(`📊 统计:`);
  console.log(`  用户: ${users.length}`);
  console.log(`  充值: ${deposits.length}`);
  console.log(`  技能: ${skills.length}`);
  console.log(`  运行: ${skillRuns.length}`);
  console.log(`  收益: ${revenues.length}`);
}

async function importData(filename: string) {
  console.log(`📥 从 ${filename} 导入数据...\n`);

  const file = Bun.file(filename);
  const data = await file.json();

  console.log('清理现有数据...');
  await prisma.creatorRevenue.deleteMany();
  await prisma.skillRun.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.user.deleteMany();

  console.log('导入用户...');
  for (const user of data.users) {
    await prisma.user.create({ data: user });
  }

  console.log('导入充值记录...');
  for (const deposit of data.deposits) {
    await prisma.deposit.create({ data: deposit });
  }

  console.log('导入技能...');
  for (const skill of data.skills) {
    await prisma.skill.create({ data: skill });
  }

  console.log('导入运行记录...');
  for (const run of data.skillRuns) {
    await prisma.skillRun.create({ data: run });
  }

  console.log('导入收益记录...');
  for (const revenue of data.revenues) {
    await prisma.creatorRevenue.create({ data: revenue });
  }

  console.log(`\n✅ 数据导入完成！`);
  console.log(`📊 统计:`);
  console.log(`  用户: ${data.users.length}`);
  console.log(`  充值: ${data.deposits.length}`);
  console.log(`  技能: ${data.skills.length}`);
  console.log(`  运行: ${data.skillRuns.length}`);
  console.log(`  收益: ${data.revenues.length}`);
}

// CLI
const command = process.argv[2];
const filename = process.argv[3];

async function main() {
  if (command === 'export') {
    await exportData();
  } else if (command === 'import' && filename) {
    await importData(filename);
  } else {
    console.log('用法:');
    console.log('  导出: npx tsx scripts/migrate-data.ts export');
    console.log('  导入: npx tsx scripts/migrate-data.ts import <filename>');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
