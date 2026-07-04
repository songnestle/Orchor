#!/bin/bash
# 日志查看工具 - 快速查看各种日志

set -e

LOG_TYPE=${1:-"all"}

echo "📜 Orchor 日志查看工具"
echo "======================================"

case $LOG_TYPE in
  "next" | "app")
    echo "Next.js 应用日志 (最近 50 行):"
    echo "------------------------------------"
    if [ -f ".next/trace" ]; then
      tail -50 .next/trace
    else
      echo "⚠️  .next/trace 不存在"
    fi
    ;;

  "pm2")
    echo "PM2 日志 (最近 50 行):"
    echo "------------------------------------"
    pm2 logs orchor --lines 50 --nostream 2>/dev/null || echo "⚠️  PM2 未安装或未运行"
    ;;

  "nginx")
    echo "Nginx 日志 (最近 50 行):"
    echo "------------------------------------"
    if [ -f "/var/log/nginx/access.log" ]; then
      tail -50 /var/log/nginx/access.log
    else
      echo "⚠️  Nginx 日志不存在或无权限访问"
    fi
    ;;

  "error")
    echo "错误日志汇总:"
    echo "------------------------------------"
    echo "Next.js errors:"
    if [ -f ".next/trace" ]; then
      grep -i "error" .next/trace | tail -20 || echo "  无错误"
    else
      echo "  日志不存在"
    fi
    echo ""
    echo "PM2 errors:"
    pm2 logs orchor --err --lines 20 --nostream 2>/dev/null || echo "  PM2 未运行"
    ;;

  "all")
    echo "📊 所有日志概览:"
    echo ""
    echo "Next.js (最近 10 行):"
    if [ -f ".next/trace" ]; then
      tail -10 .next/trace
    else
      echo "  日志不存在"
    fi
    echo ""
    echo "PM2 (最近 10 行):"
    pm2 logs orchor --lines 10 --nostream 2>/dev/null || echo "  PM2 未运行"
    ;;

  "help" | "-h" | "--help")
    echo "用法: $0 [类型]"
    echo ""
    echo "类型:"
    echo "  all     - 查看所有日志概览（默认）"
    echo "  next    - 查看 Next.js 日志"
    echo "  pm2     - 查看 PM2 日志"
    echo "  nginx   - 查看 Nginx 日志"
    echo "  error   - 查看错误日志汇总"
    echo "  help    - 显示此帮助"
    ;;

  *)
    echo "❌ 未知日志类型: $LOG_TYPE"
    echo "运行 '$0 help' 查看帮助"
    exit 1
    ;;
esac

echo ""
echo "======================================"
