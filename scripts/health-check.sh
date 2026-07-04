#!/bin/bash
# 健康检查脚本 - 检查所有服务状态

set -e

echo "🏥 Orchor 系统健康检查"
echo "======================================"

# 检查 Node 版本
NODE_VERSION=$(node -v)
echo "✓ Node.js: $NODE_VERSION"

# 检查 npm 版本
NPM_VERSION=$(npm -v)
echo "✓ npm: $NPM_VERSION"

# 检查依赖安装
if [ -d "node_modules" ]; then
  echo "✓ node_modules 已安装"
else
  echo "❌ node_modules 未安装 - 运行 npm install"
  exit 1
fi

# 检查 .next 构建
if [ -d ".next" ]; then
  echo "✓ .next 构建目录存在"
else
  echo "⚠️  .next 未构建 - 运行 npm run build"
fi

# 检查环境变量
if [ -f ".env.local" ]; then
  echo "✓ .env.local 存在"

  if grep -q "DATABASE_URL" .env.local; then
    echo "  ✓ DATABASE_URL 已配置"
  else
    echo "  ❌ DATABASE_URL 未配置"
  fi

  if grep -q "OPENAI_API_KEY" .env.local; then
    echo "  ✓ OPENAI_API_KEY 已配置"
  else
    echo "  ⚠️  OPENAI_API_KEY 未配置（可选）"
  fi
else
  echo "⚠️  .env.local 不存在 - 从 .env.example 复制"
fi

# 检查数据库连接
echo ""
echo "📊 数据库检查："
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
  echo "✓ 数据库连接成功"

  # 检查表是否存在
  TABLES=$(npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null | grep -c "User\|Skill\|Deposit" || echo "0")
  if [ "$TABLES" -gt 0 ]; then
    echo "✓ 数据库表已创建"
  else
    echo "⚠️  数据库表未创建 - 运行 npx prisma migrate dev"
  fi
else
  echo "❌ 数据库连接失败"
fi

# 检查本地服务
echo ""
echo "🌐 本地服务检查："
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "✓ Next.js 服务运行中 (http://localhost:3000)"
else
  echo "❌ Next.js 服务未运行 - 运行 npm run dev"
fi

# 检查 Prisma Client
echo ""
echo "🔧 Prisma Client:"
if [ -d "node_modules/.prisma/client" ]; then
  echo "✓ Prisma Client 已生成"
else
  echo "❌ Prisma Client 未生成 - 运行 npx prisma generate"
fi

echo ""
echo "======================================"
echo "健康检查完成"
