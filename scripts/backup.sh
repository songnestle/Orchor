#!/bin/bash
# 备份工具 - 备份数据库和配置

set -e

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

echo "💾 Orchor 备份工具"
echo "======================================"

# 创建备份目录
mkdir -p "$BACKUP_DIR"
echo "✓ 创建备份目录: $BACKUP_DIR"

# 备份数据库
echo ""
echo "📊 备份数据库..."
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
  # 导出数据库 schema
  npx prisma db pull --force --print > "$BACKUP_DIR/schema.prisma" 2>/dev/null || true
  echo "✓ 数据库 schema 已导出"

  # 导出数据（如果有 pg_dump）
  if command -v pg_dump &> /dev/null; then
    DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql" 2>/dev/null || echo "⚠️  pg_dump 失败"
    echo "✓ 数据库数据已导出"
  else
    echo "⚠️  pg_dump 未安装，跳过数据导出"
  fi
else
  echo "❌ 数据库连接失败，跳过备份"
fi

# 备份配置文件
echo ""
echo "📝 备份配置文件..."
FILES_TO_BACKUP=(
  ".env.local"
  "package.json"
  "package-lock.json"
  "prisma/schema.prisma"
  "next.config.js"
  "tsconfig.json"
)

for file in "${FILES_TO_BACKUP[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    echo "✓ $file"
  fi
done

# 备份关键目录
echo ""
echo "📁 备份关键文件..."
if [ -d "public" ]; then
  cp -r public "$BACKUP_DIR/"
  echo "✓ public/"
fi

# 创建备份清单
echo ""
echo "📋 创建备份清单..."
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
Orchor 备份信息
====================================
备份时间: $(date)
Node版本: $(node -v)
npm版本: $(npm -v)

备份内容:
- 数据库 schema
- 配置文件
- public 目录

恢复方法:
1. 复制 .env.local 到项目根目录
2. 恢复数据库: psql \$DATABASE_URL < database.sql
3. 运行 npm install
4. 运行 npx prisma migrate dev
EOF

echo "✓ BACKUP_INFO.txt"

# 压缩备份
echo ""
echo "🗜️  压缩备份..."
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"
echo "✓ 备份已压缩: ${BACKUP_DIR}.tar.gz"

# 清理临时目录
rm -rf "$BACKUP_DIR"

# 显示备份大小
BACKUP_SIZE=$(du -h "${BACKUP_DIR}.tar.gz" | cut -f1)
echo ""
echo "======================================"
echo "✅ 备份完成！"
echo "文件: ${BACKUP_DIR}.tar.gz"
echo "大小: $BACKUP_SIZE"
echo ""
echo "恢复命令: tar -xzf ${BACKUP_DIR}.tar.gz"
