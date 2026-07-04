#!/bin/bash
# 清理脚本 - 清理构建产物和缓存

set -e

echo "🧹 Orchor 清理工具"
echo "======================================"

# 清理 .next
if [ -d ".next" ]; then
  echo "清理 .next 目录..."
  rm -rf .next
  echo "✓ .next 已删除"
fi

# 清理 node_modules/.cache
if [ -d "node_modules/.cache" ]; then
  echo "清理 node_modules/.cache..."
  rm -rf node_modules/.cache
  echo "✓ node_modules/.cache 已删除"
fi

# 清理 Prisma Client
if [ -d "node_modules/.prisma" ]; then
  echo "清理 Prisma Client..."
  rm -rf node_modules/.prisma
  echo "✓ Prisma Client 已删除"
fi

# 可选：清理 node_modules
read -p "是否删除 node_modules? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "清理 node_modules..."
  rm -rf node_modules
  echo "✓ node_modules 已删除"
  echo "请运行 npm install 重新安装"
fi

# 可选：清理数据库
read -p "是否重置数据库? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "重置数据库..."
  npx prisma migrate reset --force
  echo "✓ 数据库已重置"
fi

echo ""
echo "======================================"
echo "✅ 清理完成"
echo ""
echo "建议执行："
echo "  1. npm install"
echo "  2. npx prisma generate"
echo "  3. npm run build"
