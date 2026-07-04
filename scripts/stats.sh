#!/bin/bash
# 技能卡统计分析工具

set -e

echo "📊 Orchor 技能卡统计分析"
echo "======================================"

# 检查 Next.js 是否在运行
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "⚠️  本地服务未运行"
  echo "请先运行: npm run dev"
  exit 1
fi

echo "✅ 本地服务运行中"
echo ""

# 统计技能卡数量
echo "📦 技能卡总览："
cat > /tmp/stats.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalSkills = await prisma.skill.count();
  const activeSkills = await prisma.skill.count({
    where: { status: 'active' }
  });

  console.log(`总技能卡数: ${totalSkills}`);
  console.log(`活跃技能卡: ${activeSkills}`);

  // 按稀有度统计
  const byRarity = await prisma.skill.groupBy({
    by: ['rarity'],
    _count: true,
  });

  console.log('\n按稀有度分布:');
  byRarity.forEach(r => {
    console.log(`  ${r.rarity}: ${r._count}`);
  });

  // Top 5 热门技能
  const topSkills = await prisma.skillRun.groupBy({
    by: ['skillId'],
    _count: true,
    orderBy: { _count: { skillId: 'desc' } },
    take: 5,
  });

  console.log('\n🔥 Top 5 热门技能 (按运行次数):');
  for (const skill of topSkills) {
    const skillData = await prisma.skill.findUnique({
      where: { id: skill.skillId },
      select: { title: true }
    });
    console.log(`  ${skillData?.title}: ${skill._count} 次`);
  }
}

main().finally(() => prisma.$disconnect());
EOF

npx tsx /tmp/stats.ts
rm /tmp/stats.ts

echo ""
echo "💰 收益统计："
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const revenue = await prisma.creatorRevenue.aggregate({
    _sum: { amount: true },
  });

  const platformFee = await prisma.creatorRevenue.aggregate({
    _sum: { platformFee: true },
  });

  console.log(\`总收益: \${revenue._sum.amount || 0} Credits\`);
  console.log(\`平台手续费: \${platformFee._sum.platformFee || 0} Credits\`);
}

main().finally(() => prisma.\$disconnect());
"

echo ""
echo "✅ 统计完成"
