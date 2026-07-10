#!/bin/bash
# 持续重试 AI 生图直到成功

cd /Users/nestle/Orchor

echo "🔄 持续重试 AI 生图..."
echo "按 Ctrl+C 停止"
echo ""

SUCCESS=0
ATTEMPT=0

while [ $SUCCESS -lt 12 ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "第 $ATTEMPT 次尝试..."

  npx tsx scripts/generate-skill-images.ts 2>&1 | grep "✅ 已保存" | wc -l | read COUNT

  if [ -n "$COUNT" ] && [ "$COUNT" -gt 0 ]; then
    SUCCESS=$((SUCCESS + COUNT))
    echo "✅ 成功生成 $COUNT 张，总计 $SUCCESS/12"
  else
    echo "⏳ API 仍在限流，10秒后重试..."
  fi

  sleep 10
done

echo ""
echo "🎉 全部完成！12 张图片已生成"
