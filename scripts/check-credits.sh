#!/bin/bash
# 多链余额检查工具

set -e

echo "🔍 检查多链 Credits 余额"
echo "======================================"

# 检查数据库连接
if ! npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
  echo "❌ 数据库未连接"
  echo "请配置 DATABASE_URL 并运行 npx prisma migrate dev"
  exit 1
fi

echo "✅ 数据库已连接"
echo ""

# 查询用户余额
echo "📊 用户余额统计："
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      walletAddress: true,
      creditBalance: true,
    },
    take: 10,
  });

  console.log('地址                                      余额');
  console.log('----------------------------------------------------------');
  users.forEach(u => {
    const addr = u.walletAddress.slice(0, 6) + '...' + u.walletAddress.slice(-4);
    console.log(\`\${addr.padEnd(16)} \${u.creditBalance.toString().padStart(10)} Credits\`);
  });
}

main().finally(() => prisma.\$disconnect());
"

echo ""
echo "💰 充值统计（按链分组）："
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deposits = await prisma.deposit.groupBy({
    by: ['chain'],
    _sum: { amount: true },
    _count: true,
  });

  console.log('链                数量      总金额');
  console.log('----------------------------------------------------------');
  deposits.forEach(d => {
    console.log(\`\${d.chain.padEnd(16)} \${String(d._count).padStart(6)} \${String(d._sum.amount).padStart(12)}\`);
  });
}

main().finally(() => prisma.\$disconnect());
"

echo ""
echo "✅ 检查完成"
